const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
    {
        catering: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Catering",
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        image: {
            type: String,
            trim: true,
            default: "",
        },

        imagePublicId: {
            type: String,
            trim: true,
            default: "",
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        unit: {
            type: String,
            trim: true,
            default: "serving",
        },

        minQty: {
            type: Number,
            required: true,
            min: 1,
        },

        maxQty: {
            type: Number,
            required: true,
            min: 1,
        },

        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);
