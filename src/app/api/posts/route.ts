import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Post, { IPostQuery } from "@/models/Post";
import { authMiddleware, getAuthUser } from "@/lib/authMiddleware";
import { Error } from "mongoose";

// Create post (protected)
async function createPost(req: NextRequest) {
  try {
    await connectToDatabase();

    // Get authenticated user
    const { userId } = getAuthUser(req);

    // Parse request body
    const body = await req.json();
    const { title, content, tags = [], mood } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Create new post
    const post = new Post({
      title,
      content,
      tags,
      mood,
      author: userId,
    });

    await post.save();

    // Populate author details
    await post.populate("author", "username email");

    return NextResponse.json(
      { message: "Post created successfully", post },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create post error:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      {
        error: "Failed to create post",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// List posts with optional tag and search
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build query
    const query: IPostQuery = {};

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const posts = await Post.find(query)
      .populate("author", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Post.countDocuments(query);

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(
      "List posts error:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      {
        error: "Failed to list posts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Protected POST endpoint
export async function POST(req: NextRequest) {
  return authMiddleware(req, createPost);
}
