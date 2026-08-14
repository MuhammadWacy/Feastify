const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
    getMyListing,
    saveMyListing,
    setPublished,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
} = require("../controllers/sellerListingController");

router.get("/", protect, getMyListing);
router.post("/", protect, upload.single("bannerImage"), saveMyListing);
router.put("/publish", protect, setPublished);
router.post("/menu", protect, upload.single("image"), createMenuItem);
router.put("/menu/:id", protect, upload.single("image"), updateMenuItem);
router.delete("/menu/:id", protect, deleteMenuItem);

module.exports = router;
