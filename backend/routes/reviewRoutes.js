const express = require("express");

const router = express.Router();
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
    postReview,
    getMyReviews,
    getCateringReviews,
    getSellerReviews,
    replyToReview,
} = require("../controllers/reviewController");

router.post("/", protect, upload.array("images", 5), postReview);
router.get("/my", protect, getMyReviews);
router.get("/catering/:cateringId", protect, getCateringReviews);
router.get("/seller", protect, getSellerReviews);
router.patch("/:reviewId/reply", protect, replyToReview);

module.exports = router;
