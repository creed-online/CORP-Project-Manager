import mongoose from "mongoose";

mongoose.set("bufferCommands", false);

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.warn("MONGO_URI is not set. Skipping MongoDB connection.");
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB: ", error.message);
        console.warn("Continuing without a database connection. Auth and data routes will fail until MongoDB is reachable.");
    }
}

export default connectDB;