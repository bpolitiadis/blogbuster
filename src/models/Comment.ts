import mongoose, { Schema, Document, Model } from "mongoose";
import User from "./User";

export interface IComment extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  parentComment?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      minlength: [1, "Comment must not be empty"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post is required"],
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only track createdAt
  }
);

// Add compound index for efficient querying
CommentSchema.index({ post: 1, parentComment: 1, createdAt: -1 });

// Award XP when a comment is created
CommentSchema.post("save", async function (doc) {
  if (doc.isNew) {
    try {
      const user = await User.findById(doc.author);
      if (user) {
        await user.addXP(10); // Award 10 XP for creating a comment
      }
    } catch (error) {
      console.error("Error awarding XP for comment creation:", error);
    }
  }
});

// Create the model or use existing one
const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
