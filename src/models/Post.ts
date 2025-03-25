import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPost extends Document {
  title: string;
  content: string;
  tags: string[];
  mood?: string;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostQuery {
  tags?: string;
  $text?: { $search: string };
}

const PostSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      minlength: [10, "Content must be at least 10 characters long"],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.every((tag) => tag.length >= 2 && tag.length <= 20);
        },
        message: "Each tag must be between 2 and 20 characters long",
      },
    },
    mood: {
      type: String,
      trim: true,
      maxlength: [20, "Mood cannot exceed 20 characters"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Add text index for search functionality
PostSchema.index({ title: "text", content: "text", tags: "text" });

// Create the model or use existing one
const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

export default Post;
