import { useState } from "react";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Textarea";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/features/auth/AuthContext";

interface DebateProps {
  debate: {
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
  };
  onReply: (content: string) => Promise<void>;
  onVote: (votedFor: string) => Promise<void>;
}

export function Debate({ debate, onReply, onVote }: DebateProps) {
  const { user } = useAuth();
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isParticipant =
    user && (user.id === debate.user1.id || user.id === debate.user2.id);
  const hasReplied =
    user && debate.replies.some((reply) => reply.userId === user.id);
  const hasVoted = user && debate.votes.some((vote) => vote.userId === user.id);
  const canVote =
    user && !isParticipant && !hasVoted && debate.status === "active";

  const user1Votes = debate.votes.filter(
    (vote) => vote.votedFor === debate.user1.id
  ).length;
  const user2Votes = debate.votes.filter(
    (vote) => vote.votedFor === debate.user2.id
  ).length;

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onReply(replyContent);
      setReplyContent("");
    } catch (error) {
      console.error("Failed to submit reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (votedFor: string) => {
    setIsSubmitting(true);
    try {
      await onVote(votedFor);
    } catch (error) {
      console.error("Failed to submit vote:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Debate</h3>
        <p className="mt-1 text-sm text-gray-500">
          {debate.user1.username} vs {debate.user2.username}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {debate.status === "active" ? (
            <>
              Ends in{" "}
              {formatDistanceToNow(new Date(debate.expiresAt), {
                addSuffix: true,
              })}
            </>
          ) : (
            <>
              Ended{" "}
              {formatDistanceToNow(new Date(debate.expiresAt), {
                addSuffix: true,
              })}
            </>
          )}
        </p>
      </div>

      <div className="space-y-6">
        {debate.replies.map((reply) => (
          <div key={reply.userId} className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-start space-x-4">
              <Avatar
                fallback={
                  reply.userId === debate.user1.id
                    ? debate.user1.username
                    : debate.user2.username
                }
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {reply.userId === debate.user1.id
                      ? debate.user1.username
                      : debate.user2.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(reply.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <p className="mt-1 text-sm text-gray-700">{reply.content}</p>
              </div>
            </div>
          </div>
        ))}

        {isParticipant && !hasReplied && debate.status === "active" && (
          <div className="space-y-3">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleReply}
                disabled={!replyContent.trim() || isSubmitting}
                isLoading={isSubmitting}
              >
                Submit Reply
              </Button>
            </div>
          </div>
        )}

        {canVote && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">
              Cast your vote
            </h4>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => handleVote(debate.user1.id)}
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Vote for {debate.user1.username}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleVote(debate.user2.id)}
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Vote for {debate.user2.username}
              </Button>
            </div>
          </div>
        )}

        {debate.status === "completed" && debate.winner && (
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">
              Winner: {debate.winner.username}
            </p>
            <p className="mt-1 text-sm text-green-700">
              {debate.winner.id === debate.user1.id
                ? `${debate.user1.username}: ${user1Votes} votes`
                : `${debate.user2.username}: ${user2Votes} votes`}
            </p>
          </div>
        )}

        {debate.status === "active" && (
          <div className="flex justify-between text-sm text-gray-500">
            <span>
              {user1Votes} votes for {debate.user1.username}
            </span>
            <span>
              {user2Votes} votes for {debate.user2.username}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
