import { useState } from "react";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Textarea";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  content: string;
  author: {
    username: string;
    email: string;
  };
  createdAt: string;
  replies?: Comment[];
}

interface CommentThreadProps {
  comment: Comment;
  currentUser?: {
    username: string;
    email: string;
  };
  onReply: (content: string, parentId: string) => Promise<void>;
}

export function CommentThread({
  comment,
  currentUser,
  onReply,
}: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onReply(replyContent, comment.id);
      setReplyContent("");
      setIsReplying(false);
    } catch (error) {
      console.error("Failed to submit reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="flex items-start space-x-4">
          <Avatar fallback={comment.author.username} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                {comment.author.username}
              </p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <p className="mt-1 text-sm text-gray-700">{comment.content}</p>
            {currentUser && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setIsReplying(!isReplying)}
              >
                Reply
              </Button>
            )}
          </div>
        </div>

        {isReplying && (
          <div className="mt-4 space-y-3">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              className="min-h-[100px]"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleReply}
                disabled={!replyContent.trim() || isSubmitting}
                isLoading={isSubmitting}
              >
                Reply
              </Button>
            </div>
          </div>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 space-y-4 border-l-2 border-gray-100 pl-4">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
