import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Trash2, Flag, Eye, EyeOff } from 'lucide-react';
import { Comment } from '../../core/models/types';
import { useAuth } from '../../core/context/AuthContext';
import { commentService } from '../../core/services/commentService';
import { ReputationBadge } from '../user/ReputationBadge';
import { ReportModal } from '../dialogs/ReportModal';

interface CommentItemProps {
  comment: Comment;
  onDelete?: (commentId: string) => void;
  onReport?: (commentId: string) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onDelete,
  onReport
}) => {
  const { currentUser } = useAuth();
  const [voteCount, setVoteCount] = useState<number>(comment.voteCount || 0);
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0);
  const [votingLoading, setVotingLoading] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const isLowScore = voteCount <= -2;

  useEffect(() => {
    if (currentUser) {
      commentService.getUserVote(currentUser.uid, comment.commentId).then(setUserVote);
    }
  }, [currentUser, comment.commentId]);

  const handleVote = async (value: 1 | -1) => {
    if (!currentUser || votingLoading) return;
    setVotingLoading(true);

    const oldVote = userVote;
    const oldScore = voteCount;

    let delta: number = value;
    if (userVote === value) {
      setUserVote(0);
      delta = -value;
    } else if (userVote !== 0) {
      setUserVote(value);
      delta = value * 2;
    } else {
      setUserVote(value);
      delta = value;
    }
    setVoteCount((prev) => prev + delta);

    try {
      await commentService.voteComment(currentUser.uid, comment.commentId, comment.targetId, value);
    } catch (err) {
      console.warn('Error voting on comment:', err);
      setUserVote(oldVote);
      setVoteCount(oldScore);
    } finally {
      setVotingLoading(false);
    }
  };

  if (isLowScore && !isRevealed) {
    return (
      <div className="p-2.5 rounded-lg bg-neutral-100/70 dark:bg-neutral-850/60 border border-neutral-200 dark:border-neutral-800 text-xs flex items-center justify-between text-neutral-500">
        <span className="flex items-center gap-1.5 italic text-[11px]">
          <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
          Comment hidden due to low community score ({voteCount})
        </span>
        <button
          type="button"
          onClick={() => setIsRevealed(true)}
          className="text-blue-600 dark:text-blue-400 hover:underline font-semibold text-[11px] cursor-pointer"
        >
          Show hidden comment
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 text-xs border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-colors">
        <div className="flex items-center justify-between text-neutral-400 mb-1">
          <div className="flex items-center gap-1.5 font-semibold text-neutral-700 dark:text-neutral-300">
            <span>{comment.isAnonymous ? 'Anonymous' : comment.authorDisplayName}</span>
            {!comment.isAnonymous && comment.authorUid && (
              <ReputationBadge userId={comment.authorUid} size="xs" />
            )}
            {isLowScore && isRevealed && (
              <span className="text-[10px] px-1 rounded bg-rose-100 dark:bg-rose-950 text-rose-600 font-normal">
                Low score
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
            
            {/* Report */}
            <button
              type="button"
              onClick={() => {
                if (onReport) onReport(comment.commentId);
                else setReportModalOpen(true);
              }}
              className="text-neutral-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer p-0.5 transition-colors"
              title="Report comment"
              aria-label="Report comment"
            >
              <Flag className="w-3 h-3" />
            </button>

            {/* Delete */}
            {currentUser && comment.authorUid === currentUser.uid && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(comment.commentId)}
                className="text-neutral-400 hover:text-red-600 cursor-pointer p-0.5 transition-colors"
                title="Delete comment"
                aria-label="Delete comment"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed pl-0.5">
          {comment.body}
        </p>

        {/* Voting row on comment */}
        <div className="flex items-center gap-1.5 pt-1.5 mt-1 border-t border-neutral-100 dark:border-neutral-800/60 text-[11px]">
          <div className="flex items-center gap-0.5 bg-neutral-200/50 dark:bg-neutral-800/80 rounded px-1 py-0.5">
            <button
              type="button"
              onClick={() => handleVote(1)}
              disabled={!currentUser || votingLoading}
              className={`p-0.5 hover:text-emerald-600 cursor-pointer transition-colors ${
                userVote === 1 ? 'text-emerald-600 font-bold' : 'text-neutral-400'
              }`}
              title="Upvote comment"
              aria-label="Upvote comment"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <span className={`px-1 font-mono font-semibold tabular-nums text-[10px] ${
              voteCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : voteCount < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-500'
            }`}>
              {voteCount}
            </span>
            <button
              type="button"
              onClick={() => handleVote(-1)}
              disabled={!currentUser || votingLoading}
              className={`p-0.5 hover:text-rose-600 cursor-pointer transition-colors ${
                userVote === -1 ? 'text-rose-600 font-bold' : 'text-neutral-400'
              }`}
              title="Downvote comment"
              aria-label="Downvote comment"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLowScore && isRevealed && (
            <button
              type="button"
              onClick={() => setIsRevealed(false)}
              className="text-[10px] text-neutral-400 hover:underline cursor-pointer ml-auto"
            >
              Hide again
            </button>
          )}
        </div>
      </div>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="comment"
        targetId={comment.commentId}
      />
    </>
  );
};
