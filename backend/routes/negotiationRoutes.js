const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
    createNegotiation,
    getMyNegotiations,
    getIncomingNegotiations,
    updateNegotiationOffer,
    confirmSellerCounter,
    finalizeNegotiation,
    rejectNegotiation,
} = require("../controllers/negotiationController");

const router = express.Router();

router.post("/", protect, createNegotiation);
router.get("/my", protect, getMyNegotiations);
router.get("/incoming", protect, getIncomingNegotiations);
router.patch("/:id/offer", protect, updateNegotiationOffer);
router.patch("/:id/confirm", protect, confirmSellerCounter);
router.patch("/:id/finalize", protect, finalizeNegotiation);
router.patch("/:id/reject", protect, rejectNegotiation);

module.exports = router;
