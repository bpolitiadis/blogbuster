import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { authMiddleware, getAuthUser } from "@/lib/authMiddleware";
import { Error } from "mongoose";

async function handler(req: NextRequest) {
  try {
    // Get authenticated user from request
    const { userId } = getAuthUser(req);

    // Connect to database
    await connectToDatabase();

    // Find user by ID
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Use type assertion to access document properties
    const id = user._id?.toString() || "";
    const username = user.username as string;
    const email = user.email as string;
    const createdAt = user.createdAt as Date;

    // Return user profile
    return NextResponse.json({
      user: {
        id,
        username,
        email,
        createdAt,
      },
    });
  } catch (error) {
    console.error(
      "User profile error:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      {
        error: "Failed to get user profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export function GET(req: NextRequest) {
  return authMiddleware(req, handler);
}
