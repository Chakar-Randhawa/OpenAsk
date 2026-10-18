import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Eye,
  Bookmark,
  Share2,
  MoreHorizontal,
  Flag,
  User,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { Question } from '../../core/models/types';
import { useAuth } from '../../core/context/AuthContext';
import { questionService } from '../../core/services/questionService';
import { ReportModal } from '../dialogs/ReportModal';
import { ShareModal } from '../dialogs/ShareModal';
import { ReputationBadge } from '../user/ReputationBadge';
import { ReadTimeBadge } from '../ui/ReadTimeBadge';

interface QuestionCardProps {
  question: Question;
  isSavedInitial?: boolean;
  onDelete?: (questionId: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isSavedInitial = false,
  onDelete
}) => {
  const { currentUser } = useAuth();
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Voting & Quality controls
  const [voteCount, setVoteCount] = useState<number>(question.voteCount || 0);
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0);
  const [votingLoading, setVotingLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState((question.voteCount || 0) <= -3);

  useEffect(() => {
    if (currentUser) {
      questionService.getUserVote(currentUser.uid, question.questionId).then(setUserVote);
    }
  }, [currentUser, question.questionId]);

  const handleVote = async (e: React.MouseEvent, val: 1 | -1) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser || votingLoading) return;
    setVotingLoading(true);

    const oldVote = userVote;
    const oldScore = voteCount;

    let delta: number = val;
    if (userVote === val) {
      setUserVote(0);
      delta = -val;
    } else if (userVote !== 0) {
      setUserVote(val);
      delta = val * 2;
    } else {
      setUserVote(val);
      delta = val;
    }
    setVoteCount((prev) => prev + delta);

    try {
      await questionService.voteQuestion(currentUser.uid, question.questionId, val);
    } catch (err) {
      console.error('Error voting on question:', err);
      setUserVote(oldVote);
      setVoteCount(oldScore);
    } finally {
      setVotingLoading(false);
    }
  };

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) return;
    try {
      if (isSaved) {
        await questionService.unsaveQuestion(currentUser.uid, question.questionId);
        setIsSaved(false);
      } else {
        await questionService.saveQuestion(currentUser.uid, question);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const timeAgo = (dateStr: string) => {
    try {
      const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diffSec < 60) return 'just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 30) return `${diffDays}d ago`;
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return '';
    }
  };

  const isOwner = currentUser && question.authorUid === currentUser.uid;

  if (voteCount <= -3 && isCollapsed) {
    return (
      <article className="p-3.5 bg-neutral-100/70 dark:bg-neutral-850/60 border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-neutral-500">
          <EyeOff className="w-4 h-4 text-neutral-400 shrink-0" />
          <span>Question collapsed due to low community score ({voteCount})</span>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer shrink-0"
        >
          Show question
        </button>
      </article>
    );
  }

  return (
    <>
      <article className={`p-4 sm:p-5 bg-white dark:bg-neutral-900 border rounded-xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors ${
        voteCount >= 8 ? 'border-amber-200 dark:border-amber-800/80 shadow-xs' : 'border-neutral-200 dark:border-neutral-800'
      }`}>
        
        {/* Unboxed Metadata Row with typographic separator */}
        <div className="flex items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {/* Category as unboxed text */}
            <Link
              to={`/category/${question.categoryId}`}
              className="font-medium text-neutral-800 dark:text-neutral-200 hover:underline truncate"
            >
              {question.categoryName || question.categoryId}
            </Link>

            {Boolean(question.acceptedAnswerId || question.isSolved) && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                <CheckCircle className="w-2.5 h-2.5 fill-emerald-600 text-white dark:text-neutral-900" /> Solved
              </span>
            )}

            {voteCount >= 8 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                <Sparkles className="w-2.5 h-2.5" /> High Signal
              </span>
            )}

            <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>

            {/* Author or Anonymous */}
            {question.isAnonymous ? (
              <span className="flex items-center gap-1 text-neutral-500">
                <EyeOff className="w-3 h-3" /> Anonymous
              </span>
            ) : question.authorUsername ? (
              <div className="flex items-center gap-1.5 truncate">
                <Link
                  to={`/user/${question.authorUsername}`}
                  className="hover:underline text-neutral-600 dark:text-neutral-400 truncate max-w-[120px]"
                >
                  @{question.authorUsername}
                </Link>
                <ReputationBadge userId={question.authorUid} size="xs" />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-neutral-500">{question.authorDisplayName || 'Member'}</span>
                <ReputationBadge userId={question.authorUid} size="xs" />
              </div>
            )}

            <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
            <span>{timeAgo(question.createdAt)}</span>
            <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
            <ReadTimeBadge content={`${question.title} ${question.body}`} />
          </div>

          {/* Action Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md transition-colors"
              aria-label="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-1 w-36 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 text-xs z-30"
                onClick={() => setMenuOpen(false)}
              >
                <button
                  onClick={() => setShareModalOpen(true)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left text-neutral-700 dark:text-neutral-300"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left text-neutral-700 dark:text-neutral-300"
                >
                  <Flag className="w-3.5 h-3.5" /> Report
                </button>
                {isOwner && onDelete && (
                  <button
                    onClick={() => onDelete(question.questionId)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-left text-red-600"
                  >
                    Delete Question
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-base sm:text-lg font-semibold text-neutral-950 dark:text-white leading-snug mb-2">
          <Link
            to={`/question/${question.questionId}`}
            className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            {question.title}
          </Link>
        </h2>

        {/* Body Preview */}
        {question.body && (
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-3">
            {question.body}
          </p>
        )}

        {/* Tags (clean unboxed text list) */}
        {question.tagIds && question.tagIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 mb-3">
            {question.tagIds.map((tag) => (
              <Link
                key={tag}
                to={`/search?q=${encodeURIComponent(tag)}`}
                className="hover:text-neutral-900 dark:hover:text-neutral-100 hover:underline"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Action Row */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/60 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Question Voting Controls */}
            <div className="flex items-center gap-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={(e) => handleVote(e, 1)}
                disabled={!currentUser || votingLoading}
                className={`p-1 rounded-md hover:bg-white dark:hover:bg-neutral-700 transition-colors cursor-pointer ${
                  userVote === 1 ? 'text-emerald-600 font-bold bg-white dark:bg-neutral-700 shadow-xs' : 'text-neutral-500'
                }`}
                title="Upvote question"
                aria-label="Upvote question"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <span className={`px-1 font-semibold tabular-nums text-xs ${
                voteCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : voteCount < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-900 dark:text-neutral-100'
              }`}>
                {voteCount}
              </span>
              <button
                type="button"
                onClick={(e) => handleVote(e, -1)}
                disabled={!currentUser || votingLoading}
                className={`p-1 rounded-md hover:bg-white dark:hover:bg-neutral-700 transition-colors cursor-pointer ${
                  userVote === -1 ? 'text-rose-600 font-bold bg-white dark:bg-neutral-700 shadow-xs' : 'text-neutral-500'
                }`}
                title="Downvote question"
                aria-label="Downvote question"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <Link
              to={`/question/${question.questionId}`}
              className="flex items-center gap-1.5 hover:text-neutral-950 dark:hover:text-white transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="font-medium tabular-nums">{question.answerCount}</span>
              <span className="hidden xs:inline">
                {question.answerCount === 1 ? 'answer' : 'answers'}
              </span>
            </Link>

            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-neutral-400" />
              <span className="tabular-nums">{question.viewCount}</span>
              <span className="hidden xs:inline">views</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleSaveToggle}
              className={`p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                isSaved ? 'text-neutral-950 dark:text-white font-bold' : 'text-neutral-400 hover:text-neutral-700'
              }`}
              title={isSaved ? 'Remove bookmark' : 'Bookmark question'}
              aria-label="Bookmark"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => setShareModalOpen(true)}
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Share question"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setReportModalOpen(true)}
              className="p-1.5 rounded-md text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Report question"
              aria-label="Report question"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>

      </article>

      {/* Modals */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="question"
        targetId={question.questionId}
      />

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={question.title}
        url={`${window.location.origin}/question/${question.questionId}`}
        targetType="question"
      />
    </>
  );
};
