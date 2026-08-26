const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/database");

const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const catalogRoutes = require("./routes/catalogRoutes");
const sellerListingRoutes = require("./routes/sellerListingRoutes");
const serviceRequestRoutes = require("./routes/serviceRequestRoutes");
const negotiationRoutes = require("./routes/negotiationRoutes");
const chatRoutes = require("./routes/chatRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const faqRoutes = require("./routes/faqRoutes");
const needPostRoutes = require("./routes/needPostRoutes");
const specialOfferRoutes = require("./routes/specialOfferRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// In Vercel, the Express app runs as a serverless function rather than a
// permanently listening process. This middleware makes sure MongoDB is ready
// before any API route executes. connectDB() is connection-aware, so warm
// serverless invocations reuse the existing Mongoose connection.
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database connection failed:", error);
        res.status(500).json({
            success: false,
            message: "Database connection failed.",
        });
    }
});

app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/seller/listing", sellerListingRoutes);
app.use("/api/service-requests", serviceRequestRoutes);
app.use("/api/negotiations", negotiationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/needs", needPostRoutes);
app.use("/api/special-offers", specialOfferRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Feastify Backend!",
    });
});

// Local development still behaves exactly as before.
if (require.main === module) {
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}

// Vercel detects/uses the exported Express application.
module.exports = app;
