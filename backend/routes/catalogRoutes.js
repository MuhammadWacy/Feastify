const express = require("express");

const router = express.Router();

const {
    getCaterings,
    getOffers,
    getCateringMenu,
} = require("../controllers/catalogController");

const protect = require("../middleware/authMiddleware");

router.get("/caterings", protect, getCaterings);
router.get("/caterings/:id/menu", protect, getCateringMenu);
router.get("/offers", protect, getOffers);

module.exports = router;