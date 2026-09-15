import mongoose from "mongoose";

/**
 * Utility: Database connection manager using Mongoose
 */
export const connectDB = async (uri?: string): Promise<typeof mongoose> => {
  const mongoUri =
    uri || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/users-api";

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`🍃 Connected to MongoDB at ${mongoUri}`);
    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
};

/**
 * Disconnect from MongoDB gracefully
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log("🍃 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ MongoDB disconnect error:", error);
    throw error;
  }
};
