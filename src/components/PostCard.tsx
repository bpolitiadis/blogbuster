import Link from "next/link";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";
import { formatDistanceToNow } from "date-fns";

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
  const excerpt =
    post.content.length > 200
      ? `${post.content.slice(0, 200)}...`
      : post.content;

  return (
    <article className="flex flex-col space-y-4 rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Avatar fallback={post.author.username} size="sm" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {post.author.username}
            </p>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
        {post.mood && (
          <Badge variant="secondary" className="text-xs">
            {post.mood}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <Link href={`/posts/${post.id}`}>
          <h2 className="text-xl font-semibold text-gray-900 hover:text-primary">
            {post.title}
          </h2>
        </Link>
        <p className="text-gray-600">{excerpt}</p>
      </div>

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link key={tag} href={`/posts?tag=${tag}`}>
              <Badge variant="outline" className="hover:bg-secondary">
                #{tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
