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

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        unit: {
            type: String,
            trim: true,
            default: "item",
        },

        minQty: {
            type: Number,
            default: 1,
            min: 0,
        },

        maxQty: {
            type: Number,
            default: 10,
            min: 1,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);