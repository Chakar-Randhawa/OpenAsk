import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Eye,
  Bookmark,
  Share2,
  Check,
  Flag,
  Trash2,
  EyeOff,
  Bell,
  ArrowLeft,
  Edit3,
  MessageCircle,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Sparkles,
  FileText
} from 'lucide-react';
import { Question, Answer, Comment } from '../core/models/types';
import { questionService } from '../core/services/questionService';
import { answerService } from '../core/services/answerService';
import { commentService } from '../core/services/commentService';
import { notificationService } from '../core/services/notificationService';
import { useAuth } from '../core/context/AuthContext';
import { copyToClipboard } from '../core/utils/clipboard';
import { AnswerCard } from '../components/answer/AnswerCard';
import { CommentItem } from '../components/comment/CommentItem';
import { ReportModal } from '../components/dialogs/ReportModal';
import { ShareModal } from '../components/dialogs/ShareModal';
import { ConfirmModal } from '../components/dialogs/ConfirmModal';
import { ExportThreadModal } from '../components/question/ExportThreadModal';
import { QuestionDetailSkeleton } from '../components/ui/Skeleton';
import { ReputationBadge } from '../components/user/ReputationBadge';
import { RichTextEditor, FormattedContent } from '../components/editor';
import { ReadTimeBadge } from '../components/ui/ReadTimeBadge';
import { draftsManager } from '../core/utils/drafts';

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
  const [answerDraftRestored, setAnswerDraftRestored] = useState(false);
  const [answerDraftSavedAt, setAnswerDraftSavedAt] = useState<string | null>(null);

  // Restore answer draft for this question
  useEffect(() => {
    if (questionId) {
      const draft = draftsManager.loadAnswerDraft(questionId);
      if (draft && draft.body) {
        setAnswerBody(draft.body);
        if (draft.isAnonymous !== undefined) setIsAnonymousAnswer(draft.isAnonymous);
        setAnswerDraftRestored(true);
        setAnswerDraftSavedAt(new Date(draft.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    }
  }, [questionId]);

  // Auto-save answer draft on content change
  useEffect(() => {
    if (questionId && answerBody.trim()) {
      draftsManager.saveAnswerDraft(questionId, {
        body: answerBody,
        isAnonymous: isAnonymousAnswer,
      });
      setAnswerDraftSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  }, [questionId, answerBody, isAnonymousAnswer]);

  // Save answer draft on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (questionId && answerBody.trim()) {
        draftsManager.saveAnswerDraft(questionId, {
          body: answerBody,
          isAnonymous: isAnonymousAnswer,
        });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [questionId, answerBody, isAnonymousAnswer]);

  const handleDiscardAnswerDraft = () => {
    if (questionId) draftsManager.clearAnswerDraft(questionId);
    setAnswerBody('');
    setAnswerDraftRestored(false);
    setAnswerDraftSavedAt(null);
  };

  // Modals
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'question' | 'comment'; id: string }>({
    type: 'question',
    id: questionId || ''
  });
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState(false);
  const [answerToDelete, setAnswerToDelete] = useState<string | null>(null);
  const [deletingAnswer, setDeletingAnswer] = useState(false);
  const [copiedDirectUrl, setCopiedDirectUrl] = useState(false);

  // Accepted Solution toggle handler
  const handleToggleAcceptAnswer = async (answerId: string) => {
    if (!currentUser || !question || question.authorUid !== currentUser.uid) return;
    try {
      const isCurrentAccepted = question.acceptedAnswerId === answerId;
      if (isCurrentAccepted) {
        await questionService.unacceptAnswer(question.questionId, answerId, currentUser.uid);
        setQuestion(prev => prev ? { ...prev, acceptedAnswerId: undefined, isSolved: false } : null);
        setAnswers(prev => prev.map(a => a.answerId === answerId ? { ...a, isAccepted: false } : a));
      } else {
        const targetAns = answers.find(a => a.answerId === answerId);
        await questionService.acceptAnswer(
          question.questionId,
          answerId,
          currentUser.uid,
          targetAns?.authorUid,
          question.acceptedAnswerId
        );
        setQuestion(prev => prev ? { ...prev, acceptedAnswerId: answerId, isSolved: true } : null);
        setAnswers(prev => prev.map(a => ({
          ...a,
          isAccepted: a.answerId === answerId
        })));
      }
    } catch (err) {
      console.error('Error toggling accepted answer:', err);
    }
  };

  // Question voting state
  const [questionVoteCount, setQuestionVoteCount] = useState<number>(0);
  const [questionUserVote, setQuestionUserVote] = useState<1 | -1 | 0>(0);
  const [questionVotingLoading, setQuestionVotingLoading] = useState(false);

  const handleQuestionVote = async (val: 1 | -1) => {
    if (!currentUser || !question || questionVotingLoading) return;
    setQuestionVotingLoading(true);

    const oldVote = questionUserVote;
    const oldScore = questionVoteCount;

    let delta: number = val;
    if (questionUserVote === val) {
      setQuestionUserVote(0);
      delta = -val;
    } else if (questionUserVote !== 0) {
      setQuestionUserVote(val);
      delta = val * 2;
    } else {
      setQuestionUserVote(val);
      delta = val;
    }
    setQuestionVoteCount((prev) => prev + delta);

    try {
      await questionService.voteQuestion(currentUser.uid, question.questionId, val);
    } catch (err) {
      console.error('Error voting on question:', err);
      setQuestionUserVote(oldVote);
      setQuestionVoteCount(oldScore);
    } finally {
      setQuestionVotingLoading(false);
    }
  };

  const handleCopyDirectUrl = async () => {
    if (!question) return;
    const directUrl = `${window.location.origin}/question/${question.questionId}`;
    const success = await copyToClipboard(directUrl);
    if (success) {
      setCopiedDirectUrl(true);
      setTimeout(() => setCopiedDirectUrl(false), 2500);
    } else {
      setShareModalOpen(true);
    }
  };

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
      if (q) setQuestionVoteCount(q.voteCount || 0);
      setAnswers(ansList);
      setQuestionComments(qComments);
      setIsSaved(saved);
      setIsFollowing(following);
      setLoading(false);

      if (currentUser && q) {
        questionService.getUserVote(currentUser.uid, q.questionId).then(setQuestionUserVote);
      }

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

  // Deep link anchor navigation to specific answers
  useEffect(() => {
    if (!loading && answers.length > 0 && window.location.hash) {
      const targetId = window.location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-blue-500', 'transition-all');
          setTimeout(() => el.classList.remove('ring-2', 'ring-blue-500'), 3000);
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [loading, answers]);

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
      if (question) draftsManager.clearAnswerDraft(question.questionId);
      setAnswerDraftRestored(false);
      setAnswerDraftSavedAt(null);
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
    return <QuestionDetailSkeleton />;
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
                <div className="flex items-center gap-2">
                  <Link to={`/user/${question.authorUsername}`} className="hover:underline font-medium text-neutral-800 dark:text-neutral-200">
                    {question.authorDisplayName} <span className="text-neutral-400 font-normal">@{question.authorUsername}</span>
                  </Link>
                  <ReputationBadge userId={question.authorUid} size="xs" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">{question.authorDisplayName || 'Member'}</span>
                  <ReputationBadge userId={question.authorUid} size="xs" />
                </div>
              )}
              <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
              <span>Asked {new Date(question.createdAt).toLocaleDateString()}</span>
              {question.updatedAt && question.updatedAt > question.createdAt && (
                <span className="text-neutral-400 text-[11px] italic">(edited)</span>
              )}
              <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
              <ReadTimeBadge content={`${question.title} ${question.body}`} size="sm" />
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
                type="button"
                onClick={handleCopyDirectUrl}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  copiedDirectUrl
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
                title={copiedDirectUrl ? 'Direct link copied!' : 'Copy conversation link'}
                aria-label="Share question: copy direct link"
              >
                {copiedDirectUrl ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => {
                  setReportTarget({ type: 'question', id: question.questionId });
                  setReportModalOpen(true);
                }}
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
              <RichTextEditor
                value={editBody}
                onChange={setEditBody}
                minRows={6}
                maxLength={10000}
                placeholder="Edit your question context (supports bold, italics, code blocks, lists)..."
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
              <FormattedContent
                content={question.body}
                className="text-sm sm:text-base text-neutral-800 dark:text-neutral-200 leading-relaxed pt-2"
              />
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
            <div className="flex items-center gap-3 sm:gap-4 text-neutral-500">
              {/* Question Voting Controls */}
              <div className="flex items-center gap-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => handleQuestionVote(1)}
                  disabled={!currentUser || questionVotingLoading}
                  className={`p-1 rounded-md hover:bg-white dark:hover:bg-neutral-700 transition-colors cursor-pointer ${
                    questionUserVote === 1 ? 'text-emerald-600 font-bold bg-white dark:bg-neutral-700 shadow-xs' : 'text-neutral-500'
                  }`}
                  title="Upvote question"
                  aria-label="Upvote question"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <span className={`px-1.5 font-semibold tabular-nums text-xs ${
                  questionVoteCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : questionVoteCount < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-900 dark:text-neutral-100'
                }`}>
                  {questionVoteCount}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuestionVote(-1)}
                  disabled={!currentUser || questionVotingLoading}
                  className={`p-1 rounded-md hover:bg-white dark:hover:bg-neutral-700 transition-colors cursor-pointer ${
                    questionUserVote === -1 ? 'text-rose-600 font-bold bg-white dark:bg-neutral-700 shadow-xs' : 'text-neutral-500'
                  }`}
                  title="Downvote question"
                  aria-label="Downvote question"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

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
              <button
                type="button"
                onClick={handleCopyDirectUrl}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  copiedDirectUrl
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
                title={copiedDirectUrl ? 'Direct link copied to clipboard!' : 'Copy direct link to clipboard'}
                aria-label="Share question: copy direct link"
              >
                {copiedDirectUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setExportModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium transition-colors cursor-pointer"
                title="Export discussion as Markdown or Printable PDF"
                aria-label="Export discussion"
              >
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span className="hidden sm:inline">Export</span>
              </button>

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

              <button
                onClick={() => {
                  setReportTarget({ type: 'question', id: question.questionId });
                  setReportModalOpen(true);
                }}
                className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Report question"
                aria-label="Report question"
              >
                <Flag className="w-4 h-4" />
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
                <CommentItem
                  key={cm.commentId}
                  comment={cm}
                  onDelete={handleDeleteQuestionComment}
                  onReport={(cId) => {
                    setReportTarget({ type: 'comment', id: cId });
                    setReportModalOpen(true);
                  }}
                />
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
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
              Your Contribution
            </h2>
            {answerDraftSavedAt && (
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" />
                <span>Auto-saved ({answerDraftSavedAt})</span>
              </span>
            )}
          </div>

          {answerDraftRestored && (
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-xl text-xs flex items-center justify-between gap-2 animate-fade-in">
              <span className="text-blue-800 dark:text-blue-200 text-[11px]">
                Restored unsaved answer draft from browser storage{answerDraftSavedAt ? ` (${answerDraftSavedAt})` : ''}.
              </span>
              <button
                type="button"
                onClick={handleDiscardAnswerDraft}
                className="text-red-600 dark:text-red-400 hover:underline text-[11px] font-medium cursor-pointer"
              >
                Discard draft
              </button>
            </div>
          )}

          {currentUser ? (
            <form onSubmit={handlePostAnswer} className="space-y-3">
              <RichTextEditor
                value={answerBody}
                onChange={setAnswerBody}
                placeholder="Write a clear, thoughtful, and verified answer (supports bold, italics, code blocks, lists)..."
                minRows={5}
                required
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymousAnswer}
                      onChange={(e) => setIsAnonymousAnswer(e.target.checked)}
                      className="rounded border-neutral-300 dark:border-neutral-700"
                    />
                    <span>Post answer anonymously</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {answerBody.trim() && (
                    <button
                      type="button"
                      onClick={handleDiscardAnswerDraft}
                      className="px-3 py-1.5 text-xs text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Discard
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!answerBody.trim() || submittingAnswer}
                    className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 rounded-lg disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                  >
                    {submittingAnswer ? 'Publishing...' : 'Publish Answer'}
                  </button>
                </div>
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
            [...answers]
              .sort((a, b) => {
                const aAcc = a.answerId === question.acceptedAnswerId || a.isAccepted;
                const bAcc = b.answerId === question.acceptedAnswerId || b.isAccepted;
                if (aAcc && !bAcc) return -1;
                if (!aAcc && bAcc) return 1;
                if (sortOrder === 'votes') {
                  return (b.voteCount || 0) - (a.voteCount || 0);
                }
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              })
              .map((ans) => (
                <AnswerCard
                  key={ans.answerId}
                  answer={ans}
                  isQuestionAuthor={Boolean(isAuthor)}
                  isAcceptedAnswer={ans.answerId === question.acceptedAnswerId || Boolean(ans.isAccepted)}
                  onToggleAccept={handleToggleAcceptAnswer}
                  onDelete={handleDeleteAnswer}
                />
              ))
          )}
        </section>

      </div>

      <ExportThreadModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        question={question}
        answers={answers}
      />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType={reportTarget.type}
        targetId={reportTarget.id}
      />

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={question.title}
        url={`${window.location.origin}/question/${question.questionId}`}
        targetType="question"
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

      {/* Toast Notification for Direct Link Copy */}
      {copiedDirectUrl && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 rounded-xl shadow-xl text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 stroke-[2.5]" />
          <span>Conversation link copied to clipboard!</span>
          <button
            type="button"
            onClick={() => {
              setCopiedDirectUrl(false);
              setShareModalOpen(true);
            }}
            className="ml-2 underline text-neutral-300 dark:text-neutral-700 hover:text-white dark:hover:text-neutral-950 text-[11px] cursor-pointer"
          >
            More options
          </button>
        </div>
      )}
    </>
  );
};
