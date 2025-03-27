import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User, { IUser } from "@/models/User";
import connectToDatabase from "./mongodb";
import { Document, Types } from "mongoose";

// Debug logging for environment variables
console.log("Auth module environment check:", {
  JWT_SECRET: process.env.JWT_SECRET ? "defined" : "undefined",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ? "defined" : "undefined",
  NODE_ENV: process.env.NODE_ENV,
});

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  console.error("Missing JWT environment variables:", {
    JWT_SECRET: !!JWT_SECRET,
    JWT_REFRESH_SECRET: !!JWT_REFRESH_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  });
  throw new Error(
    "Please define JWT_SECRET and JWT_REFRESH_SECRET environment variables inside .env.local"
  );
}

// Access token expires in 1 hour
const ACCESS_TOKEN_EXPIRY = "1h";
// Refresh token expires in 7 days
const REFRESH_TOKEN_EXPIRY = "7d";
// Cookie expires in 7 days (in seconds)
const COOKIE_EXPIRY = 60 * 60 * 24 * 7;
// Buffer time before token expiration to trigger refresh (5 minutes)
const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes in milliseconds

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
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
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
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Set refresh token in HTTP-only cookie
 */
export async function setRefreshTokenCookie(
  refreshToken: string
): Promise<void> {
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

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide email and password");
        }

        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("No user found with this email");
        }

        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        const typedUser = user as IUser &
          Document<unknown, {}, IUser> & { _id: Types.ObjectId };
        return {
          id: typedUser._id.toString(),
          email: typedUser.email,
          name: typedUser.username,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.JWT_SECRET,
};
