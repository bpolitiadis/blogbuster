"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CommentThread } from "@/components/CommentThread";
import { Textarea } from "@/components/ui/Textarea";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useTheme } from "@/hooks/useTheme";
import { Mood } from "@/lib/themes";
import { Debate } from "@/components/Debate";

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
  };
  createdAt: string;
  replies?: Comment[];
}

interface Post {
  id: string;
  title: string;
  content: string;
  tags: string[];
  mood?: Mood;
  author: {
    id: string;
    username: string;
    email: string;
  };
  createdAt: string;
}

interface Debate {
  id: string;
  user1: {
    id: string;
    username: string;
  };
  user2: {
    id: string;
    username: string;
  };
  replies: {
    userId: string;
    content: string;
    createdAt: string;
  }[];
  votes: {
    userId: string;
    votedFor: string;
    createdAt: string;
  }[];
  winner?: {
    id: string;
    username: string;
  };
  status: "active" | "completed";
  expiresAt: string;
}

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useTheme(post?.mood);
  const [debates, setDebates] = useState<Debate[]>([]);
  const [isLoadingDebates, setIsLoadingDebates] = useState(false);

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setError("Invalid post ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/posts/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }

        const data = await response.json();
        setPost(data.post);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!id) {
        setCommentError("Invalid post ID");
        setIsLoadingComments(false);
        return;
      }

      try {
        setIsLoadingComments(true);
        const response = await fetch(`/api/comments/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }

        const data = await response.json();
        setComments(data.comments);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setCommentError("Failed to load comments. Please try again later.");
      } finally {
        setIsLoadingComments(false);
      }
    };

    fetchComments();
  }, [id]);

  const fetchDebates = async () => {
    try {
      setIsLoadingDebates(true);
      const response = await fetch(`/api/debates?postId=${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch debates");
      }
      const data = await response.json();
      setDebates(data);
    } catch (error) {
      console.error("Error fetching debates:", error);
      setError("Failed to load debates");
    } finally {
      setIsLoadingDebates(false);
    }
  };

  const handleCreateDebate = async (challengedUserId: string) => {
    try {
      const response = await fetch("/api/debates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: id,
          challengedUserId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create debate");
      }

      const newDebate = await response.json();
      setDebates((prev) => [newDebate, ...prev]);
    } catch (error) {
      console.error("Error creating debate:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create debate"
      );
    }
  };

  const handleDebateReply = async (debateId: string, content: string) => {
    try {
      const response = await fetch(`/api/debates/${debateId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit reply");
      }

      const updatedDebate = await response.json();
      setDebates((prev) =>
        prev.map((debate) => (debate.id === debateId ? updatedDebate : debate))
      );
    } catch (error) {
      console.error("Error submitting reply:", error);
      setError(
        error instanceof Error ? error.message : "Failed to submit reply"
      );
    }
  };

  const handleDebateVote = async (debateId: string, votedFor: string) => {
    try {
      const response = await fetch(`/api/debates/${debateId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ votedFor }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit vote");
      }

      const updatedDebate = await response.json();
      setDebates((prev) =>
        prev.map((debate) => (debate.id === debateId ? updatedDebate : debate))
      );
    } catch (error) {
      console.error("Error submitting vote:", error);
      setError(
        error instanceof Error ? error.message : "Failed to submit vote"
      );
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      router.push("/");
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post. Please try again.");
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
          postId: id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const data = await response.json();

      // Add the new comment to the comments array
      setComments((prevComments) => [...prevComments, data.comment]);

      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
      setCommentError("Failed to add comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (content: string, parentId: string) => {
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          postId: id,
          parentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add reply");
      }

      const data = await response.json();

      // Refresh comments to include the new reply
      const commentsResponse = await fetch(`/api/comments/${id}`);
      const commentsData = await commentsResponse.json();
      setComments(commentsData.comments);

      return data.comment;
    } catch (err) {
      console.error("Error adding reply:", err);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-red-600">{error || "Post not found"}</div>
      </div>
    );
  }

  const isAuthor = user?.id === post.author.id;

  return (
    <div className={`min-h-screen ${theme.background}`}>
      <div className="mx-auto max-w-4xl py-12">
        <article className={`rounded-lg p-8 ${theme.primary}`}>
          <div className="mb-8">
            <h1 className={`mb-4 text-4xl font-bold ${theme.text}`}>
              {post.title}
            </h1>
            <div className="flex items-center gap-4">
              <Avatar fallback={post.author.username} />
              <div>
                <div className={`font-medium ${theme.text}`}>
                  {post.author.username}
                </div>
                <div className={`text-sm ${theme.text}`}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className={`prose prose-lg max-w-none ${theme.text}`}>
            {post.content}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className={theme.secondary}>
                #{tag}
              </Badge>
            ))}
            {post.mood && (
              <Badge variant="outline" className={theme.accent}>
                {post.mood}
              </Badge>
            )}
          </div>
        </article>

        {/* Post actions */}
        {isAuthor && (
          <div className="flex gap-4 border-t pt-6">
            <Button variant="outline" asChild>
              <Link href={`/edit/${post.id}`}>Edit Post</Link>
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Post
            </Button>
          </div>
        )}

        {/* Comments section */}
        <section className="space-y-6 border-t pt-10">
          <h2 className="text-2xl font-bold">Comments</h2>

          {/* Add comment form */}
          {isAuthenticated ? (
            <div className="space-y-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="min-h-[120px]"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  isLoading={isSubmitting}
                >
                  Post Comment
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border bg-gray-50 p-4 text-center">
              <p className="text-gray-600">
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>{" "}
                to join the conversation
              </p>
            </div>
          )}

          {/* Comments list */}
          {isLoadingComments ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : commentError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600">
              {commentError}
            </div>
          ) : comments.length === 0 ? (
            <div className="rounded-lg border bg-gray-50 p-6 text-center">
              <p className="text-gray-600">
                No comments yet. Be the first to comment!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  currentUser={user}
                  onReply={handleReply}
                />
              ))}
            </div>
          )}
        </section>

        {/* Debates Section */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Debates</h2>
            {user && user.id !== post.author.id && (
              <Button
                onClick={() => handleCreateDebate(post.author.id)}
                disabled={isLoading}
              >
                Challenge Author
              </Button>
            )}
          </div>

          {isLoadingDebates ? (
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          ) : debates.length === 0 ? (
            <p className="text-gray-500">No debates yet</p>
          ) : (
            <div className="space-y-6">
              {debates.map((debate) => (
                <Debate
                  key={debate.id}
                  debate={debate}
                  onReply={(content) => handleDebateReply(debate.id, content)}
                  onVote={(votedFor) => handleDebateVote(debate.id, votedFor)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
