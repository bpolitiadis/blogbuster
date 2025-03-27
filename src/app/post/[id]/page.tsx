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
import { useTheme } from "@/hooks/useTheme";
import { Mood } from "@/lib/themes";
import { Debate } from "@/components/Debate";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

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
    bio?: string;
    xp: number;
    level: number;
    badges: string[];
  };
  createdAt: string;
}

interface Debate {
  id: string;
  postId: string;
  challengerId: string;
  challenger: {
    id: string;
    username: string;
  };
  authorId: string;
  author: {
    id: string;
    username: string;
  };
  challengerReply?: string;
  authorReply?: string;
  votes: {
    userId: string;
    votedFor: string;
  }[];
  status: "active" | "completed";
  createdAt: string;
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

  // Fetch debates
  useEffect(() => {
    const fetchDebates = async () => {
      if (!id) {
        setError("Invalid post ID");
        setIsLoadingDebates(false);
        return;
      }

      try {
        setIsLoadingDebates(true);
        const response = await fetch(`/api/debates?postId=${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch debates");
        }
        const data = await response.json();
        setDebates(data);
      } catch (err) {
        console.error("Error fetching debates:", err);
        setError("Failed to load debates. Please try again later.");
      } finally {
        setIsLoadingDebates(false);
      }
    };

    fetchDebates();
  }, [id]);

  const handleCreateDebate = async (challengedUserId: string) => {
    try {
      const response = await fetch("/api/debates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
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
    <div className="min-h-screen">
      {/* Dynamic header */}
      <div
        className={`relative overflow-hidden bg-gradient-to-r ${theme.background} py-16 transition-all duration-500`}
      >
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {post.title}
            </h1>
            <div className="mt-4 flex items-center justify-center gap-4">
              <Avatar fallback={post.author.username} size="lg" />
              <div className="text-left">
                <div className="font-medium text-white">
                  {post.author.username}
                </div>
                <div className="text-sm text-white/80">
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Author bio section */}
        <div className="mb-12 rounded-lg border bg-surface-light dark:bg-surface-dark p-6">
          <div className="flex items-start gap-4">
            <Avatar fallback={post.author.username} size="lg" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">
                About {post.author.username}
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {post.author.bio || "No bio available"}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-accent-romantic/10 text-accent-romantic"
                >
                  Level {post.author.level}
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-accent-sciFi/10 text-accent-sciFi"
                >
                  {post.author.xp} XP
                </Badge>
                {(post.author?.badges || []).map((badge) => (
                  <Badge key={badge} variant="outline">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Post content */}
        <article className={`rounded-lg p-8 ${theme.primary} mb-12`}>
          <div className={`prose prose-lg max-w-none ${theme.text}`}>
            {post.content}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {(post?.tags || []).map((tag) => (
              <Link key={tag} href={`/posts?tag=${tag}`}>
                <Badge
                  variant="outline"
                  className="hover:bg-secondary/10 dark:hover:bg-secondary-dark/10 transition-colors duration-200"
                >
                  #{tag}
                </Badge>
              </Link>
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
          <div className="flex gap-4 border-t pt-6 mb-12">
            <Button variant="outline" asChild>
              <Link href={`/edit/${post.id}`}>Edit Post</Link>
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Post
            </Button>
          </div>
        )}

        {/* Comments section */}
        <Disclosure defaultOpen>
          {({ open }) => (
            <div className="space-y-6 border-t pt-10">
              <Disclosure.Button className="flex w-full items-center justify-between rounded-lg bg-surface-light dark:bg-surface-dark px-4 py-2 text-left text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring focus-visible:ring-primary">
                <h2 className="text-2xl font-bold">Comments</h2>
                {open ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </Disclosure.Button>

              <Disclosure.Panel>
                {/* Add comment form */}
                {isAuthenticated ? (
                  <div className="space-y-4 mb-8">
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
                      <Link
                        href="/login"
                        className="text-primary hover:underline"
                      >
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
              </Disclosure.Panel>
            </div>
          )}
        </Disclosure>

        {/* Debates Section */}
        <Disclosure defaultOpen>
          {({ open }) => (
            <div className="mt-12 border-t pt-10">
              <Disclosure.Button className="flex w-full items-center justify-between rounded-lg bg-surface-light dark:bg-surface-dark px-4 py-2 text-left text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring focus-visible:ring-primary">
                <div className="flex items-center justify-between w-full">
                  <h2 className="text-2xl font-bold">Debates</h2>
                  {open ? (
                    <ChevronUpIcon className="h-5 w-5" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5" />
                  )}
                </div>
              </Disclosure.Button>
              {user && user.id !== post.author.id && (
                <div className="mt-2 flex justify-end">
                  <Button
                    onClick={() => handleCreateDebate(post.author.id)}
                    disabled={isLoading}
                  >
                    Challenge Author
                  </Button>
                </div>
              )}

              <Disclosure.Panel>
                {isLoadingDebates ? (
                  <div className="flex justify-center py-8">
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
                        debate={{
                          id: debate.id,
                          user1: debate.author,
                          user2: debate.challenger,
                          replies: [
                            ...(debate.authorReply
                              ? [
                                  {
                                    userId: debate.authorId,
                                    content: debate.authorReply,
                                    createdAt: debate.createdAt,
                                  },
                                ]
                              : []),
                            ...(debate.challengerReply
                              ? [
                                  {
                                    userId: debate.challengerId,
                                    content: debate.challengerReply,
                                    createdAt: debate.createdAt,
                                  },
                                ]
                              : []),
                          ],
                          votes: debate.votes.map((vote) => ({
                            ...vote,
                            createdAt: debate.createdAt,
                          })),
                          status: debate.status,
                          expiresAt: debate.expiresAt,
                        }}
                        onReply={(content) =>
                          handleDebateReply(debate.id, content)
                        }
                        onVote={(votedFor) =>
                          handleDebateVote(debate.id, votedFor)
                        }
                      />
                    ))}
                  </div>
                )}
              </Disclosure.Panel>
            </div>
          )}
        </Disclosure>
      </div>
    </div>
  );
}
