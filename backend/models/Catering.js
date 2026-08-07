const mongoose = require("mongoose");

const cateringSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        bannerImage: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        cuisine: {
            type: String,
            trim: true,
            default: "",
        },

        category: {
            type: String,
            trim: true,
            default: "General",
        },

        area: {
            type: String,
            required: true,
            trim: true,
        },

        phone: {
            type: String,
            trim: true,
            default: "",
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        availableDays: {
            type: [String],
            enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            default: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Catering", cateringSchema);
