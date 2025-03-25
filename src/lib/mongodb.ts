import mongoose from "mongoose";
import logger from "./logger";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  logger.error("MONGODB_URI is not defined in environment variables");
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

let cached = global.mongoose || { conn: null, promise: null };

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  logger.debug("Connecting to MongoDB database...");

  if (cached.conn) {
    logger.debug("Using cached MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    logger.info(
      `Establishing new MongoDB connection to ${MONGODB_URI!.split("@")[1]}`
    );

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        logger.info("Successfully connected to MongoDB");
        return mongoose;
      })
      .catch((error) => {
        logger.error(`MongoDB connection error: ${error.message}`);
        // Log more details about the error
        if (error.name === "MongoServerError") {
          logger.error(`MongoDB error code: ${error.code}`);
          if (error.code === 18) {
            logger.error(
              "Authentication failed. Check username and password in MONGODB_URI"
            );
          }
        }
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    logger.error("Failed to connect to MongoDB");
    cached.promise = null; // Reset the promise so we can retry next time
    throw error;
  }
}

export default connectToDatabase;
