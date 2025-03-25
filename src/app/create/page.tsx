"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Mood } from "@/lib/themes";
import { useAuth } from "@/features/auth/AuthContext";

export default function CreatePostPage() {
  const router = useRouter();
  const { accessToken, refreshToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    mood: "" as Mood | "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    console.log("Starting post creation...");
    console.log("Form data:", formData);

    try {
      // Try to refresh the token first
      await refreshToken();

      console.log("Making POST request to /api/posts with token:", accessToken);
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(",").map((tag) => tag.trim()),
        }),
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const data = await response.json();
        console.error("Error response data:", data);
        throw new Error(data.error || "Failed to create post");
      }

      const data = await response.json();
      console.log("Success response data:", data);

      if (!data.post?.id) {
        throw new Error("Invalid post ID received from server");
      }

      // Add a small delay to ensure the post is fully created
      await new Promise((resolve) => setTimeout(resolve, 100));
      router.push(`/post/${data.post.id}`);
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-4xl py-12">
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <h1 className="mb-8 text-3xl font-bold">Create New Post</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={100}
                placeholder="Enter post title"
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Content
              </label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                minLength={10}
                rows={10}
                placeholder="Write your post content here..."
              />
            </div>

            <div>
              <label
                htmlFor="tags"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Tags (comma-separated)
              </label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., technology, programming, web"
              />
            </div>

            <div>
              <label
                htmlFor="mood"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Mood
              </label>
              <select
                id="mood"
                name="mood"
                value={formData.mood}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select a mood</option>
                <option value="Dark">Dark</option>
                <option value="Romantic">Romantic</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Mystery">Mystery</option>
                <option value="Adventure">Adventure</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Horror">Horror</option>
                <option value="Comedy">Comedy</option>
                <option value="Drama">Drama</option>
                <option value="Thriller">Thriller</option>
              </select>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Create Post
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
