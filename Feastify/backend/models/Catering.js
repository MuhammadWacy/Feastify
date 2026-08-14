const mongoose = require("mongoose");

const cateringSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        bannerImage: {
            type: String,
            trim: true,
            default: "",
        },

        bannerImagePublicId: {
            type: String,
            trim: true,
            default: "",
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
            required: true,
            trim: true,
            lowercase: true,
        },

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        availableDays: {
            type: [String],
            enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            default: [],
        },

        negotiationEnabled: {
            type: Boolean,
            default: true,
        },

        isPublished: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

cateringSchema.index(
    { owner: 1 },
    {
        unique: true,
        partialFilterExpression: { owner: { $type: "objectId" } },
    }
);

module.exports = mongoose.model("Catering", cateringSchema);
