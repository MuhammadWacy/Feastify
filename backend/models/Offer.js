const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
    {
        catering: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Catering",
            required: true,
            index: true,
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
        image: {
            type: String,
            default: "",
            trim: true,
        },
        imagePublicId: {
            type: String,
            default: "",
            trim: true,
        },
        pricePerServing: {
            type: Number,
            required: true,
            min: 0,
        },
        minServings: {
            type: Number,
            required: true,
            min: 1,
        },
        maxServings: {
            type: Number,
            required: true,
            min: 1,
        },
        validUntil: {
            type: Date,
            required: true,
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Offer", offerSchema);
