import Link from "next/link";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";
import { formatDistanceToNow } from "date-fns";
import { useMood } from "@/contexts/MoodContext";

interface PostCardProps {
  post: {
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
  };
}

export function PostCard({ post }: PostCardProps) {
  const { mood } = useMood();
  const excerpt =
    post.content.length > 200
      ? `${post.content.slice(0, 200)}...`
      : post.content;

  return (
    <article className="group relative mb-6 break-inside-avoid rounded-lg border bg-surface-light dark:bg-surface-dark p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary-dark/5 dark:to-secondary-dark/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar fallback={post.author.username} size="sm" />
            <div>
              <p className="text-sm font-medium text-text-light dark:text-text-dark">
                {post.author.username}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
          {post.mood && (
            <Badge
              variant={post.mood.toLowerCase() as any}
              className="text-xs"
            >
              {post.mood}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <Link href={`/post/${post.id}`}>
            <h2 className="text-xl font-semibold text-text-light dark:text-text-dark hover:text-primary dark:hover:text-primary-dark transition-colors duration-200">
              {post.title}
            </h2>
          </Link>
          <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
            {excerpt}
          </p>
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/posts?tag=${tag}`}>
                <Badge
                  variant="outline"
                  className="hover:bg-secondary/10 dark:hover:bg-secondary-dark/10 transition-colors duration-200"
                >
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
