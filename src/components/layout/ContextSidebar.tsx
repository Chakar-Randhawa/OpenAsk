import React from 'react';
import { Link } from 'react-router-dom';
import { EyeOff, ArrowRight } from 'lucide-react';
import { Category } from '../../core/models/types';

interface ContextSidebarProps {
  categories?: Category[];
}

export const ContextSidebar: React.FC<ContextSidebarProps> = ({ categories = [] }) => {
  const displayCategories = categories.slice(0, 6);

  return (
    <aside className="w-72 shrink-0 hidden xl:block sticky top-20 self-start space-y-6">
      
      {/* Anonymous Posting Assurance Card */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs">
        <div className="flex items-center gap-2 mb-2 text-neutral-900 dark:text-neutral-100 font-semibold">
          <EyeOff className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
          <span>Anonymous Inquiries</span>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">
          On OpenAsk, you can ask and answer questions completely anonymously. Your identity is mathematically isolated and never revealed publicly.
        </p>
        <Link
          to="/ask"
          className="inline-flex items-center gap-1 font-medium text-neutral-900 dark:text-neutral-100 hover:underline"
        >
          Ask a question anonymously <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Suggested Topics to Follow */}
      {displayCategories.length > 0 && (
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs">
          <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
            Explore Topics
          </p>
          <div className="space-y-2.5">
            {displayCategories.map((c) => (
              <div key={c.slug} className="flex items-center justify-between gap-2">
                <div className="truncate">
                  <Link
                    to={`/category/${c.slug}`}
                    className="font-medium text-neutral-900 dark:text-neutral-200 hover:underline block truncate"
                  >
                    {c.name}
                  </Link>
                  <span className="text-[11px] text-neutral-400">
                    {c.questionCount} {c.questionCount === 1 ? 'question' : 'questions'}
                  </span>
                </div>
                <Link
                  to={`/category/${c.slug}`}
                  className="px-2.5 py-1 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 shrink-0"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800">
            <Link
              to="/categories"
              className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 font-medium inline-flex items-center gap-1"
            >
              Browse all 50 categories <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Mini Editorial Footer */}
      <div className="px-2 text-[11px] text-neutral-400 dark:text-neutral-500 space-x-2">
        <Link to="/guidelines" className="hover:underline">Rules</Link>
        <span>·</span>
        <Link to="/terms" className="hover:underline">Terms</Link>
        <span>·</span>
        <Link to="/privacy" className="hover:underline">Privacy</Link>
        <span>·</span>
        <span>© {new Date().getFullYear()} OpenAsk</span>
      </div>

    </aside>
  );
};
