import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Compass, Layers, ArrowRight } from 'lucide-react';
import { Category } from '../core/models/types';
import { categoryService } from '../core/services/categoryService';

export const DiscoverPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService.getAllCategories()
      .then((cats) => {
        setCategories(cats);
      })
      .catch((err) => {
        console.warn('Failed to load categories:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold text-neutral-950 dark:text-white font-display">
            Discover Topics
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Explore discussions across 50 dedicated knowledge domains.
          </p>
        </div>

        {/* Filter input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Filter categories..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-neutral-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3 animate-pulse"
            >
              <div className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-3 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
          <Layers className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            No categories matching "{searchFilter}"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="group p-4 sm:p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h2 className="font-semibold text-sm text-neutral-950 dark:text-white group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors truncate">
                    {cat.name}
                  </h2>
                  <span className="text-[11px] font-mono tabular-nums text-neutral-400">
                    {cat.questionCount} {cat.questionCount === 1 ? 'q' : 'q'}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                  {cat.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-[11px] text-neutral-400">
                <span className="font-medium text-neutral-500">Explore domain</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-neutral-400" />
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
};
