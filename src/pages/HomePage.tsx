import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  Clock,
  Users,
  PlusCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { Question, Category } from '../core/models/types';
import { questionService } from '../core/services/questionService';
import { categoryService } from '../core/services/categoryService';
import { userService } from '../core/services/userService';
import { useAuth } from '../core/context/AuthContext';
import { QuestionCard } from '../components/question/QuestionCard';
import { ContextSidebar } from '../components/layout/ContextSidebar';
import { ConfirmModal } from '../components/dialogs/ConfirmModal';

type FeedTab = 'forYou' | 'trending' | 'new' | 'following';

export const HomePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedTab>('forYou');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState(false);

  const loadFeed = async (tab: FeedTab) => {
    setLoading(true);
    try {
      let fUsers: string[] = [];
      if (currentUser && tab === 'following') {
        fUsers = await userService.getFollowingUids(currentUser.uid);
        setFollowedUsers(fUsers);
      }

      const list = await questionService.getQuestions({
        feedType: tab,
        followedUsers: fUsers,
        limitCount: 30
      });
      setQuestions(list);
    } catch (err) {
      console.error('Error loading questions feed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeed(activeTab);
    categoryService.getAllCategories().then(setCategories).catch(err => {
      console.warn('Could not load categories:', err);
    });
  }, [activeTab, currentUser]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeed(activeTab);
  };

  const handleDeleteQuestion = (qId: string) => {
    if (!currentUser) return;
    setQuestionToDelete(qId);
  };

  const handleExecuteDeleteQuestion = async () => {
    if (!currentUser || !questionToDelete) return;
    setDeletingQuestion(true);
    try {
      await questionService.deleteQuestion(questionToDelete, currentUser.uid);
      setQuestions(prev => prev.filter(q => q.questionId !== questionToDelete));
      setQuestionToDelete(null);
    } catch (err) {
      console.error('Error deleting question:', err);
    } finally {
      setDeletingQuestion(false);
    }
  };

  return (
    <div className="flex items-start gap-8">
      
      {/* Primary Feed Column */}
      <div className="flex-1 min-w-0 space-y-4">
        
        {/* Feed Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
          
          {/* Functional segmented controls */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('forYou')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'forYou'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>For You</span>
            </button>

            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'trending'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trending</span>
            </button>

            <button
              onClick={() => setActiveTab('new')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'new'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>New</span>
            </button>

            {currentUser && (
              <button
                onClick={() => setActiveTab('following')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'following'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Following</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Refresh feed"
              aria-label="Refresh feed"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/ask"
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-950 rounded-lg shadow-xs hover:bg-neutral-800 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Ask</span>
            </Link>
          </div>

        </div>

        {/* Feed List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3 animate-pulse"
              >
                <div className="h-3 w-1/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
                <div className="h-5 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
                <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
              </div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
              {activeTab === 'following'
                ? 'No updates from people you follow.'
                : 'No questions yet.'}
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
              {activeTab === 'following'
                ? 'Follow contributors or explore the discovery feed to discover community discussions.'
                : 'Be the first to post a question on OpenAsk. You can post publicly or anonymously.'}
            </p>
            <div className="pt-2">
              <Link
                to="/ask"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Ask the first question</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {questions.map((question) => (
              <QuestionCard
                key={question.questionId}
                question={question}
                onDelete={handleDeleteQuestion}
              />
            ))}
          </div>
        )}

      </div>

      {/* Contextual Desktop Sidebar */}
      <ContextSidebar categories={categories} />

      <ConfirmModal
        isOpen={Boolean(questionToDelete)}
        onClose={() => setQuestionToDelete(null)}
        onConfirm={handleExecuteDeleteQuestion}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action will permanently remove it from OpenAsk."
        confirmLabel="Delete Question"
        confirmVariant="danger"
        loading={deletingQuestion}
      />

    </div>
  );
};
