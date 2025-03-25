import mongoose, { Schema, Document } from "mongoose";
import { Post } from "./Post";
import { User } from "./User";

export interface IDebate extends Document {
  postId: mongoose.Types.ObjectId;
  user1: mongoose.Types.ObjectId;
  user2: mongoose.Types.ObjectId;
  replies: {
    userId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
  }[];
  votes: {
    userId: mongoose.Types.ObjectId;
    votedFor: mongoose.Types.ObjectId;
    createdAt: Date;
  }[];
  winner?: mongoose.Types.ObjectId;
  createdAt: Date;
  expiresAt: Date;
  status: "active" | "completed";
  hasReplied(userId: mongoose.Types.ObjectId): boolean;
  hasVoted(userId: mongoose.Types.ObjectId): boolean;
  getVoteCount(userId: mongoose.Types.ObjectId): number;
  isExpired(): boolean;
  shouldEnd(): boolean;
  endDebate(): Promise<void>;
}

const debateSchema = new Schema<IDebate>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user1: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user2: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    replies: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    votes: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        votedFor: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    winner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
debateSchema.index({ postId: 1, status: 1 });
debateSchema.index({ user1: 1, user2: 1, status: 1 });
debateSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Methods
debateSchema.methods.hasReplied = function (
  userId: mongoose.Types.ObjectId
): boolean {
  return this.replies.some((reply) => reply.userId.equals(userId));
};

debateSchema.methods.hasVoted = function (
  userId: mongoose.Types.ObjectId
): boolean {
  return this.votes.some((vote) => vote.userId.equals(userId));
};

debateSchema.methods.getVoteCount = function (
  userId: mongoose.Types.ObjectId
): number {
  return this.votes.filter((vote) => vote.votedFor.equals(userId)).length;
};

debateSchema.methods.isExpired = function (): boolean {
  return Date.now() >= this.expiresAt.getTime();
};

debateSchema.methods.shouldEnd = function (): boolean {
  return this.isExpired() || this.votes.length >= 10; // End after 48h or 10 votes
};

debateSchema.methods.endDebate = async function (): Promise<void> {
  if (this.status === "completed") return;

  const user1Votes = this.getVoteCount(this.user1);
  const user2Votes = this.getVoteCount(this.user2);

  if (user1Votes > user2Votes) {
    this.winner = this.user1;
  } else if (user2Votes > user1Votes) {
    this.winner = this.user2;
  }

  this.status = "completed";

  // Award XP to winner
  if (this.winner) {
    const winner = await User.findById(this.winner);
    if (winner) {
      await winner.addXP(100); // 100 XP for winning a debate
    }
  }

  await this.save();
};

// Pre-save middleware to check if debate should end
debateSchema.pre("save", async function (next) {
  if (this.isModified("votes") && this.shouldEnd()) {
    await this.endDebate();
  }
  next();
});

export const Debate =
  mongoose.models.Debate || mongoose.model<IDebate>("Debate", debateSchema);
