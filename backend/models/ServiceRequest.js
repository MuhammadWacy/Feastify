const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
    {
        foodName: {
            type: String,
            required: true,
            trim: true,
        },

        image: {
            type: String,
            required: false,
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
        },

        caterer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
        },

        customerEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        sellerEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        sellerName: {
            type: String,
            required: true,
            trim: true,
        },

        eventDate: {
            type: Date,
            required: true,
        },

        location: {
            type: String,
            required: true,
            trim: true,
        },

        guests: {
            type: Number,
            required: true,
            min: 1,
        },

        items: {
            type: [itemSchema],
            required: true,
            validate: {
                validator: (items) => items.length > 0,
                message: "At least one item must be selected",
            },
        },

        estimatedPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: [
                "pending",
                "accepted",
                "rejected",
                "preparing",
                "out_for_delivery",
                "completed",
            ],
            default: "pending",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
