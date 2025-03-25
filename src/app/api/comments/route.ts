import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import { authMiddleware, getAuthUser } from "@/lib/authMiddleware";
import { Error } from "mongoose";

async function createComment(req: NextRequest) {
  try {
    await connectToDatabase();

    // Get authenticated user
    const { userId } = getAuthUser(req);

    // Parse request body
    const body = await req.json();
    const { content, postId, parentCommentId = null } = body;

    // Validate required fields
    if (!content || !postId) {
      return NextResponse.json(
        { error: "Content and postId are required" },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // If parentCommentId is provided, verify it exists and belongs to the same post
    if (parentCommentId) {
      const parentComment = await Comment.findOne({
        _id: parentCommentId,
        post: postId,
      });

      if (!parentComment) {
        return NextResponse.json(
          {
            error:
              "Parent comment not found or does not belong to the specified post",
          },
          { status: 400 }
        );
      }
    }

    // Create new comment
    const comment = new Comment({
      content,
      author: userId,
      post: postId,
      parentComment: parentCommentId,
    });

    await comment.save();

    // Populate author details
    await comment.populate("author", "username email");

    return NextResponse.json(
      { message: "Comment added successfully", comment },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create comment error:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      {
        error: "Failed to create comment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Protected POST endpoint
export async function POST(req: NextRequest) {
  return authMiddleware(req, createComment);
}
