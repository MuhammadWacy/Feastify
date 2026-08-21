const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
    getCateringFaqs,
    askQuestion,
    getSellerFaqs,
    answerQuestion,
} = require("../controllers/faqController");

const router = express.Router();

router.get("/catering/:cateringId", protect, getCateringFaqs);
router.post("/catering/:cateringId", protect, askQuestion);
router.get("/seller/mine", protect, getSellerFaqs);
router.patch("/:faqId/answer", protect, answerQuestion);

module.exports = router;
