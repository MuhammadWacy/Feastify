const User = require("../models/User");

// List registered caterers (sellers) — minimal fields only.
// Placeholder until the Caterer Listings feature provides full service data.
const listCaterers = async (req, res) => {
    try {
        const caterers = await User.find({ role: "seller" }).select(
            "fullName area address email phone"
        );

        res.status(200).json({
            success: true,
            caterers,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


const getCaterer = async (req, res) => {
    try {
        const caterer = await User.findOne({
            _id: req.params.id,
            role: "seller",
        }).select("fullName area address email phone");

        if (!caterer) {
            return res.status(404).json({
                success: false,
                message: "Caterer not found",
            });
        }

        res.status(200).json({
            success: true,
            caterer,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    listCaterers,
    getCaterer,
};
