const mongoose = require("mongoose");

const needPostSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        customerName: {
            type: String,
            required: true,
            trim: true,
        },
        customerEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        contactNumber: {
            type: String,
            required: true,
            trim: true,
        },
        eventName: {
            type: String,
            required: true,
            trim: true,
        },
        eventDate: {
            type: Date,
            required: true,
            index: true,
        },
        deliveryLocation: {
            type: String,
            required: true,
            trim: true,
        },
        dishName: {
            type: String,
            required: true,
            trim: true,
        },
        preparationDetails: {
            type: String,
            required: true,
            trim: true,
        },
        servings: {
            type: Number,
            required: true,
            min: 1,
        },
        pricePerServing: {
            type: Number,
            required: true,
            min: 0,
        },
        additionalNotes: {
            type: String,
            default: "",
            trim: true,
        },
        status: {
            type: String,
            enum: ["open", "accepted", "cancelled"],
            default: "open",
            index: true,
        },
        acceptedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        acceptedCatering: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Catering",
            default: null,
        },
        serviceRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceRequest",
            default: null,
        },
        acceptedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

needPostSchema.index({ status: 1, eventDate: 1, createdAt: 1 });

module.exports = mongoose.model("NeedPost", needPostSchema);
