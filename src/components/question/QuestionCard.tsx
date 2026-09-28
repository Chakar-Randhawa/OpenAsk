import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Eye,
  Bookmark,
  Share2,
  MoreHorizontal,
  Flag,
  User,
  EyeOff
} from 'lucide-react';
import { Question } from '../../core/models/types';
import { useAuth } from '../../core/context/AuthContext';
import { questionService } from '../../core/services/questionService';
import { ReportModal } from '../dialogs/ReportModal';
import { ShareModal } from '../dialogs/ShareModal';

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

  return (
    <>
      <article className="p-4 sm:p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
        
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
            <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>

            {/* Author or Anonymous */}
            {question.isAnonymous ? (
              <span className="flex items-center gap-1 text-neutral-500">
                <EyeOff className="w-3 h-3" /> Anonymous
              </span>
            ) : question.authorUsername ? (
              <Link
                to={`/user/${question.authorUsername}`}
                className="hover:underline text-neutral-600 dark:text-neutral-400 truncate max-w-[120px]"
              >
                @{question.authorUsername}
              </Link>
            ) : (
              <span className="text-neutral-500">{question.authorDisplayName || 'Member'}</span>
            )}

            <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
            <span>{timeAgo(question.createdAt)}</span>
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
          <div className="flex items-center gap-4">
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
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Share question"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
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
      />
    </>
  );
};
