import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error(
        "Please define the MONGODB_URI environment variable in .env.local"
    );
}

async function connectDB() {
    try {
        // Check if we already have a connection
        if (mongoose.connection.readyState === 1) {
            console.log("MongoDB already connected");
            return;
        }

        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI!);

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
}

export default connectDB;

