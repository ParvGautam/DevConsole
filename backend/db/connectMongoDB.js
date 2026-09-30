import mongoose from "mongoose";
import dns from "dns";

// Only set custom DNS locally if needed; avoid inside cloud serverless environments
if (process.env.NODE_ENV !== "production") {
    try {
        dns.setServers(["8.8.8.8", "8.8.4.4"]);
    } catch (e) {
        console.warn("Could not set DNS servers:", e.message);
    }
}

const connectMongoDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connection to mongoDB: ${error.message}`);
        throw error;
    }
};

export default connectMongoDB;