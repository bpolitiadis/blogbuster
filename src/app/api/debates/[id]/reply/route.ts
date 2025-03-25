import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Debate } from "@/models/Debate";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const replySchema = z.object({
  content: z.string().min(1, "Reply cannot be empty"),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    if (
      !debate.user1.equals(session.user.id) &&
      !debate.user2.equals(session.user.id)
    ) {
      return NextResponse.json(
        { error: "You are not part of this debate" },
        { status: 403 }
      );
    }

    // Check if user has already replied
    if (debate.hasReplied(session.user.id)) {
      return NextResponse.json(
        { error: "You have already replied to this debate" },
        { status: 400 }
      );
    }

    // Add reply
    debate.replies.push({
      userId: session.user.id,
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
