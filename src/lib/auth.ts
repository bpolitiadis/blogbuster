import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error(
    "Please define JWT_SECRET and JWT_REFRESH_SECRET environment variables inside .env.local"
  );
}

// Access token expires in 15 minutes
const ACCESS_TOKEN_EXPIRY = "15m";
// Refresh token expires in 7 days
const REFRESH_TOKEN_EXPIRY = "7d";
// Cookie expires in 7 days (in seconds)
const COOKIE_EXPIRY = 60 * 60 * 24 * 7;

export type JWTPayload = {
  userId: string;
  username: string;
  email: string;
};

/**
 * Generate an access token
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

/**
 * Generate a refresh token
 */
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Set refresh token in HTTP-only cookie
 */
export async function setRefreshTokenCookie(refreshToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "refresh_token",
    value: refreshToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_EXPIRY,
    path: "/",
  });
}

/**
 * Get refresh token from cookies
 */
export function getRefreshTokenFromCookies(
  req: NextRequest
): string | undefined {
  const cookieStore = req.cookies;
  return cookieStore.get("refresh_token")?.value;
}

/**
 * Clear refresh token cookie
 */
export async function clearRefreshTokenCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "refresh_token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
}

/**
 * Parse authorization header to get access token
 */
export function parseAuthHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1];
}
