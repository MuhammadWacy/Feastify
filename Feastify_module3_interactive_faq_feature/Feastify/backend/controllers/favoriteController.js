const mongoose = require("mongoose");
const User = require("../models/User");
const Catering = require("../models/Catering");

const ensureCustomer = (req, res) => {
    if (req.user.role !== "customer") {
        res.status(403).json({
            success: false,
            message: "Favorites are available to customers only.",
        });
        return false;
    }

    return true;
};

const getFavorites = async (req, res) => {
    try {
        if (!ensureCustomer(req, res)) return;

        const user = await User.findById(req.user.id)
            .select("favoriteCaterers")
            .populate({
                path: "favoriteCaterers",
                match: {
                    isPublished: true,
                    owner: { $ne: null },
                },
                select: "name bannerImage description cuisine category area rating phone email availableDays negotiationEnabled owner",
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const favorites = (user.favoriteCaterers || []).filter(Boolean);

        res.status(200).json({
            success: true,
            count: favorites.length,
            favorites,
            favoriteIds: favorites.map((item) => String(item._id)),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const addFavorite = async (req, res) => {
    try {
        if (!ensureCustomer(req, res)) return;

        const { cateringId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(cateringId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid caterer ID.",
            });
        }

        const catering = await Catering.findOne({
            _id: cateringId,
            isPublished: true,
            owner: { $ne: null },
        });

        if (!catering) {
            return res.status(404).json({
                success: false,
                message: "Caterer listing not found.",
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $addToSet: { favoriteCaterers: catering._id } },
            { new: true }
        ).select("favoriteCaterers");

        res.status(200).json({
            success: true,
            message: `${catering.name} added to favorites.`,
            favoriteIds: (user.favoriteCaterers || []).map((id) => String(id)),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const removeFavorite = async (req, res) => {
    try {
        if (!ensureCustomer(req, res)) return;

        const { cateringId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(cateringId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid caterer ID.",
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { favoriteCaterers: cateringId } },
            { new: true }
        ).select("favoriteCaterers");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Removed from favorites.",
            favoriteIds: (user.favoriteCaterers || []).map((id) => String(id)),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getFavorites,
    addFavorite,
    removeFavorite,
};
