"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthContext";

interface Post {
  id: string;
  title: string;
  content: string;
  tags: string[];
  mood?: string;
  author: {
    username: string;
    email: string;
  };
  createdAt: string;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const allTags = Array.from(
    new Set(posts.flatMap((post) => post.tags).filter(Boolean))
  );

  const allMoods = Array.from(
    new Set(posts.map((post) => post.mood).filter(Boolean))
  ) as string[];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        let url = "/api/posts";
        const params = new URLSearchParams();

        if (activeTag) params.append("tag", activeTag);
        if (activeMood) params.append("mood", activeMood);

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await response.json();
        setPosts(data.posts);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [activeTag, activeMood]);

  const handleTagFilter = (tag: string) => {
    setActiveTag(activeTag === tag ? null : tag);
  };

  const handleMoodFilter = (mood: string) => {
    setActiveMood(activeMood === mood ? null : mood);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Latest Posts</h1>
        {isAuthenticated && (
          <Button asChild>
            <Link href="/create">Create Post</Link>
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {allTags.length > 0 && (
          <div>
            <h2 className="mb-2 text-sm font-medium text-gray-500">
              Filter by tag
            </h2>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={activeTag === tag ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTagFilter(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {allMoods.length > 0 && (
          <div>
            <h2 className="mb-2 text-sm font-medium text-gray-500">
              Filter by mood
            </h2>
            <div className="flex flex-wrap gap-2">
              {allMoods.map((mood) => (
                <Badge
                  key={mood}
                  variant={activeMood === mood ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => handleMoodFilter(mood)}
                >
                  {mood}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-600">
          {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <h3 className="mb-2 text-lg font-medium">No posts found</h3>
          <p className="text-gray-500">
            {activeTag || activeMood
              ? "Try changing your filters or create the first post with these criteria!"
              : "Be the first to create a post!"}
          </p>
          {isAuthenticated && (
            <Button className="mt-4" asChild>
              <Link href="/create">Create Post</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
