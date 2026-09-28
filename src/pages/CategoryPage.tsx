import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PlusCircle, HelpCircle, Check, ArrowLeft } from 'lucide-react';
import { Category, Question } from '../core/models/types';
import { categoryService } from '../core/services/categoryService';
import { questionService } from '../core/services/questionService';
import { useAuth } from '../core/context/AuthContext';
import { QuestionCard } from '../components/question/QuestionCard';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { currentUser } = useAuth();

  const [category, setCategory] = useState<Category | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    Promise.all([
      categoryService.getCategoryBySlug(slug),
      questionService.getQuestions({ categoryId: slug, limitCount: 40 }),
      currentUser ? categoryService.isFollowingCategory(currentUser.uid, slug) : Promise.resolve(false)
    ])
      .then(([cat, qList, following]) => {
        setCategory(cat);
        setQuestions(qList);
        setIsFollowing(following);
      })
      .catch((err) => {
        console.warn('Error loading category data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug, currentUser]);

  const handleToggleFollow = async () => {
    if (!currentUser || !slug) return;
    try {
      if (isFollowing) {
        await categoryService.unfollowCategory(currentUser.uid, slug);
        setIsFollowing(false);
      } else {
        await categoryService.followCategory(currentUser.uid, slug);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Error toggling category follow:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl animate-pulse" />
        <div className="h-40 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-4">
        <h2 className="text-xl font-bold text-neutral-950 dark:text-white">Category Not Found</h2>
        <p className="text-xs text-neutral-500">The requested topic category does not exist.</p>
        <Link
          to="/categories"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Category Header Card */}
      <div className="p-6 sm:p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
              <Link to="/categories" className="hover:underline">Categories</Link>
              <span>/</span>
              <span className="text-neutral-700 dark:text-neutral-300 font-medium">{category.slug}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white font-display">
              {category.name}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-2xl leading-relaxed">
              {category.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentUser && (
              <button
                onClick={handleToggleFollow}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                  isFollowing
                    ? 'border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800'
                }`}
              >
                {isFollowing ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Following
                  </>
                ) : (
                  'Follow Topic'
                )}
              </button>
            )}

            <Link
              to={`/ask?category=${category.slug}`}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-950 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Ask in {category.name}</span>
            </Link>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center gap-4 text-xs text-neutral-400">
          <span>
            <strong className="text-neutral-900 dark:text-white font-semibold tabular-nums">
              {questions.length}
            </strong> {questions.length === 1 ? 'question' : 'questions'}
          </span>
        </div>
      </div>

      {/* Questions in Category */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3">
            <HelpCircle className="w-8 h-8 text-neutral-400 mx-auto" />
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
              No questions in {category.name} yet.
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Be the first to open a thoughtful discussion in this domain.
            </p>
            <div className="pt-2">
              <Link
                to={`/ask?category=${category.slug}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Ask Question</span>
              </Link>
            </div>
          </div>
        ) : (
          questions.map((q) => (
            <QuestionCard key={q.questionId} question={q} />
          ))
        )}
      </div>

    </div>
  );
};
