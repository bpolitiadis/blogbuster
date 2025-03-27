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
    console.log("Login API: Starting login process");
    await connectToDatabase();
    console.log("Login API: Connected to database");

    // Parse request body
    const body = await req.json();
    const { email, password } = body;

    // Log attempt (without sensitive data)
    console.log(`Login API: Login attempt for email: ${email}`);

    // Validate inputs
    if (!email || !password) {
      console.log("Login API: Missing credentials", {
        hasEmail: !!email,
        hasPassword: !!password,
      });
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email });
    console.log(
      `Login API: User lookup result: ${user ? "Found" : "Not found"}`
    );

    if (!user) {
      console.log("Login API: User not found with provided email");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check password
    console.log("Login API: Attempting password verification");
    const isPasswordValid = await user.comparePassword(password);
    console.log(
      `Login API: Password verification result: ${
        isPasswordValid ? "Valid" : "Invalid"
      }`
    );

    if (!isPasswordValid) {
      console.log("Login API: Invalid password provided");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Use type assertion to access document properties
    const userId = user._id?.toString() || "";
    const username = user.username as string;
    const userEmail = user.email as string;

    console.log(`Login API: Generating tokens for user: ${username}`);

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
    console.log("Login API: Refresh token cookie set");

    // Return success response with access token
    console.log("Login API: Login successful");
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
      "Login API: Error during login process:",
      error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : String(error)
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
