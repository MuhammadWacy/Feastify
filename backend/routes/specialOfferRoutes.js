const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
    getMyOffers,
    createOffer,
    updateOffer,
    deleteOffer,
} = require("../controllers/specialOfferController");

router.get("/mine", protect, getMyOffers);
router.post("/", protect, upload.single("image"), createOffer);
router.put("/:id", protect, upload.single("image"), updateOffer);
router.delete("/:id", protect, deleteOffer);

module.exports = router;
