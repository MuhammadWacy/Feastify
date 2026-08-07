const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const catalogRoutes = require("./routes/catalogRoutes");

dotenv.config();

const startServer = async () => {
    try {
        // Connect to MongoDB first
        await connectDB();

        const app = express();

        // Middleware
        app.use(cors());
        app.use(express.json());

        // Routes
        app.use("/api/auth", authRoutes);
        app.use("/api/catalog", catalogRoutes);

        // Test Route
        app.get("/", (req, res) => {
            res.json({
                success: true,
                message: "Welcome to Feastify Backend!"
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