import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";
import { authMiddleware, getAuthUser } from "@/lib/authMiddleware";
import { Error } from "mongoose";

// Get single post
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await context.params;

    const post = await Post.findById(id).populate("author", "username email");

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Transform post to include id field
    const transformedPost = {
      ...post.toObject(),
      id: post._id.toString(),
    };

    return NextResponse.json({ post: transformedPost });
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.author.toString() !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    ).populate("author", "username email");

    return NextResponse.json({ post: updatedPost });
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

// Delete post (author only)
async function deletePost(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.author.toString() !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await Post.findByIdAndDelete(id);
    return NextResponse.json({ message: "Post deleted successfully" });
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

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return updatePost(req, context);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return deletePost(req, context);
}
