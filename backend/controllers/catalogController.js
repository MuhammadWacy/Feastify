const Catering = require("../models/Catering");
const Offer = require("../models/Offer");
const MenuItem = require("../models/MenuItem");

const getCaterings = async (req, res) => {
    try {
        const caterings = await Catering.find({
            isPublished: true,
            owner: { $ne: null },
        })
            .sort({ createdAt: -1 })
            .select(
                "name bannerImage description cuisine category area rating phone email availableDays negotiationEnabled owner"
            );

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

const getOffers = async (req, res) => {
    try {
        const offers = await Offer.find({
            validUntil: { $gte: new Date() },
        })
            .populate({
                path: "catering",
                match: { isPublished: true, owner: { $ne: null } },
                select: "name bannerImage area cuisine rating negotiationEnabled",
            })
            .sort({ createdAt: -1 });

        const publishedOffers = offers.filter((offer) => offer.catering);

        res.status(200).json({
            success: true,
            count: publishedOffers.length,
            offers: publishedOffers,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getCateringMenu = async (req, res) => {
    try {
        const catering = await Catering.findOne({
            _id: req.params.id,
            isPublished: true,
        }).select(
            "name bannerImage description cuisine category area rating availableDays email phone negotiationEnabled owner"
        );

        if (!catering) {
            return res.status(404).json({
                success: false,
                message: "Catering listing not found",
            });
        }

        const items = await MenuItem.find({
            catering: catering._id,
            isAvailable: true,
        }).sort({ createdAt: 1 });

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

const getCateringProfile = async (req, res) => {
    try {
        const catering = await Catering.findOne({
            _id: req.params.id,
            isPublished: true,
            owner: { $ne: null },
        })
            .select(
                "name bannerImage description cuisine category area rating phone email availableDays negotiationEnabled owner createdAt"
            )
            .populate("owner", "fullName createdAt");

        if (!catering) {
            return res.status(404).json({
                success: false,
                message: "Caterer profile not found",
            });
        }

        const items = await MenuItem.find({
            catering: catering._id,
            isAvailable: true,
        }).sort({ createdAt: 1 });

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
    getCateringProfile,
};
