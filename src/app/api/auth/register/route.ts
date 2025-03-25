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
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
  logger.info("Processing user registration request");

  try {
    logger.debug("Connecting to database for user registration");
    await connectToDatabase();
    logger.debug("Database connection successful");

    // Parse request body
    const body = await req.json();
    const { username, email, password } = body;

    logger.info(
      `Registration attempt for email: ${email}, username: ${username}`
    );

    // Validate inputs
    if (!username || !email || !password) {
      logger.warn("Registration failed: Missing required fields");
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    logger.debug(
      `Checking if user with email ${email} or username ${username} already exists`
    );
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "email" : "username";
      logger.warn(`Registration failed: ${field} already exists`);
      return NextResponse.json(
        { error: `User with this ${field} already exists` },
        { status: 409 }
      );
    }

    // Create new user
    logger.debug("Creating new user record");
    const newUser = new User({
      username,
      email,
      password, // will be hashed by pre-save hook
    });

    await newUser.save();
    logger.info(`User registered successfully: ${username} (${email})`);

    // Use type assertion to access document properties
    const userId = newUser._id?.toString() || "";
    const userUsername = newUser.username as string;
    const userEmail = newUser.email as string;

    // Generate tokens
    logger.debug("Generating authentication tokens");
    const payload: JWTPayload = {
      userId,
      username: userUsername,
      email: userEmail,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Set refresh token as HTTP-only cookie
    logger.debug("Setting refresh token cookie");
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName =
      error instanceof Error ? error.name : "Unknown error type";

    logger.error(`Registration error: ${errorName} - ${errorMessage}`);

    // Log more details for specific errors
    if (error instanceof Error && "code" in error) {
      const mongoError = error as unknown as { code: number };
      logger.error(`MongoDB error code: ${mongoError.code}`);

      // Duplicate key error
      if (mongoError.code === 11000) {
        logger.error("Duplicate key error - user likely already exists");
        return NextResponse.json(
          { error: "User with this email or username already exists" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Registration failed",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
