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
    // Get refresh token from cookie
    const refreshToken = req.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token not found" },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    // Connect to database and verify user exists
    await connectToDatabase();
    const user = await User.findById(payload.userId);

    if (!user) {
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
      error instanceof Error ? error.message : String(error)
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
