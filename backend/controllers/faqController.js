const mongoose = require("mongoose");
const Faq = require("../models/Faq");
const Catering = require("../models/Catering");

const customerOnly = (req, res) => {
    if (req.user.role !== "customer") {
        res.status(403).json({
            success: false,
            message: "Only customers can ask caterer questions.",
        });
        return false;
    }
    return true;
};

const sellerOnly = (req, res) => {
    if (req.user.role !== "seller") {
        res.status(403).json({
            success: false,
            message: "Only sellers can answer caterer questions.",
        });
        return false;
    }
    return true;
};

const getCateringFaqs = async (req, res) => {
    try {
        const { cateringId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(cateringId)) {
            return res.status(400).json({ success: false, message: "Invalid caterer ID." });
        }

        const catering = await Catering.findOne({
            _id: cateringId,
            isPublished: true,
            owner: { $ne: null },
        }).select("_id name");

        if (!catering) {
            return res.status(404).json({ success: false, message: "Caterer not found." });
        }

        const faqs = await Faq.find({ catering: cateringId })
            .populate("customer", "fullName")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            catering: { _id: catering._id, name: catering.name },
            count: faqs.length,
            faqs,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const askQuestion = async (req, res) => {
    try {
        if (!customerOnly(req, res)) return;

        const { cateringId } = req.params;
        const question = String(req.body.question || "").trim();

        if (!mongoose.Types.ObjectId.isValid(cateringId)) {
            return res.status(400).json({ success: false, message: "Invalid caterer ID." });
        }

        if (!question) {
            return res.status(400).json({ success: false, message: "Question is required." });
        }

        if (question.length > 500) {
            return res.status(400).json({ success: false, message: "Question must be 500 characters or less." });
        }

        const catering = await Catering.findOne({
            _id: cateringId,
            isPublished: true,
            owner: { $ne: null },
        });

        if (!catering) {
            return res.status(404).json({ success: false, message: "Caterer not found." });
        }

        const faq = await Faq.create({
            catering: catering._id,
            customer: req.user.id,
            question,
        });

        await faq.populate("customer", "fullName");

        res.status(201).json({
            success: true,
            message: "Your question has been posted for the caterer.",
            faq,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getSellerFaqs = async (req, res) => {
    try {
        if (!sellerOnly(req, res)) return;

        const catering = await Catering.findOne({ owner: req.user.id }).select("_id name");

        if (!catering) {
            return res.status(200).json({
                success: true,
                catering: null,
                count: 0,
                unansweredCount: 0,
                faqs: [],
            });
        }

        const faqs = await Faq.find({ catering: catering._id })
            .populate("customer", "fullName")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            catering,
            count: faqs.length,
            unansweredCount: faqs.filter((faq) => !faq.answer).length,
            faqs,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const answerQuestion = async (req, res) => {
    try {
        if (!sellerOnly(req, res)) return;

        const { faqId } = req.params;
        const answer = String(req.body.answer || "").trim();

        if (!mongoose.Types.ObjectId.isValid(faqId)) {
            return res.status(400).json({ success: false, message: "Invalid FAQ ID." });
        }

        if (!answer) {
            return res.status(400).json({ success: false, message: "Answer is required." });
        }

        if (answer.length > 1000) {
            return res.status(400).json({ success: false, message: "Answer must be 1000 characters or less." });
        }

        const catering = await Catering.findOne({ owner: req.user.id }).select("_id");

        if (!catering) {
            return res.status(404).json({ success: false, message: "Your catering listing was not found." });
        }

        const faq = await Faq.findOne({
            _id: faqId,
            catering: catering._id,
        });

        if (!faq) {
            return res.status(404).json({ success: false, message: "Question not found for your caterer profile." });
        }

        faq.answer = answer;
        faq.answeredAt = new Date();
        await faq.save();
        await faq.populate("customer", "fullName");

        res.status(200).json({
            success: true,
            message: "Answer posted successfully.",
            faq,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getCateringFaqs,
    askQuestion,
    getSellerFaqs,
    answerQuestion,
};
