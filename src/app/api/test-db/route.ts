import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import logger from "@/lib/logger";

export async function GET(req: NextRequest) {
  logger.info("Testing database connection");

  try {
    const mongoose = await connectToDatabase();
    const connectionState = mongoose.connection.readyState;

    const stateMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
      99: "uninitialized",
    };

    const stateDescription =
      stateMap[connectionState as keyof typeof stateMap] || "unknown";

    logger.info(
      `MongoDB connection state: ${stateDescription} (${connectionState})`
    );

    return NextResponse.json({
      success: true,
      connectionState: stateDescription,
      dbName: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Database connection test failed: ${errorMessage}`);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect to database",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
