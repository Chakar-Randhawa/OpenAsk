import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Share2,
  Flag,
  MoreHorizontal,
  Trash2,
  Edit3,
  MessageCircle,
  EyeOff
} from 'lucide-react';
import { Answer, Comment } from '../../core/models/types';
import { useAuth } from '../../core/context/AuthContext';
import { answerService } from '../../core/services/answerService';
import { commentService } from '../../core/services/commentService';
import { notificationService } from '../../core/services/notificationService';
import { ReportModal } from '../dialogs/ReportModal';
import { ShareModal } from '../dialogs/ShareModal';

interface AnswerCardProps {
  answer: Answer;
  onDelete?: (answerId: string) => void;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({ answer, onDelete }) => {
  const { currentUser, userProfile } = useAuth();
  const [currentBody, setCurrentBody] = useState(answer.body);
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(answer.body);
  const [savingEdit, setSavingEdit] = useState(false);
  const [isEdited, setIsEdited] = useState(Boolean(answer.updatedAt && answer.updatedAt > answer.createdAt));

  const [voteCount, setVoteCount] = useState(answer.voteCount);
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0);
  const [helpfulCount, setHelpfulCount] = useState(answer.helpfulCount);
  const [isHelpful, setIsHelpful] = useState(false);
  const [votingLoading, setVotingLoading] = useState(false);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentAnonymous, setCommentAnonymous] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Modals
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      answerService.getUserVote(currentUser.uid, answer.answerId).then(setUserVote);
      answerService.isHelpfulMarked(currentUser.uid, answer.answerId).then(setIsHelpful);
    }
  }, [currentUser, answer.answerId]);

  const handleVote = async (val: 1 | -1) => {
    if (!currentUser || votingLoading) return;
    setVotingLoading(true);
    try {
      const delta = await answerService.voteAnswer(currentUser.uid, answer.answerId, answer.questionId, val);
      setVoteCount(prev => prev + delta);
      setUserVote(prev => (prev === val ? 0 : val));
    } catch (err) {
      console.error('Error voting:', err);
    } finally {
      setVotingLoading(false);
    }
  };

  const handleToggleHelpful = async () => {
    if (!currentUser) return;
    try {
      const marked = await answerService.markHelpful(currentUser.uid, answer.answerId, answer.questionId);
      setIsHelpful(marked);
      setHelpfulCount(prev => prev + (marked ? 1 : -1));

      if (marked && answer.authorUid && answer.authorUid !== currentUser.uid) {
        notificationService.createNotification(
          answer.authorUid,
          'helpful',
          'Your Answer was Marked Helpful!',
          `${userProfile?.displayName || 'Someone'} marked your answer as helpful.`,
          answer.questionId,
          'question',
          currentUser.uid,
          userProfile?.displayName || 'Member'
        );
      }
    } catch (err) {
      console.error('Error marking helpful:', err);
    }
  };

  const loadComments = async () => {
    try {
      const list = await commentService.getCommentsForTarget('answer', answer.answerId);
      setComments(list);
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  const handleToggleComments = () => {
    if (!commentsOpen && comments.length === 0) {
      loadComments();
    }
    setCommentsOpen(!commentsOpen);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !commentText.trim() || commentSubmitting) return;
    setCommentSubmitting(true);
    try {
      const newComment = await commentService.createComment(
        'answer',
        answer.answerId,
        commentText.trim(),
        commentAnonymous,
        currentUser.uid,
        userProfile?.displayName || 'Member',
        userProfile?.username || 'user'
      );
      setComments(prev => [...prev, newComment]);
      setCommentText('');

      if (answer.authorUid && answer.authorUid !== currentUser.uid) {
        notificationService.createNotification(
          answer.authorUid,
          'comment',
          'New Comment on your Answer',
          commentAnonymous ? 'An anonymous member commented on your answer.' : `${userProfile?.displayName || 'A member'} commented on your answer.`,
          answer.questionId,
          'question',
          commentAnonymous ? undefined : currentUser.uid,
          commentAnonymous ? undefined : (userProfile?.displayName || 'Member')
        );
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser) return;
    try {
      await commentService.deleteComment(commentId, currentUser.uid);
      setComments(prev => prev.filter(c => c.commentId !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const isOwner = currentUser && answer.authorUid === currentUser.uid;

  const handleSaveEdit = async () => {
    if (!currentUser || !editBody.trim() || savingEdit) return;
    setSavingEdit(true);
    try {
      await answerService.editAnswer(answer.answerId, editBody.trim(), currentUser.uid);
      setCurrentBody(editBody.trim());
      setIsEditing(false);
      setIsEdited(true);
    } catch (err) {
      console.error('Error saving answer edit:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <>
      <article className="p-4 sm:p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
        
        {/* Header: Author & Date */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {answer.isAnonymous ? (
              <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 font-medium">
                <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                  <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
                </div>
                <span>Anonymous</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {answer.authorPhotoUrl ? (
                  <img
                    src={answer.authorPhotoUrl}
                    alt={answer.authorDisplayName || ''}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-bold text-[10px]">
                    {answer.authorDisplayName ? answer.authorDisplayName[0].toUpperCase() : 'U'}
                  </div>
                )}
                {answer.authorUsername ? (
                  <Link
                    to={`/user/${answer.authorUsername}`}
                    className="font-medium text-neutral-900 dark:text-neutral-200 hover:underline"
                  >
                    {answer.authorDisplayName}
                    <span className="text-neutral-400 font-normal ml-1">@{answer.authorUsername}</span>
                  </Link>
                ) : (
                  <span className="font-medium text-neutral-900 dark:text-neutral-200">
                    {answer.authorDisplayName || 'Member'}
                  </span>
                )}
              </div>
            )}

            <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
            <span className="text-neutral-400">{new Date(answer.createdAt).toLocaleDateString()}</span>
            {isEdited && (
              <span className="text-neutral-400 text-[11px] italic">(edited)</span>
            )}
          </div>

          {/* Action Overflow */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md cursor-pointer"
              aria-label="More actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-1 w-32 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 text-xs z-30"
                onClick={() => setMenuOpen(false)}
              >
                {isOwner && (
                  <button
                    onClick={() => {
                      setEditBody(currentBody);
                      setIsEditing(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left text-neutral-700 dark:text-neutral-300 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
                <button
                  onClick={() => setShareModalOpen(true)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left text-neutral-700 dark:text-neutral-300 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left text-neutral-700 dark:text-neutral-300 cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" /> Report
                </button>
                {isOwner && onDelete && (
                  <button
                    onClick={() => onDelete(answer.answerId)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-left text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Answer Text or Inline Editor */}
        {isEditing ? (
          <div className="space-y-2 pt-1">
            <textarea
              rows={4}
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-neutral-400 text-neutral-900 dark:text-white"
            />
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={!editBody.trim() || savingEdit}
                className="px-3.5 py-1 font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
              >
                {savingEdit ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-line">
            {currentBody}
          </div>
        )}

        {/* Action Controls: Votes, Helpful, Comments */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
          
          {/* Deterministic Voting Controls */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/60 rounded-lg p-0.5">
            <button
              onClick={() => handleVote(1)}
              disabled={!currentUser || votingLoading}
              className={`p-1.5 rounded-md hover:bg-white dark:hover:bg-neutral-700 transition-colors ${
                userVote === 1 ? 'text-emerald-600 font-bold bg-white dark:bg-neutral-700 shadow-xs' : 'text-neutral-500'
              }`}
              title="Upvote"
              aria-label="Upvote"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            
            <span className="px-1.5 font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
              {voteCount}
            </span>

            <button
              onClick={() => handleVote(-1)}
              disabled={!currentUser || votingLoading}
              className={`p-1.5 rounded-md hover:bg-white dark:hover:bg-neutral-700 transition-colors ${
                userVote === -1 ? 'text-rose-600 font-bold bg-white dark:bg-neutral-700 shadow-xs' : 'text-neutral-500'
              }`}
              title="Downvote"
              aria-label="Downvote"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Helpful Indicator Button */}
            <button
              onClick={handleToggleHelpful}
              disabled={!currentUser}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                isHelpful
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-medium'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isHelpful ? 'text-emerald-600' : 'text-neutral-400'}`} />
              <span>Helpful</span>
              {helpfulCount > 0 && <span className="tabular-nums">({helpfulCount})</span>}
            </button>

            {/* Comments Toggle */}
            <button
              onClick={handleToggleComments}
              className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{comments.length > 0 ? comments.length : 'Comment'}</span>
            </button>
          </div>

        </div>

        {/* Discussion Comments Section */}
        {commentsOpen && (
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
            {comments.map((cm) => (
              <div key={cm.commentId} className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 text-xs">
                <div className="flex items-center justify-between text-neutral-400 mb-1">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {cm.isAnonymous ? 'Anonymous' : cm.authorDisplayName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{new Date(cm.createdAt).toLocaleDateString()}</span>
                    {currentUser && cm.authorUid === currentUser.uid && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(cm.commentId)}
                        className="text-neutral-400 hover:text-red-600 cursor-pointer p-0.5"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-neutral-800 dark:text-neutral-200">{cm.body}</p>
              </div>
            ))}

            {currentUser ? (
              <form onSubmit={handleAddComment} className="pt-2 space-y-2">
                <input
                  type="text"
                  placeholder="Write a civil reply or comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-neutral-400"
                />
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-1.5 text-neutral-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={commentAnonymous}
                      onChange={(e) => setCommentAnonymous(e.target.checked)}
                      className="rounded border-neutral-300 dark:border-neutral-700"
                    />
                    <span>Reply anonymously</span>
                  </label>
                  <button
                    type="submit"
                    disabled={!commentText.trim() || commentSubmitting}
                    className="px-3 py-1 text-xs font-medium text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-md disabled:opacity-50"
                  >
                    Reply
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-neutral-500 italic">
                <Link to="/login" className="underline font-medium">Sign in</Link> to leave a reply.
              </p>
            )}
          </div>
        )}

      </article>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="answer"
        targetId={answer.answerId}
      />

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="OpenAsk Answer"
        url={`${window.location.origin}/question/${answer.questionId}#${answer.answerId}`}
      />
    </>
  );
};
