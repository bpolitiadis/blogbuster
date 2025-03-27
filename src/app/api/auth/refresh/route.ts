import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
} from "@/lib/auth";
import { Error } from "mongoose";

export async function POST(req: NextRequest) {
  try {
    // Debug logging for environment variables
    console.log("Refresh endpoint environment check:", {
      JWT_SECRET: process.env.JWT_SECRET ? "defined" : "undefined",
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET
        ? "defined"
        : "undefined",
      NODE_ENV: process.env.NODE_ENV,
    });

    // Get refresh token from cookie
    const refreshToken = req.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      console.log("No refresh token found in cookies");
      return NextResponse.json(
        { error: "Refresh token not found" },
        { status: 401 }
      );
    }

    console.log("Found refresh token, attempting verification");

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      console.log("Token verification failed - invalid or expired token");
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    console.log("Token verified successfully, payload:", {
      userId: payload.userId,
      username: payload.username,
      email: payload.email,
    });

    // Connect to database and verify user exists
    await connectToDatabase();
    const user = await User.findById(payload.userId);

    if (!user) {
      console.log("User not found for payload:", payload);
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Use type assertion to access document properties
    const userId = user._id?.toString() || "";
    const username = user.username as string;
    const userEmail = user.email as string;

    // Generate new tokens
    const newPayload = {
      userId,
      username,
      email: userEmail,
    };

    const accessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    // Set new refresh token as HTTP-only cookie
    await setRefreshTokenCookie(newRefreshToken);

    // Return success response with new access token
    return NextResponse.json({
      message: "Token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    console.error(
      "Token refresh error:",
      error instanceof Error ? error.message : String(error),
      error instanceof Error ? error.stack : undefined
    );
    return NextResponse.json(
      {
        error: "Token refresh failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
