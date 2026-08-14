const express = require("express");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
    createRequest,
    getMyRequests,
    getIncomingRequests,
    updateApprovalStatus,
    markRequestPaid,
    markRequestDelivered,
} = require("../controllers/serviceRequestController");

const router = express.Router();

router.post("/", protect, createRequest);
router.get("/my", protect, getMyRequests);
router.get("/incoming", protect, getIncomingRequests);
router.patch("/:id/approval", protect, updateApprovalStatus);
router.patch("/:id/payment", protect, markRequestPaid);
router.patch("/:id/delivery", protect, upload.single("proofImage"), markRequestDelivered);

module.exports = router;
