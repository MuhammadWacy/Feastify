const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
    createRequest,
    getMyRequests,
    getIncomingRequests,
    updateApprovalStatus,
    markRequestPaid,
} = require("../controllers/serviceRequestController");

const router = express.Router();

router.post("/", protect, createRequest);
router.get("/my", protect, getMyRequests);
router.get("/incoming", protect, getIncomingRequests);
router.patch("/:id/approval", protect, updateApprovalStatus);
router.patch("/:id/payment", protect, markRequestPaid);

module.exports = router;
