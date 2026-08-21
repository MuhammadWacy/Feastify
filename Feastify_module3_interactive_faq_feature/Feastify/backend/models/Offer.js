const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
    {
        catering: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Catering",
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        discount: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        validUntil: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Offer", offerSchema);