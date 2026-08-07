const express = require("express");

const router = express.Router();

const {
    createRequest,
    getMyRequests,
    getIncomingRequests,
    getRequestById,
    respondToRequest,
    updateStatus,
} = require("../controllers/serviceRequestController");

const protect = require("../middleware/authMiddleware");

router.post("/", protect, createRequest);
router.get("/mine", protect, getMyRequests);
router.get("/incoming", protect, getIncomingRequests);
router.get("/:id", protect, getRequestById);
router.put("/:id/respond", protect, respondToRequest);
router.put("/:id/status", protect, updateStatus);

module.exports = router;
