const mongoose = require("mongoose");

const complaintImageSchema = new mongoose.Schema(
    {
        url: { type: String, required: true, trim: true },
        publicId: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const complaintItemSchema = new mongoose.Schema(
    {
        foodName: { type: String, required: true, trim: true },
        pricePerServing: { type: Number, required: true, min: 0 },
        servings: { type: Number, required: true, min: 1 },
    },
    { _id: false }
);

const complaintSchema = new mongoose.Schema(
    {
        serviceRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceRequest",
            required: true,
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
        },
        customerName: { type: String, required: true, trim: true },
        customerEmail: { type: String, required: true, trim: true },
        sellerName: { type: String, required: true, trim: true },
        category: {
            type: String,
            enum: [
                "Food Quality",
                "Wrong or Missing Items",
                "Late Delivery",
                "Packaging Issue",
                "Quantity or Serving Issue",
                "Other",
            ],
            required: true,
        },
        details: { type: String, required: true, trim: true, maxlength: 3000 },
        images: { type: [complaintImageSchema], default: [] },
        eventDate: { type: Date, required: true },
        deliveredAt: { type: Date, required: true },
        amountPaid: { type: Number, required: true, min: 0 },
        items: { type: [complaintItemSchema], default: [] },
        totalServings: { type: Number, required: true, min: 1 },
        sourceType: { type: String, default: "direct" },
        deliveryLocation: { type: String, default: "", trim: true },
        contactNumber: { type: String, default: "", trim: true },
    },
    { timestamps: true }
);

complaintSchema.index({ serviceRequest: 1, customer: 1 }, { unique: true });

module.exports = mongoose.model("Complaint", complaintSchema);
