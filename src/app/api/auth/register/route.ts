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
    const { username, email, password } = body;

    // Validate inputs
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "email" : "username";
      return NextResponse.json(
        { error: `User with this ${field} already exists` },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password, // will be hashed by pre-save hook
    });

    await newUser.save();

    // Use type assertion to access document properties
    const userId = newUser._id?.toString() || "";
    const userUsername = newUser.username as string;
    const userEmail = newUser.email as string;

    // Generate tokens
    const payload: JWTPayload = {
      userId,
      username: userUsername,
      email: userEmail,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Set refresh token as HTTP-only cookie
    await setRefreshTokenCookie(refreshToken);

    // Return success response with access token
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: userId,
          username: userUsername,
          email: userEmail,
        },
        accessToken,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Registration error:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      {
        error: "Registration failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
