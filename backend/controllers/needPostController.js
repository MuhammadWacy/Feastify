const NeedPost = require("../models/NeedPost");
const ServiceRequest = require("../models/ServiceRequest");
const User = require("../models/User");
const Catering = require("../models/Catering");

const parseEventDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const createNeedPost = async (req, res) => {
    try {
        const customer = await User.findById(req.user.id);

        if (!customer || customer.role !== "customer") {
            return res.status(403).json({
                success: false,
                message: "Only customers can post catering needs.",
            });
        }

        const {
            eventName,
            eventDate,
            deliveryLocation,
            contactNumber,
            dishName,
            preparationDetails,
            servings,
            pricePerServing,
            additionalNotes = "",
        } = req.body;

        const parsedEventDate = parseEventDate(eventDate);
        const cleanServings = Number(servings);
        const cleanPrice = Number(pricePerServing);

        if (
            !eventName ||
            !parsedEventDate ||
            !deliveryLocation ||
            !contactNumber ||
            !dishName ||
            !preparationDetails ||
            !Number.isFinite(cleanServings) ||
            cleanServings < 1 ||
            !Number.isFinite(cleanPrice) ||
            cleanPrice < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required need details with valid servings and price.",
            });
        }

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        if (parsedEventDate < endOfToday) {
            return res.status(400).json({
                success: false,
                message: "Event date must be a future date.",
            });
        }

        const need = await NeedPost.create({
            customer: customer._id,
            customerName: customer.fullName,
            customerEmail: customer.email,
            contactNumber: String(contactNumber).trim(),
            eventName: String(eventName).trim(),
            eventDate: parsedEventDate,
            deliveryLocation: String(deliveryLocation).trim(),
            dishName: String(dishName).trim(),
            preparationDetails: String(preparationDetails).trim(),
            servings: cleanServings,
            pricePerServing: cleanPrice,
            additionalNotes: String(additionalNotes || "").trim(),
        });

        res.status(201).json({
            success: true,
            message: "Your catering need has been posted for caterers.",
            need,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMyNeedPosts = async (req, res) => {
    try {
        const customer = await User.findById(req.user.id);
        if (!customer || customer.role !== "customer") {
            return res.status(403).json({
                success: false,
                message: "Only customers can view their posted needs.",
            });
        }

        const needs = await NeedPost.find({ customer: req.user.id })
            .populate("acceptedCatering", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, needs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getOpenNeedPosts = async (req, res) => {
    try {
        const seller = await User.findById(req.user.id);
        if (!seller || seller.role !== "seller") {
            return res.status(403).json({
                success: false,
                message: "Only caterers can browse customer needs.",
            });
        }

        const needs = await NeedPost.find({ status: "open" })
            .sort({ eventDate: 1, createdAt: 1 });

        res.status(200).json({ success: true, needs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getNeedPostDetails = async (req, res) => {
    try {
        const seller = await User.findById(req.user.id);
        if (!seller || seller.role !== "seller") {
            return res.status(403).json({
                success: false,
                message: "Only caterers can view customer need details.",
            });
        }

        const need = await NeedPost.findById(req.params.id);
        if (!need) {
            return res.status(404).json({
                success: false,
                message: "Customer need not found.",
            });
        }

        res.status(200).json({ success: true, need });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const acceptNeedPost = async (req, res) => {
    try {
        const seller = await User.findById(req.user.id);
        if (!seller || seller.role !== "seller") {
            return res.status(403).json({
                success: false,
                message: "Only caterers can confirm customer needs.",
            });
        }

        const catering = await Catering.findOne({ owner: req.user.id });
        if (!catering) {
            return res.status(400).json({
                success: false,
                message: "Create your caterer listing before confirming a customer need.",
            });
        }

        // Claim the open post atomically so two caterers cannot accept it at the same time.
        const need = await NeedPost.findOneAndUpdate(
            { _id: req.params.id, status: "open" },
            {
                $set: {
                    status: "accepted",
                    acceptedBy: seller._id,
                    acceptedCatering: catering._id,
                    acceptedAt: new Date(),
                },
            },
            { new: true }
        );

        if (!need) {
            return res.status(409).json({
                success: false,
                message: "This customer need is no longer available.",
            });
        }

        try {
            const payableAmount = need.pricePerServing * need.servings;

            const serviceRequest = await ServiceRequest.create({
                customer: need.customer,
                seller: seller._id,
                catering: catering._id,
                customerName: need.customerName,
                customerEmail: need.customerEmail,
                sellerName: catering.name,
                sellerEmail: seller.email,
                eventDate: need.eventDate,
                items: [
                    {
                        foodName: need.dishName,
                        image: "",
                        pricePerServing: need.pricePerServing,
                        servings: need.servings,
                    },
                ],
                payableAmount,
                approvalStatus: "approved",
                sourceType: "need_based",
                needPost: need._id,
                needBasedDetails: {
                    eventName: need.eventName,
                    preparationDetails: need.preparationDetails,
                    deliveryLocation: need.deliveryLocation,
                    contactNumber: need.contactNumber,
                    additionalNotes: need.additionalNotes,
                },
            });

            need.serviceRequest = serviceRequest._id;
            await need.save();

            return res.status(200).json({
                success: true,
                message: "Customer need confirmed. The customer can now pay from Live Order Tracking.",
                need,
                request: serviceRequest,
            });
        } catch (createError) {
            // Release the post if creating the integrated order fails.
            need.status = "open";
            need.acceptedBy = null;
            need.acceptedCatering = null;
            need.acceptedAt = null;
            await need.save();
            throw createError;
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const cancelNeedPost = async (req, res) => {
    try {
        const need = await NeedPost.findOne({
            _id: req.params.id,
            customer: req.user.id,
        });

        if (!need) {
            return res.status(404).json({
                success: false,
                message: "Customer need not found.",
            });
        }

        if (need.status !== "open") {
            return res.status(400).json({
                success: false,
                message: "Only open customer needs can be cancelled.",
            });
        }

        need.status = "cancelled";
        await need.save();

        res.status(200).json({
            success: true,
            message: "Customer need cancelled.",
            need,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createNeedPost,
    getMyNeedPosts,
    getOpenNeedPosts,
    getNeedPostDetails,
    acceptNeedPost,
    cancelNeedPost,
};
