const express = require("express");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { fileComplaint, getMyComplaints, getSellerComplaints } = require("../controllers/complaintController");

const router = express.Router();

router.post("/", protect, upload.array("images", 5), fileComplaint);
router.get("/my", protect, getMyComplaints);
router.get("/seller", protect, getSellerComplaints);

module.exports = router;
