import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  JWTPayload,
} from "@/lib/auth";
import { Error } from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    // Parse request body
    const body = await req.json();
    const { email, password } = body;

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Use type assertion to access document properties
    const userId = user._id?.toString() || "";
    const username = user.username as string;
    const userEmail = user.email as string;

    // Generate tokens
    const payload: JWTPayload = {
      userId,
      username,
      email: userEmail,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Set refresh token as HTTP-only cookie
    await setRefreshTokenCookie(refreshToken);

    // Return success response with access token
    return NextResponse.json({
      message: "Login successful",
      user: {
        id: userId,
        username,
        email: userEmail,
      },
      accessToken,
    });
  } catch (error) {
    console.error(
      "Login error:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      {
        error: "Login failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
