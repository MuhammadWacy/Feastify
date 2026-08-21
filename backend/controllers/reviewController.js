const Review = require("../models/Review");
const ServiceRequest = require("../models/ServiceRequest");
const User = require("../models/User");
const Catering = require("../models/Catering");
const MenuItem = require("../models/MenuItem");
const Offer = require("../models/Offer");
const cloudinary = require("../config/cloudinary");

const uploadBuffer = (buffer, folder) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "image" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(buffer);
    });

const publicReviewerName = (fullName) => {
    const parts = String(fullName || "Customer")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length <= 1) return parts[0] || "Customer";
    return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
};

const refreshCateringRating = async (cateringId) => {
    const summary = await Review.aggregate([
        { $match: { catering: cateringId } },
        {
            $group: {
                _id: "$catering",
                average: { $avg: "$rating" },
                count: { $sum: 1 },
            },
        },
    ]);

    const average = summary.length ? Number(summary[0].average.toFixed(1)) : 0;
    await Catering.findByIdAndUpdate(cateringId, { rating: average });
    return { average, count: summary[0]?.count || 0 };
};

const buildReviewItems = async (request) => {
    const menuItems = await MenuItem.find({ catering: request.catering }).select(
        "name description image"
    );
    const menuByName = new Map(
        menuItems.map((item) => [item.name.trim().toLowerCase(), item])
    );

    let specialOffer = null;
    if (request.sourceType === "special_offer" && request.specialOffer) {
        specialOffer = await Offer.findById(request.specialOffer).select(
            "title description image"
        );
    }

    return request.items.map((item) => {
        const matchingMenuItem = menuByName.get(item.foodName.trim().toLowerCase());
        let details = matchingMenuItem?.description || "";

        if (!details && specialOffer) {
            details = specialOffer.description || "";
        }

        if (!details && request.sourceType === "need_based") {
            details = request.needBasedDetails?.preparationDetails || "Custom cooking request";
        }

        return {
            foodName: item.foodName,
            image: item.image || matchingMenuItem?.image || specialOffer?.image || "",
            servings: item.servings,
            details,
        };
    });
};

const postReview = async (req, res) => {
    try {
        const customer = await User.findById(req.user.id);
        if (!customer || customer.role !== "customer") {
            return res.status(403).json({
                success: false,
                message: "Only customers can post reviews.",
            });
        }

        const serviceRequestId = String(req.body.serviceRequestId || "").trim();
        const rating = Number(req.body.rating);
        const description = String(req.body.description || "").trim();

        if (!serviceRequestId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "A delivered order and a rating from 1 to 5 are required.",
            });
        }

        if (!description) {
            return res.status(400).json({
                success: false,
                message: "Please write a review description.",
            });
        }

        if ((req.files || []).length > 5) {
            return res.status(400).json({
                success: false,
                message: "You can upload up to 5 review images.",
            });
        }

        const request = await ServiceRequest.findOne({
            _id: serviceRequestId,
            customer: req.user.id,
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        if (request.deliveryStatus !== "delivered" || !request.deliveredAt) {
            return res.status(400).json({
                success: false,
                message: "A review can only be posted after delivery verification is completed.",
            });
        }

        const existing = await Review.findOne({ serviceRequest: request._id });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this delivered order.",
            });
        }

        const uploadedImages = [];
        for (const file of req.files || []) {
            const result = await uploadBuffer(file.buffer, "feastify/reviews");
            uploadedImages.push({
                url: result.secure_url,
                publicId: result.public_id,
            });
        }

        const items = await buildReviewItems(request);
        const totalServings = request.items.reduce(
            (sum, item) => sum + Number(item.servings || 0),
            0
        );

        const review = await Review.create({
            serviceRequest: request._id,
            customer: request.customer,
            seller: request.seller,
            catering: request.catering,
            reviewerName: publicReviewerName(customer.fullName),
            rating,
            description,
            images: uploadedImages,
            deliveredAt: request.deliveredAt,
            totalServings,
            items,
            sourceType: request.sourceType,
        });

        const ratingSummary = await refreshCateringRating(request.catering);

        return res.status(201).json({
            success: true,
            message: "Review posted successfully.",
            review,
            ratingSummary,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this delivered order.",
            });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getMyReviews = async (req, res) => {
    try {
        const customer = await User.findById(req.user.id);
        if (!customer || customer.role !== "customer") {
            return res.status(403).json({ success: false, message: "Only customers can view their reviews." });
        }

        const reviews = await Review.find({ customer: req.user.id })
            .select("serviceRequest rating createdAt")
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, reviews });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getCateringReviews = async (req, res) => {
    try {
        const catering = await Catering.findOne({
            _id: req.params.cateringId,
            isPublished: true,
            owner: { $ne: null },
        }).select("_id");

        if (!catering) {
            return res.status(404).json({ success: false, message: "Caterer profile not found." });
        }

        const reviews = await Review.find({ catering: catering._id })
            .select(
                "reviewerName rating description images deliveredAt totalServings items sourceType sellerReply sellerRepliedAt createdAt"
            )
            .sort({ createdAt: -1 });

        const ratingSummary = reviews.length
            ? {
                  average: Number(
                      (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                  ),
                  count: reviews.length,
              }
            : { average: 0, count: 0 };

        return res.status(200).json({ success: true, reviews, ratingSummary });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getSellerReviews = async (req, res) => {
    try {
        const seller = await User.findById(req.user.id);
        if (!seller || seller.role !== "seller") {
            return res.status(403).json({ success: false, message: "Only caterers can manage reviews." });
        }

        const reviews = await Review.find({ seller: req.user.id })
            .select(
                "reviewerName rating description images deliveredAt totalServings items sourceType sellerReply sellerRepliedAt createdAt catering"
            )
            .populate("catering", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, reviews });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const replyToReview = async (req, res) => {
    try {
        const seller = await User.findById(req.user.id);
        if (!seller || seller.role !== "seller") {
            return res.status(403).json({ success: false, message: "Only caterers can reply to reviews." });
        }

        const reply = String(req.body.reply || "").trim();
        if (!reply) {
            return res.status(400).json({ success: false, message: "Please write a reply first." });
        }
        if (reply.length > 2000) {
            return res.status(400).json({ success: false, message: "Reply must be 2000 characters or fewer." });
        }

        const review = await Review.findOne({
            _id: req.params.reviewId,
            seller: req.user.id,
        });

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }

        review.sellerReply = reply;
        review.sellerRepliedAt = new Date();
        await review.save();

        return res.status(200).json({
            success: true,
            message: "Reply saved successfully.",
            review,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    postReview,
    getMyReviews,
    getCateringReviews,
    getSellerReviews,
    replyToReview,
};
