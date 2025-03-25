import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import { Error } from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    await connectToDatabase();

    // Check if post exists
    const post = await Post.findById(params.postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // First, get all top-level comments (no parent)
    const skip = (page - 1) * limit;
    const topLevelComments = await Comment.find({
      post: params.postId,
      parentComment: null,
    })
      .populate("author", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Comment.countDocuments({
      post: params.postId,
      parentComment: null,
    });

    // For each top-level comment, get its replies
    const commentsWithReplies = await Promise.all(
      topLevelComments.map(async (comment) => {
        const replies = await Comment.find({
          post: params.postId,
          parentComment: comment._id,
        })
          .populate("author", "username email")
          .sort({ createdAt: 1 }); // Sort replies chronologically

        // Convert to plain object to add replies
        const commentObj = comment.toObject();
        return {
          ...commentObj,
          replies,
        };
      })
    );

    return NextResponse.json({
      comments: commentsWithReplies,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(
      "Get comments error:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      {
        error: "Failed to get comments",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
