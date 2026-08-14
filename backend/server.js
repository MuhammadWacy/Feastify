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

const startServer = async () => {
    try {
        await connectDB();

        const app = express();

        app.use(cors());
        app.use(express.json());

        app.use("/api/auth", authRoutes);
        app.use("/api/payment", paymentRoutes);
        app.use("/api/catalog", catalogRoutes);
        app.use("/api/seller/listing", sellerListingRoutes);
        app.use("/api/service-requests", serviceRequestRoutes);
        app.use("/api/negotiations", negotiationRoutes);
        app.use("/api/chat", chatRoutes);
        app.use("/api/favorites", favoriteRoutes);

        app.get("/", (req, res) => {
            res.json({
                success: true,
                message: "Welcome to Feastify Backend!",
            });
        });

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Server failed to start:", error);
    }
};

startServer();
