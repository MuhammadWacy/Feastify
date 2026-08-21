const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
    createNeedPost,
    getMyNeedPosts,
    getOpenNeedPosts,
    getNeedPostDetails,
    acceptNeedPost,
    cancelNeedPost,
} = require("../controllers/needPostController");

const router = express.Router();

router.post("/", protect, createNeedPost);
router.get("/my", protect, getMyNeedPosts);
router.get("/open", protect, getOpenNeedPosts);
router.get("/:id", protect, getNeedPostDetails);
router.patch("/:id/accept", protect, acceptNeedPost);
router.patch("/:id/cancel", protect, cancelNeedPost);

module.exports = router;
