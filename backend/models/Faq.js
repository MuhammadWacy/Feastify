const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
    {
        catering: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Catering",
            required: true,
            index: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        question: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        answer: {
            type: String,
            trim: true,
            default: "",
            maxlength: 1000,
        },
        answeredAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Faq", faqSchema);
