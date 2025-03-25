import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Debate } from "@/models/Debate";
import { authMiddleware, getAuthUser } from "@/lib/authMiddleware";
import { z } from "zod";
import { NextRequest } from "next/server";

const voteSchema = z.object({
  votedFor: z.string(),
});

async function handler(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuthUser(req);

    const body = await req.json();
    const { votedFor } = voteSchema.parse(body);

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

    // Check if user has already voted
    if (debate.hasVoted(userId)) {
      return NextResponse.json(
        { error: "You have already voted in this debate" },
        { status: 400 }
      );
    }

    // Check if votedFor is one of the debate participants
    if (!debate.user1.equals(votedFor) && !debate.user2.equals(votedFor)) {
      return NextResponse.json(
        { error: "Invalid vote: must vote for one of the debate participants" },
        { status: 400 }
      );
    }

    // Add vote
    debate.votes.push({
      userId,
      votedFor,
      createdAt: new Date(),
    });

    await debate.save();

    return NextResponse.json(debate);
  } catch (error) {
    console.error("Error voting on debate:", error);
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
