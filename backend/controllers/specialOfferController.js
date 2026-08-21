const Offer = require("../models/Offer");
const Catering = require("../models/Catering");
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

const deleteCloudinaryImage = async (publicId) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Cloudinary special offer delete failed:", error.message);
    }
};

const sellerOnly = (req, res) => {
    if (req.user.role !== "seller") {
        res.status(403).json({
            success: false,
            message: "Only sellers can manage special offers.",
        });
        return false;
    }
    return true;
};

const getSellerListing = async (sellerId) =>
    Catering.findOne({ owner: sellerId });

const getMyOffers = async (req, res) => {
    try {
        if (!sellerOnly(req, res)) return;

        const listing = await getSellerListing(req.user.id);
        if (!listing) {
            return res.status(200).json({ success: true, listing: null, offers: [] });
        }

        const offers = await Offer.find({ catering: listing._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, listing, offers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const validateOfferInput = (body) => {
    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const pricePerServing = Number(body.pricePerServing);
    const minServings = Number(body.minServings);
    const maxServings = Number(body.maxServings);
    const validUntil = new Date(body.validUntil);

    if (!title || !description) return "Offer name and details are required.";
    if (!Number.isFinite(pricePerServing) || pricePerServing <= 0) {
        return "Price per serving must be greater than zero.";
    }
    if (!Number.isInteger(minServings) || !Number.isInteger(maxServings) || minServings < 1) {
        return "A valid serving range is required.";
    }
    if (maxServings < minServings) return "Maximum servings must be at least the minimum servings.";
    if (Number.isNaN(validUntil.getTime())) return "A valid offer expiry date is required.";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    validUntil.setHours(23, 59, 59, 999);
    if (validUntil < today) return "Offer expiry date cannot be in the past.";

    return null;
};

const createOffer = async (req, res) => {
    try {
        if (!sellerOnly(req, res)) return;

        const listing = await getSellerListing(req.user.id);
        if (!listing) {
            return res.status(400).json({
                success: false,
                message: "Create your catering listing before adding special offers.",
            });
        }
        if (!listing.isPublished) {
            return res.status(400).json({
                success: false,
                message: "Publish your catering listing before adding customer-visible special offers.",
            });
        }

        const validationError = validateOfferInput(req.body);
        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }

        let image = "";
        let imagePublicId = "";
        if (req.file) {
            const uploaded = await uploadBuffer(req.file.buffer, "feastify/special-offers");
            image = uploaded.secure_url;
            imagePublicId = uploaded.public_id;
        }

        const expiryDate = new Date(req.body.validUntil);
        expiryDate.setHours(23, 59, 59, 999);

        const offer = await Offer.create({
            catering: listing._id,
            title: String(req.body.title).trim(),
            description: String(req.body.description).trim(),
            pricePerServing: Number(req.body.pricePerServing),
            minServings: Number(req.body.minServings),
            maxServings: Number(req.body.maxServings),
            validUntil: expiryDate,
            image,
            imagePublicId,
            isActive: true,
        });

        res.status(201).json({
            success: true,
            message: "Special offer published successfully.",
            offer,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateOffer = async (req, res) => {
    try {
        if (!sellerOnly(req, res)) return;

        const listing = await getSellerListing(req.user.id);
        if (!listing) {
            return res.status(404).json({ success: false, message: "Catering listing not found." });
        }

        const offer = await Offer.findOne({ _id: req.params.id, catering: listing._id });
        if (!offer) {
            return res.status(404).json({ success: false, message: "Special offer not found." });
        }

        const validationError = validateOfferInput(req.body);
        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }

        offer.title = String(req.body.title).trim();
        offer.description = String(req.body.description).trim();
        offer.pricePerServing = Number(req.body.pricePerServing);
        offer.minServings = Number(req.body.minServings);
        offer.maxServings = Number(req.body.maxServings);
        const expiryDate = new Date(req.body.validUntil);
        expiryDate.setHours(23, 59, 59, 999);
        offer.validUntil = expiryDate;
        offer.isActive = req.body.isActive !== "false";

        if (req.file) {
            const uploaded = await uploadBuffer(req.file.buffer, "feastify/special-offers");
            await deleteCloudinaryImage(offer.imagePublicId);
            offer.image = uploaded.secure_url;
            offer.imagePublicId = uploaded.public_id;
        }

        await offer.save();
        res.status(200).json({ success: true, message: "Special offer updated.", offer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteOffer = async (req, res) => {
    try {
        if (!sellerOnly(req, res)) return;
        const listing = await getSellerListing(req.user.id);
        if (!listing) {
            return res.status(404).json({ success: false, message: "Catering listing not found." });
        }

        const offer = await Offer.findOne({ _id: req.params.id, catering: listing._id });
        if (!offer) {
            return res.status(404).json({ success: false, message: "Special offer not found." });
        }

        await deleteCloudinaryImage(offer.imagePublicId);
        await offer.deleteOne();
        res.status(200).json({ success: true, message: "Special offer deleted." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getMyOffers, createOffer, updateOffer, deleteOffer };
