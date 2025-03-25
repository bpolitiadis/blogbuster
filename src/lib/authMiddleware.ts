import { NextRequest, NextResponse } from "next/server";
import { parseAuthHeader, verifyAccessToken } from "./auth";

export async function authMiddleware(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  // Get the Authorization header
  const authHeader = req.headers.get("authorization") ?? undefined;
  const token = parseAuthHeader(authHeader);

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Verify the access token
  const payload = verifyAccessToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  // Set user data in request
  req.headers.set("x-user-id", payload.userId);
  req.headers.set("x-user-email", payload.email);
  req.headers.set("x-user-username", payload.username);

  // Call the handler with the authenticated request
  return handler(req);
}

// Helper to get authenticated user from request
export function getAuthUser(req: NextRequest) {
  return {
    userId: req.headers.get("x-user-id") || "",
    email: req.headers.get("x-user-email") || "",
    username: req.headers.get("x-user-username") || "",
  };
}
