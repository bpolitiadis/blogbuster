import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";
import { authMiddleware, getAuthUser } from "@/lib/authMiddleware";
import { Error } from "mongoose";

// Get single post
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const post = await Post.findById(params.id).populate(
      "author",
      "username email"
    );

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error(
      "Get post error:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      {
        error: "Failed to get post",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Update post (author only)
async function updatePost(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Get authenticated user
    const { userId } = getAuthUser(req);

    // Find post
    const post = await Post.findById(params.id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user is the author
    if (post.author.toString() !== userId) {
      return NextResponse.json(
        { error: "Not authorized to update this post" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { title, content, tags, mood } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Update post
    post.title = title;
    post.content = content;
    post.tags = tags || [];
    post.mood = mood;

    await post.save();
    await post.populate("author", "username email");

    return NextResponse.json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error(
      "Update post error:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      {
        error: "Failed to update post",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Delete post (author or admin)
async function deletePost(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Get authenticated user
    const { userId } = getAuthUser(req);

    // Find post
    const post = await Post.findById(params.id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user is the author
    // TODO: Add admin check when admin functionality is implemented
    if (post.author.toString() !== userId) {
      return NextResponse.json(
        { error: "Not authorized to delete this post" },
        { status: 403 }
      );
    }

    await post.deleteOne();

    return NextResponse.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete post error:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      {
        error: "Failed to delete post",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Protected PUT endpoint
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return authMiddleware(req, (req) => updatePost(req, { params }));
}

// Protected DELETE endpoint
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return authMiddleware(req, (req) => deletePost(req, { params }));
}
