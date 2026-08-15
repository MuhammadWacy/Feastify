const express = require("express");
const protect = require("../middleware/authMiddleware");
const { sendMessage } = require("../controllers/chatController");

const router = express.Router();

router.post("/message", protect, sendMessage);

module.exports = router;
