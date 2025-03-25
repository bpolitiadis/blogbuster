import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Debate } from "@/models/Debate";
import { authMiddleware, getAuthUser } from "@/lib/authMiddleware";
import { z } from "zod";
import { NextRequest } from "next/server";

const replySchema = z.object({
  content: z.string().min(1, "Reply cannot be empty"),
});

async function handler(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuthUser(req);

    const body = await req.json();
    const { content } = replySchema.parse(body);

    await connectToDatabase();

    const debate = await Debate.findById(params.id);
    if (!debate) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 });
    }

    // Check if debate is active
    if (debate.status !== "active") {
      return NextResponse.json(
        { error: "This debate has ended" },
        { status: 400 }
      );
    }

    // Check if user is part of the debate
    if (!debate.user1.equals(userId) && !debate.user2.equals(userId)) {
      return NextResponse.json(
        { error: "You are not part of this debate" },
        { status: 403 }
      );
    }

    // Check if user has already replied
    if (debate.hasReplied(userId)) {
      return NextResponse.json(
        { error: "You have already replied to this debate" },
        { status: 400 }
      );
    }

    // Add reply
    debate.replies.push({
      userId,
      content,
      createdAt: new Date(),
    });

    await debate.save();

    return NextResponse.json(debate);
  } catch (error) {
    console.error("Error replying to debate:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return authMiddleware(req, () => handler(req, { params }));
}
