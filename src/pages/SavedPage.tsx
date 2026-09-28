import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ArrowRight } from 'lucide-react';
import { SavedItem } from '../core/models/types';
import { questionService } from '../core/services/questionService';
import { useAuth } from '../core/context/AuthContext';

export const SavedPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    questionService.getSavedQuestions(currentUser.uid).then((res) => {
      setItems(res);
      setLoading(false);
    });
  }, [currentUser]);

  const handleUnsave = async (questionId: string) => {
    if (!currentUser) return;
    try {
      await questionService.unsaveQuestion(currentUser.uid, questionId);
      setItems(prev => prev.filter(i => i.questionId !== questionId));
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-center space-y-3">
        <Bookmark className="w-8 h-8 text-neutral-400 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-950 dark:text-white font-display">Bookmarks</h2>
        <p className="text-xs text-neutral-500">Sign in to access your saved questions and discussions.</p>
        <Link
          to="/login"
          className="inline-block px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-2xl font-bold text-neutral-950 dark:text-white font-display">
          Saved Discussions
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Questions and perspectives you have bookmarked for reference.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3">
          <Bookmark className="w-8 h-8 text-neutral-400 mx-auto" />
          <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">
            No saved items yet.
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Questions you save will appear here for easy reference anytime.
          </p>
          <div className="pt-2">
            <Link
              to="/discover"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg"
            >
              <span>Explore discussions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <Link
                  to={`/question/${item.questionId}`}
                  className="font-semibold text-xs sm:text-sm text-neutral-950 dark:text-white hover:underline truncate block"
                >
                  {item.title}
                </Link>
                <span className="text-[11px] text-neutral-400">
                  Saved on {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/question/${item.questionId}`}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg"
                >
                  View
                </Link>
                <button
                  onClick={() => handleUnsave(item.questionId)}
                  className="text-xs text-neutral-400 hover:text-red-600 px-2 py-1"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
