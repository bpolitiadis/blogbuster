import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Debate } from "@/models/Debate";
import { Post } from "@/models/Post";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Validation schemas
const createDebateSchema = z.object({
  postId: z.string(),
  challengedUserId: z.string(),
});

const replySchema = z.object({
  content: z.string().min(1, "Reply cannot be empty"),
});

const voteSchema = z.object({
  votedFor: z.string(),
});

// Create a new debate
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { postId, challengedUserId } = createDebateSchema.parse(body);

    await connectToDatabase();

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if challenged user exists
    const challengedUser = await User.findById(challengedUserId);
    if (!challengedUser) {
      return NextResponse.json(
        { error: "Challenged user not found" },
        { status: 404 }
      );
    }

    // Check if user is challenging themselves
    if (challengedUserId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot challenge yourself" },
        { status: 400 }
      );
    }

    // Check if there's already an active debate between these users for this post
    const existingDebate = await Debate.findOne({
      postId,
      user1: { $in: [session.user.id, challengedUserId] },
      user2: { $in: [session.user.id, challengedUserId] },
      status: "active",
    });

    if (existingDebate) {
      return NextResponse.json(
        { error: "An active debate already exists between these users" },
        { status: 400 }
      );
    }

    // Create new debate
    const debate = await Debate.create({
      postId,
      user1: session.user.id,
      user2: challengedUserId,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
    });

    return NextResponse.json(debate);
  } catch (error) {
    console.error("Error creating debate:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get debates for a post
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const debates = await Debate.find({ postId })
      .populate("user1", "username")
      .populate("user2", "username")
      .populate("winner", "username")
      .sort({ createdAt: -1 });

    return NextResponse.json(debates);
  } catch (error) {
    console.error("Error fetching debates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
