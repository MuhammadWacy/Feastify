const mongoose = require("mongoose");

let connectionPromise = null;

const connectDB = async () => {
    // 1 = connected. Reuse the warm serverless/local connection.
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    // If a connection attempt is already running, reuse that same promise.
    if (connectionPromise) {
        return connectionPromise;
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not configured.");
    }

    console.log("Connecting to MongoDB...");

    connectionPromise = mongoose
        .connect(process.env.MONGO_URI)
        .then((mongooseInstance) => {
            console.log("✅ MongoDB Connected Successfully");
            return mongooseInstance.connection;
        })
        .catch((error) => {
            connectionPromise = null;
            console.error("❌ MongoDB Connection Failed");
            console.error(error);
            throw error;
        });

    return connectionPromise;
};

module.exports = connectDB;
