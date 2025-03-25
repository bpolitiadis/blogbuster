import { NextResponse } from "next/server";
import { clearRefreshTokenCookie } from "@/lib/auth";
import { Error } from "mongoose";

export async function POST() {
  try {
    // Clear the refresh token cookie
    await clearRefreshTokenCookie();

    // Return success response
    return NextResponse.json({
      message: "Successfully logged out",
    });
  } catch (error) {
    console.error(
      "Logout error:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      {
        error: "Logout failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
