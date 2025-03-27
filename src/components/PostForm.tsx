"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Badge } from "./ui/Badge";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Mood } from "@/lib/themes";
import { useMood } from "@/contexts/MoodContext";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

interface PostFormProps {
  initialData?: {
    title: string;
    content: string;
    tags: string[];
    mood?: Mood;
  };
  onSubmit: (data: {
    title: string;
    content: string;
    tags: string[];
    mood?: Mood;
  }) => Promise<void>;
  isLoading?: boolean;
}

const AVAILABLE_MOODS: Mood[] = [
  "romantic",
  "sciFi",
  "mystery",
  "adventure",
  "fantasy",
  "horror",
  "comedy",
  "drama",
  "thriller",
];

export function PostForm({ initialData, onSubmit, isLoading }: PostFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>(
    initialData?.mood
  );
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const { mood: currentMood } = useMood();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ title, content, tags, mood: selectedMood });
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl bg-surface-light dark:bg-surface-dark shadow-xl p-6">
          <div className="space-y-4">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post title..."
              required
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Content (Markdown)
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content in Markdown..."
                  className="min-h-[400px] font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Preview
                </label>
                <div className="min-h-[400px] rounded-lg border border-gray-200 dark:border-gray-700 p-4 overflow-auto prose dark:prose-invert max-w-none">
                  <ReactMarkdown>
                    {content || "Nothing to preview"}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add tags (press Enter)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mood
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_MOODS.map((mood) => (
                    <Badge
                      key={mood}
                      variant={selectedMood === mood ? "default" : "outline"}
                      className={`cursor-pointer ${
                        selectedMood === mood
                          ? `bg-accent-${mood}/10 text-accent-${mood}`
                          : ""
                      }`}
                      onClick={() => setSelectedMood(mood)}
                    >
                      {mood}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAIAssistant(!showAIAssistant)}
          >
            {showAIAssistant ? "Hide AI Assistant" : "Show AI Assistant"}
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {initialData ? "Update Post" : "Create Post"}
          </Button>
        </div>
      </form>

      <AnimatePresence>
        {showAIAssistant && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed inset-y-0 right-0 w-96 bg-surface-light dark:bg-surface-dark shadow-xl p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">AI Writing Assistant</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAIAssistant(false)}
              >
                ×
              </Button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get AI-powered suggestions to improve your writing:
              </p>
              <Button variant="outline" className="w-full">
                Improve Writing Style
              </Button>
              <Button variant="outline" className="w-full">
                Generate Title Ideas
              </Button>
              <Button variant="outline" className="w-full">
                Check Grammar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
