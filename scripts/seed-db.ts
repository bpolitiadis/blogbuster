import mongoose, { Document } from "mongoose";
import User, { IUser } from "../src/models/User";
import Post, { IPost } from "../src/models/Post";
import Comment from "../src/models/Comment";
import { Debate } from "../src/models/Debate";
import { Mood } from "../src/lib/themes";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/blogbuster";

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

async function clearDatabase() {
  try {
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Debate.deleteMany({});
    console.log("Database cleared successfully");
  } catch (error) {
    console.error("Error clearing database:", error);
    process.exit(1);
  }
}

async function createTestUsers() {
  const users = [
    {
      username: "john_doe",
      email: "john@example.com",
      password: process.env.SEED_USER_PASSWORD || "changeme123",
      xp: 100,
      level: 2,
      badges: ["Rising Star"],
    },
    {
      username: "jane_smith",
      email: "jane@example.com",
      password: process.env.SEED_USER_PASSWORD || "changeme123",
      xp: 250,
      level: 3,
      badges: ["Rising Star"],
    },
    {
      username: "tech_guru",
      email: "guru@example.com",
      password: process.env.SEED_USER_PASSWORD || "changeme123",
      xp: 500,
      level: 6,
      badges: ["Rising Star", "Veteran"],
    },
  ];

  try {
    const createdUsers = await Promise.all(
      users.map((user) => User.create(user))
    );
    console.log("Test users created successfully");
    return createdUsers;
  } catch (error) {
    console.error("Error creating test users:", error);
    process.exit(1);
  }
}

async function createTestPosts(users: (IUser & Document)[]) {
  const posts = [
    {
      title: "Getting Started with BlogBuster",
      content:
        "Welcome to BlogBuster! This is a platform where you can share your thoughts, engage in discussions, and earn XP through meaningful interactions. Let's make this community amazing!",
      tags: ["welcome", "getting-started", "community"],
      mood: "Adventure" as Mood,
      author: users[0]._id,
    },
    {
      title: "The Art of Storytelling",
      content:
        "Storytelling is an ancient art that has been passed down through generations. In this post, I'll share some tips and techniques for crafting compelling narratives that captivate your readers.",
      tags: ["writing", "storytelling", "tips"],
      mood: "Romantic" as Mood,
      author: users[1]._id,
    },
    {
      title: "Why I Love Blogging",
      content:
        "Blogging has become an integral part of my life. It's not just about writing; it's about connecting with others, sharing knowledge, and building a community. Here's my journey and why I continue to blog.",
      tags: ["blogging", "personal", "community"],
      mood: "Drama" as Mood,
      author: users[2]._id,
    },
    {
      title: "The Future of Content Creation",
      content:
        "As we move forward in the digital age, content creation is evolving rapidly. AI tools, new platforms, and changing audience preferences are shaping how we create and consume content. Let's explore what's next!",
      tags: ["future", "technology", "content-creation"],
      mood: "Sci-Fi" as Mood,
      author: users[0]._id,
    },
    {
      title: "Tips for Better Writing",
      content:
        "Whether you're a seasoned writer or just starting out, there's always room for improvement. Here are some practical tips I've learned over the years that have helped me become a better writer.",
      tags: ["writing", "tips", "improvement"],
      mood: "Adventure" as Mood,
      author: users[1]._id,
    },
  ];

  try {
    const createdPosts = (await Post.insertMany(posts)) as (IPost & Document)[];
    console.log("Test posts created successfully");
    return createdPosts;
  } catch (error) {
    console.error("Error creating test posts:", error);
    process.exit(1);
  }
}

async function createTestComments(
  posts: (IPost & Document)[],
  users: (IUser & Document)[]
) {
  const comments = [
    {
      content:
        "Great introduction! Looking forward to being part of this community.",
      author: users[1]._id,
      post: posts[0]._id,
    },
    {
      content: "Welcome to BlogBuster! Your post is very informative.",
      author: users[2]._id,
      post: posts[0]._id,
    },
    {
      content:
        "Your storytelling tips are really helpful. I'll definitely try these techniques!",
      author: users[0]._id,
      post: posts[1]._id,
    },
    {
      content:
        "I completely agree with your points about the future of content creation. AI is definitely changing the game.",
      author: users[2]._id,
      post: posts[3]._id,
    },
    {
      content:
        "These writing tips are gold! Thanks for sharing your experience.",
      author: users[0]._id,
      post: posts[4]._id,
    },
  ];

  try {
    await Comment.insertMany(comments);
    console.log("Test comments created successfully");
  } catch (error) {
    console.error("Error creating test comments:", error);
    process.exit(1);
  }
}

async function createTestDebates(
  posts: (IPost & Document)[],
  users: (IUser & Document)[]
) {
  const debates = [
    {
      postId: posts[0]._id,
      user1: users[0]._id,
      user2: users[1]._id,
      replies: [
        {
          userId: users[0]._id,
          content:
            "I believe that community engagement is the key to success. We should focus on creating meaningful interactions and encouraging active participation.",
          createdAt: new Date(),
        },
        {
          userId: users[1]._id,
          content:
            "While community engagement is important, I think we should also prioritize content quality. High-quality content will naturally attract and retain users.",
          createdAt: new Date(),
        },
      ],
      votes: [
        {
          userId: users[2]._id,
          votedFor: users[0]._id,
          createdAt: new Date(),
        },
        {
          userId: users[2]._id,
          votedFor: users[0]._id,
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      status: "active" as const,
    },
    {
      postId: posts[1]._id,
      user1: users[1]._id,
      user2: users[2]._id,
      replies: [
        {
          userId: users[1]._id,
          content:
            "The key to good storytelling is understanding your audience and crafting narratives that resonate with them on a personal level.",
          createdAt: new Date(),
        },
        {
          userId: users[2]._id,
          content:
            "While audience understanding is important, I believe the foundation of good storytelling lies in authentic experiences and genuine emotions.",
          createdAt: new Date(),
        },
      ],
      votes: [
        {
          userId: users[0]._id,
          votedFor: users[1]._id,
          createdAt: new Date(),
        },
        {
          userId: users[0]._id,
          votedFor: users[1]._id,
          createdAt: new Date(),
        },
        {
          userId: users[0]._id,
          votedFor: users[1]._id,
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      status: "active" as const,
    },
    {
      postId: posts[2]._id,
      user1: users[2]._id,
      user2: users[0]._id,
      replies: [
        {
          userId: users[2]._id,
          content:
            "Blogging has transformed my life by giving me a platform to share my thoughts and connect with like-minded individuals.",
          createdAt: new Date(),
        },
        {
          userId: users[0]._id,
          content:
            "While blogging is great for sharing thoughts, I believe its true value lies in the learning opportunities it provides through community feedback.",
          createdAt: new Date(),
        },
      ],
      votes: [
        {
          userId: users[1]._id,
          votedFor: users[2]._id,
          createdAt: new Date(),
        },
        {
          userId: users[1]._id,
          votedFor: users[2]._id,
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      status: "active" as const,
    },
  ];

  try {
    await Debate.insertMany(debates);
    console.log("Test debates created successfully");
  } catch (error) {
    console.error("Error creating test debates:", error);
    process.exit(1);
  }
}

async function main() {
  try {
    await connectToDatabase();
    await clearDatabase();
    const users = await createTestUsers();
    const posts = await createTestPosts(users);
    await createTestComments(posts, users);
    await createTestDebates(posts, users);
    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

main();
