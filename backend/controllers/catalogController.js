const Catering = require("../models/Catering");
const Offer = require("../models/Offer");
const MenuItem = require("../models/MenuItem");

// Get all catering listings for the feed
const getCaterings = async (req, res) => {
    try {
        const caterings = await Catering.find()
            .sort({ createdAt: -1 })
            .select("name bannerImage description cuisine category area rating phone email");

        res.status(200).json({
            success: true,
            count: caterings.length,
            caterings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get active special offers with their catering info
const getOffers = async (req, res) => {
    try {
        const filter = {
            validUntil: { $gte: new Date() },
        };

        const offers = await Offer.find(filter)
            .populate("catering", "name bannerImage area cuisine rating")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: offers.length,
            offers,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get the menu and service availability for a single catering
const getCateringMenu = async (req, res) => {
    try {
        const catering = await Catering.findById(req.params.id).select(
            "name bannerImage cuisine category area rating availableDays email"
        );

        if (!catering) {
            return res.status(404).json({
                success: false,
                message: "Catering not found",
            });
        }

        const items = await MenuItem.find({ catering: catering._id }).sort(
            { createdAt: 1 }
        );

        res.status(200).json({
            success: true,
            catering,
            items,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getCaterings,
    getOffers,
    getCateringMenu,
};