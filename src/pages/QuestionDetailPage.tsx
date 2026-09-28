import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Eye,
  Bookmark,
  Share2,
  Flag,
  Trash2,
  EyeOff,
  Bell,
  ArrowLeft,
  Edit3,
  MessageCircle,
  ChevronRight
} from 'lucide-react';
import { Question, Answer, Comment } from '../core/models/types';
import { questionService } from '../core/services/questionService';
import { answerService } from '../core/services/answerService';
import { commentService } from '../core/services/commentService';
import { notificationService } from '../core/services/notificationService';
import { useAuth } from '../core/context/AuthContext';
import { AnswerCard } from '../components/answer/AnswerCard';
import { ReportModal } from '../components/dialogs/ReportModal';
import { ShareModal } from '../components/dialogs/ShareModal';
import { ConfirmModal } from '../components/dialogs/ConfirmModal';

export const QuestionDetailPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [relatedQuestions, setRelatedQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [sortOrder, setSortOrder] = useState<'votes' | 'newest'>('votes');

  // Question editing state
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [savingQuestionEdit, setSavingQuestionEdit] = useState(false);

  // Question comments state
  const [questionComments, setQuestionComments] = useState<Comment[]>([]);
  const [questionCommentsOpen, setQuestionCommentsOpen] = useState(false);
  const [questionCommentText, setQuestionCommentText] = useState('');
  const [questionCommentAnon, setQuestionCommentAnon] = useState(false);
  const [submittingQComment, setSubmittingQComment] = useState(false);

  // Answer composer state
  const [answerBody, setAnswerBody] = useState('');
  const [isAnonymousAnswer, setIsAnonymousAnswer] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // Modals
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState(false);
  const [answerToDelete, setAnswerToDelete] = useState<string | null>(null);
  const [deletingAnswer, setDeletingAnswer] = useState(false);

  useEffect(() => {
    if (!questionId) return;
    setLoading(true);

    // Increment view count non-blockingly
    questionService.incrementViewCount(questionId);

    Promise.all([
      questionService.getQuestionById(questionId),
      answerService.getAnswersForQuestion(questionId, sortOrder),
      commentService.getCommentsForTarget('question', questionId),
      currentUser ? questionService.isSavedQuestion(currentUser.uid, questionId) : Promise.resolve(false),
      currentUser ? questionService.isFollowingQuestion(currentUser.uid, questionId) : Promise.resolve(false)
    ]).then(async ([q, ansList, qComments, saved, following]) => {
      setQuestion(q);
      setAnswers(ansList);
      setQuestionComments(qComments);
      setIsSaved(saved);
      setIsFollowing(following);
      setLoading(false);

      if (q && q.categoryId) {
        try {
          const related = await questionService.getQuestions({
            categoryId: q.categoryId,
            limitCount: 5
          });
          setRelatedQuestions(related.filter(item => item.questionId !== q.questionId).slice(0, 4));
        } catch (e) {
          console.warn('Failed to load related questions:', e);
        }
      }
    });
  }, [questionId, currentUser, sortOrder]);

  const handleStartEditQuestion = () => {
    if (!question) return;
    setEditTitle(question.title);
    setEditBody(question.body);
    setIsEditingQuestion(true);
  };

  const handleSaveQuestionEdit = async () => {
    if (!currentUser || !question || !editTitle.trim() || !editBody.trim() || savingQuestionEdit) return;
    setSavingQuestionEdit(true);
    try {
      await questionService.editQuestion(question.questionId, editTitle.trim(), editBody.trim(), currentUser.uid);
      setQuestion(prev => prev ? {
        ...prev,
        title: editTitle.trim(),
        body: editBody.trim(),
        updatedAt: new Date().toISOString()
      } : null);
      setIsEditingQuestion(false);
    } catch (err) {
      console.error('Error saving question edit:', err);
    } finally {
      setSavingQuestionEdit(false);
    }
  };

  const handleAddQuestionComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !question || !questionCommentText.trim() || submittingQComment) return;
    setSubmittingQComment(true);
    try {
      const newComment = await commentService.createComment(
        'question',
        question.questionId,
        questionCommentText.trim(),
        questionCommentAnon,
        currentUser.uid,
        userProfile?.displayName || 'Member',
        userProfile?.username || 'user'
      );
      setQuestionComments(prev => [...prev, newComment]);
      setQuestionCommentText('');

      // Notify question author if not self and author is known
      if (question.authorUid && question.authorUid !== currentUser.uid) {
        notificationService.createNotification(
          question.authorUid,
          'comment',
          'New Comment on your Question',
          questionCommentAnon ? 'An anonymous member commented on your question.' : `${userProfile?.displayName || 'A member'} commented on your question.`,
          question.questionId,
          'question',
          questionCommentAnon ? undefined : currentUser.uid,
          questionCommentAnon ? undefined : (userProfile?.displayName || 'Member')
        );
      }
    } catch (err) {
      console.error('Error posting question comment:', err);
    } finally {
      setSubmittingQComment(false);
    }
  };

  const handleDeleteQuestionComment = async (commentId: string) => {
    if (!currentUser) return;
    try {
      await commentService.deleteComment(commentId, currentUser.uid);
      setQuestionComments(prev => prev.filter(c => c.commentId !== commentId));
    } catch (err) {
      console.error('Error deleting question comment:', err);
    }
  };

  const handleToggleSave = async () => {
    if (!currentUser || !question) return;
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

  const handleToggleFollow = async () => {
    if (!currentUser || !question) return;
    try {
      if (isFollowing) {
        await questionService.unfollowQuestion(currentUser.uid, question.questionId);
        setIsFollowing(false);
      } else {
        await questionService.followQuestion(currentUser.uid, question.questionId);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  const handleDeleteQuestion = () => {
    if (!currentUser || !question) return;
    setDeleteConfirmOpen(true);
  };

  const handleExecuteDeleteQuestion = async () => {
    if (!currentUser || !question) return;
    setDeletingQuestion(true);
    try {
      await questionService.deleteQuestion(question.questionId, currentUser.uid);
      navigate('/');
    } catch (err) {
      console.error('Error deleting question:', err);
    } finally {
      setDeletingQuestion(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !question || !answerBody.trim() || submittingAnswer) return;

    setSubmittingAnswer(true);
    try {
      const newAnswerId = await answerService.createAnswer({
        questionId: question.questionId,
        body: answerBody.trim(),
        isAnonymous: isAnonymousAnswer,
        authorUid: currentUser.uid,
        authorDisplayName: userProfile?.displayName || 'Member',
        authorUsername: userProfile?.username || 'user',
        authorPhotoUrl: userProfile?.photoUrl
      });

      // Reload answers
      const refreshed = await answerService.getAnswersForQuestion(question.questionId, sortOrder);
      setAnswers(refreshed);
      setAnswerBody('');
      setQuestion(prev => prev ? { ...prev, answerCount: prev.answerCount + 1 } : null);

      // Notify question author
      if (question.authorUid && question.authorUid !== currentUser.uid) {
        notificationService.createNotification(
          question.authorUid,
          'answer',
          'New Answer on your Question',
          isAnonymousAnswer ? 'An anonymous member answered your question.' : `${userProfile?.displayName || 'A member'} answered your question.`,
          question.questionId,
          'question',
          isAnonymousAnswer ? undefined : currentUser.uid,
          isAnonymousAnswer ? undefined : (userProfile?.displayName || 'Member')
        );
      }
    } catch (err) {
      console.error('Error posting answer:', err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleDeleteAnswer = (ansId: string) => {
    if (!currentUser || !question) return;
    setAnswerToDelete(ansId);
  };

  const handleExecuteDeleteAnswer = async () => {
    if (!currentUser || !question || !answerToDelete) return;
    setDeletingAnswer(true);
    try {
      await answerService.deleteAnswer(answerToDelete, question.questionId, currentUser.uid);
      setAnswers(prev => prev.filter(a => a.answerId !== answerToDelete));
      setQuestion(prev => prev ? { ...prev, answerCount: Math.max(0, prev.answerCount - 1) } : null);
      setAnswerToDelete(null);
    } catch (err) {
      console.error('Error deleting answer:', err);
    } finally {
      setDeletingAnswer(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="h-40 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl animate-pulse" />
        <div className="h-32 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-4 max-w-xl mx-auto">
        <h2 className="text-xl font-bold text-neutral-950 dark:text-white">Question Not Found</h2>
        <p className="text-xs text-neutral-500">This question may have been removed or does not exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Feed
        </Link>
      </div>
    );
  }

  const isAuthor = currentUser && question.authorUid === currentUser.uid;

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <Link to="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link to={`/category/${question.categoryId}`} className="hover:underline font-medium text-neutral-800 dark:text-neutral-200">
            {question.categoryName}
          </Link>
        </div>

        {/* Question Header Article */}
        <article className="p-6 sm:p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-4">
          
          {/* Metadata Row */}
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <div className="flex flex-wrap items-center gap-1.5">
              {question.isAnonymous ? (
                <span className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400 font-medium">
                  <EyeOff className="w-3.5 h-3.5" /> Anonymous
                </span>
              ) : question.authorUsername ? (
                <Link to={`/user/${question.authorUsername}`} className="hover:underline font-medium text-neutral-800 dark:text-neutral-200">
                  {question.authorDisplayName} <span className="text-neutral-400 font-normal">@{question.authorUsername}</span>
                </Link>
              ) : (
                <span className="font-medium text-neutral-800 dark:text-neutral-200">{question.authorDisplayName || 'Member'}</span>
              )}
              <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
              <span>Asked {new Date(question.createdAt).toLocaleDateString()}</span>
              {question.updatedAt && question.updatedAt > question.createdAt && (
                <span className="text-neutral-400 text-[11px] italic">(edited)</span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {isAuthor && (
                <>
                  <button
                    onClick={handleStartEditQuestion}
                    className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md transition-colors cursor-pointer"
                    title="Edit question"
                    aria-label="Edit question"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDeleteQuestion}
                    className="p-1.5 text-neutral-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                    title="Delete question"
                    aria-label="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => setShareModalOpen(true)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md transition-colors cursor-pointer"
                title="Share question"
                aria-label="Share question"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setReportModalOpen(true)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md transition-colors cursor-pointer"
                title="Report question"
                aria-label="Report question"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Title and Body or Edit Mode */}
          {isEditingQuestion ? (
            <div className="space-y-3 pt-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={300}
                className="w-full px-3.5 py-2 text-sm sm:text-base font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-neutral-400 text-neutral-900 dark:text-white"
              />
              <textarea
                rows={6}
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-neutral-400 text-neutral-900 dark:text-white"
              />
              <div className="flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsEditingQuestion(false)}
                  className="px-3.5 py-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuestionEdit}
                  disabled={!editTitle.trim() || !editBody.trim() || savingQuestionEdit}
                  className="px-4 py-1.5 font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
                >
                  {savingQuestionEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Title */}
              <h1 className="text-xl sm:text-3xl font-bold text-neutral-950 dark:text-white leading-tight font-display">
                {question.title}
              </h1>

              {/* Body */}
              <div className="text-sm sm:text-base text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-line pt-2">
                {question.body}
              </div>
            </>
          )}

          {/* Tags */}
          {question.tagIds && question.tagIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-neutral-500">
              {question.tagIds.map((tag) => (
                <Link
                  key={tag}
                  to={`/search?q=${encodeURIComponent(tag)}`}
                  className="hover:underline hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs">
            <div className="flex items-center gap-4 text-neutral-500">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                <span className="font-semibold tabular-nums text-neutral-900 dark:text-white">{question.answerCount}</span> answers
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-neutral-400" />
                <span className="tabular-nums">{question.viewCount}</span> views
              </span>
              <button
                type="button"
                onClick={() => setQuestionCommentsOpen(!questionCommentsOpen)}
                className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{questionComments.length > 0 ? `${questionComments.length} comments` : 'Comment'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {currentUser && (
                <button
                  onClick={handleToggleFollow}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    isFollowing
                      ? 'border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </button>
              )}

              <button
                onClick={handleToggleSave}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  isSaved
                    ? 'border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
                title={isSaved ? 'Bookmarked' : 'Bookmark'}
                aria-label="Bookmark"
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Question Comments Section */}
          {questionCommentsOpen && (
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Comments on this question
              </p>
              {questionComments.map((cm) => (
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
                          onClick={() => handleDeleteQuestionComment(cm.commentId)}
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
                <form onSubmit={handleAddQuestionComment} className="pt-2 space-y-2">
                  <input
                    type="text"
                    placeholder="Add clarification or feedback on question..."
                    value={questionCommentText}
                    onChange={(e) => setQuestionCommentText(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-neutral-400"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-1.5 text-neutral-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={questionCommentAnon}
                        onChange={(e) => setQuestionCommentAnon(e.target.checked)}
                        className="rounded border-neutral-300 dark:border-neutral-700"
                      />
                      <span>Comment anonymously</span>
                    </label>
                    <button
                      type="submit"
                      disabled={!questionCommentText.trim() || submittingQComment}
                      className="px-3 py-1 text-xs font-medium text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-md disabled:opacity-50 cursor-pointer"
                    >
                      Post Comment
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-xs text-neutral-500 italic">
                  <Link to="/login" className="underline font-medium">Sign in</Link> to leave a comment.
                </p>
              )}
            </div>
          )}

        </article>

        {/* Answer Composer */}
        <section className="p-5 sm:p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3">
          <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
            Your Contribution
          </h2>

          {currentUser ? (
            <form onSubmit={handlePostAnswer} className="space-y-3">
              <textarea
                value={answerBody}
                onChange={(e) => setAnswerBody(e.target.value)}
                placeholder="Write a clear, thoughtful, and verified answer..."
                rows={4}
                required
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-neutral-400 text-neutral-900 dark:text-white"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <label className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymousAnswer}
                    onChange={(e) => setIsAnonymousAnswer(e.target.checked)}
                    className="rounded border-neutral-300 dark:border-neutral-700"
                  />
                  <span>Post answer anonymously</span>
                </label>

                <button
                  type="submit"
                  disabled={!answerBody.trim() || submittingAnswer}
                  className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 rounded-lg disabled:opacity-50 transition-colors shadow-xs"
                >
                  {submittingAnswer ? 'Publishing...' : 'Publish Answer'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 text-xs text-neutral-600 dark:text-neutral-400 flex items-center justify-between">
              <span>Sign in to write an answer or vote on contributions.</span>
              <Link
                to="/login"
                className="px-3 py-1.5 font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800"
              >
                Sign In
              </Link>
            </div>
          )}
        </section>

        {/* Answers List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
              {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </h2>

            {/* Sorting */}
            {answers.length > 1 && (
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setSortOrder('votes')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    sortOrder === 'votes'
                      ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Top Votes
                </button>
                <button
                  onClick={() => setSortOrder('newest')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    sortOrder === 'newest'
                      ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Newest
                </button>
              </div>
            )}
          </div>

          {answers.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2">
              <p className="text-xs text-neutral-500">
                No answers yet. Be the first to provide insight on this question.
              </p>
            </div>
          ) : (
            answers.map((ans) => (
              <AnswerCard
                key={ans.answerId}
                answer={ans}
                onDelete={handleDeleteAnswer}
              />
            ))
          )}
        </section>

      </div>

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

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleExecuteDeleteQuestion}
        title="Delete Question"
        message="Are you sure you want to permanently delete this question? This action cannot be undone."
        confirmLabel="Delete Question"
        confirmVariant="danger"
        loading={deletingQuestion}
      />

      <ConfirmModal
        isOpen={Boolean(answerToDelete)}
        onClose={() => setAnswerToDelete(null)}
        onConfirm={handleExecuteDeleteAnswer}
        title="Delete Answer"
        message="Are you sure you want to permanently delete your answer?"
        confirmLabel="Delete Answer"
        confirmVariant="danger"
        loading={deletingAnswer}
      />
    </>
  );
};
