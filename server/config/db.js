import mongoose from "mongoose";

/**
 * Connects to MongoDB and wires up connection-level logging.
 * Exits the process on failure so the container/orchestrator can restart it,
 * instead of leaving the app running with a dead DB connection.
 */
export const connectDB = async () => {
  mongoose.set("strictQuery", true);

  mongoose.connection.on("connected", () => {
    console.log("[MongoDB] connected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("[MongoDB] connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[MongoDB] disconnected");
  });

  try {
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 10000,
    });
  } catch (err) {
    console.error("[MongoDB] initial connection failed:", err.message);
    process.exit(1);
  }
};

export default connectDB;
