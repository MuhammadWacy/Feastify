const mongoose = require("mongoose");

const reviewItemSchema = new mongoose.Schema(
    {
        foodName: { type: String, required: true, trim: true },
        image: { type: String, default: "", trim: true },
        servings: { type: Number, required: true, min: 1 },
        details: { type: String, default: "", trim: true },
    },
    { _id: false }
);

const reviewImageSchema = new mongoose.Schema(
    {
        url: { type: String, required: true, trim: true },
        publicId: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const reviewSchema = new mongoose.Schema(
    {
        serviceRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceRequest",
            required: true,
            unique: true,
            index: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        catering: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Catering",
            required: true,
            index: true,
        },
        reviewerName: {
            type: String,
            required: true,
            trim: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2500,
        },
        images: {
            type: [reviewImageSchema],
            default: [],
        },
        deliveredAt: {
            type: Date,
            required: true,
        },
        totalServings: {
            type: Number,
            required: true,
            min: 1,
        },
        items: {
            type: [reviewItemSchema],
            default: [],
        },
        sourceType: {
            type: String,
            default: "direct",
            trim: true,
        },
        sellerReply: {
            type: String,
            default: "",
            trim: true,
            maxlength: 2000,
        },
        sellerRepliedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
