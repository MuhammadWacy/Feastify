const express = require("express");

const router = express.Router();

const { listCaterers, getCaterer } = require("../controllers/catererController");
const protect = require("../middleware/authMiddleware");

router.get("/", protect, listCaterers);
router.get("/:id", protect, getCaterer);

module.exports = router;
