const mongoose = require("mongoose");

const negotiationItemSchema = new mongoose.Schema(
    {
        menuItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MenuItem",
            required: true,
        },
        foodName: { type: String, required: true, trim: true },
        image: { type: String, default: "", trim: true },
        unit: { type: String, default: "serving", trim: true },
        servings: { type: Number, required: true, min: 1 },
        listedPrice: { type: Number, required: true, min: 0 },
        currentPrice: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

const historyItemSchema = new mongoose.Schema(
    {
        foodName: { type: String, required: true, trim: true },
        pricePerServing: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

const negotiationHistorySchema = new mongoose.Schema(
    {
        updatedBy: {
            type: String,
            enum: ["customer", "seller"],
            required: true,
        },
        updatedByName: { type: String, required: true, trim: true },
        action: {
            type: String,
            enum: ["offer", "counter", "confirm", "accept", "reject"],
            default: "offer",
        },
        items: { type: [historyItemSchema], default: [] },
        updatedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const negotiationSchema = new mongoose.Schema(
    {
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
        },
        customerName: { type: String, required: true, trim: true },
        customerEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        sellerName: { type: String, required: true, trim: true },
        sellerEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        eventDate: { type: Date, required: true },
        items: {
            type: [negotiationItemSchema],
            validate: {
                validator: (items) => Array.isArray(items) && items.length > 0,
                message: "At least one dish is required",
            },
        },
        status: {
            type: String,
            enum: ["open", "customer_confirmed", "finalized", "rejected"],
            default: "open",
            index: true,
        },
        lastUpdatedBy: {
            type: String,
            enum: ["customer", "seller"],
            default: "customer",
        },
        history: { type: [negotiationHistorySchema], default: [] },
        serviceRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceRequest",
            default: null,
        },
        finalizedAt: { type: Date, default: null },
        rejectedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Negotiation", negotiationSchema);
