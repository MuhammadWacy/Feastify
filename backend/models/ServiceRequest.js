const mongoose = require("mongoose");

const requestedItemSchema = new mongoose.Schema(
    {
        foodName: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
            default: "",
            trim: true,
        },
        pricePerServing: {
            type: Number,
            required: true,
            min: 0,
        },
        servings: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    { _id: false }
);

const serviceRequestSchema = new mongoose.Schema(
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
        sellerName: {
            type: String,
            required: true,
            trim: true,
        },
        sellerEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        eventDate: {
            type: Date,
            required: true,
        },
        items: {
            type: [requestedItemSchema],
            validate: {
                validator: (items) => Array.isArray(items) && items.length > 0,
                message: "At least one dish is required",
            },
        },
        payableAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index: true,
        },
        rejectionReason: {
            type: String,
            trim: true,
            default: "",
        },
        sourceType: {
            type: String,
            enum: ["direct", "negotiation", "need_based"],
            default: "direct",
        },
        negotiation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Negotiation",
            default: null,
        },
        needPost: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "NeedPost",
            default: null,
        },
        needBasedDetails: {
            eventName: {
                type: String,
                default: "",
                trim: true,
            },
            preparationDetails: {
                type: String,
                default: "",
                trim: true,
            },
            deliveryLocation: {
                type: String,
                default: "",
                trim: true,
            },
            contactNumber: {
                type: String,
                default: "",
                trim: true,
            },
            additionalNotes: {
                type: String,
                default: "",
                trim: true,
            },
        },
        paymentStatus: {
            type: String,
            enum: ["unpaid", "paid"],
            default: "unpaid",
            index: true,
        },
        paymentMethod: {
            type: String,
            default: "",
            trim: true,
        },
        paymentReference: {
            type: String,
            default: "",
            trim: true,
        },
        paidAt: {
            type: Date,
            default: null,
        },
        orderProgressStatus: {
            type: String,
            enum: ["", "preparing", "on_the_way"],
            default: "",
            index: true,
        },
        orderProgressUpdatedAt: {
            type: Date,
            default: null,
        },
        deliveryStatus: {
            type: String,
            enum: ["not_delivered", "delivered"],
            default: "not_delivered",
            index: true,
        },
        deliveryProofImage: {
            type: String,
            default: "",
            trim: true,
        },
        deliveryProofPublicId: {
            type: String,
            default: "",
            trim: true,
        },
        deliveredAt: {
            type: Date,
            default: null,
        },
        deliveryNotificationSent: {
            type: Boolean,
            default: false,
        },
        deliveryNotificationId: {
            type: String,
            default: "",
            trim: true,
        },
        deliveryNotificationError: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
