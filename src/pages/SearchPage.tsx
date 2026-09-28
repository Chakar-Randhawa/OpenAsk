import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Compass, Users, MessageSquare, ArrowRight } from 'lucide-react';
import { searchService, SearchResults } from '../core/services/searchService';
import { QuestionCard } from '../components/question/QuestionCard';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTerm = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(queryTerm);
  const [results, setResults] = useState<SearchResults>({ questions: [], categories: [], users: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (queryTerm.trim()) {
      setLoading(true);
      searchService.search(queryTerm).then((res) => {
        setResults(res);
        setLoading(false);
      });
    } else {
      setResults({ questions: [], categories: [], users: [] });
    }
  }, [queryTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const totalResults = results.questions.length + results.categories.length + results.users.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Search Input Box */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="w-5 h-5 absolute left-4 top-3.5 text-neutral-400" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search questions, categories, and members..."
          className="w-full pl-12 pr-28 py-3 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl focus:outline-none focus:border-neutral-400 text-neutral-900 dark:text-white shadow-xs"
        />
        <button
          type="submit"
          className="absolute right-2 top-2 px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-xl"
        >
          Search
        </button>
      </form>

      {queryTerm && (
        <div className="text-xs text-neutral-500">
          Showing results for <span className="font-semibold text-neutral-900 dark:text-white">"{queryTerm}"</span> ({totalResults} found)
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      ) : queryTerm && totalResults === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3">
          <Search className="w-8 h-8 text-neutral-400 mx-auto" />
          <h3 className="text-base font-semibold text-neutral-950 dark:text-white">
            No results found for "{queryTerm}"
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try broader keywords or browse our 50 curated categories.
          </p>
          <div className="pt-2">
            <Link
              to="/categories"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg"
            >
              <span>Explore All Topics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Matched Categories */}
          {results.categories.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                <Compass className="w-3.5 h-3.5" />
                <span>Topics ({results.categories.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.categories.map((c) => (
                  <Link
                    key={c.slug}
                    to={`/category/${c.slug}`}
                    className="p-3.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                  >
                    <p className="font-semibold text-xs text-neutral-900 dark:text-white truncate">{c.name}</p>
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">{c.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Matched Users */}
          {results.users.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                <Users className="w-3.5 h-3.5" />
                <span>Members ({results.users.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.users.map((u) => (
                  <Link
                    key={u.uid}
                    to={`/user/${u.username}`}
                    className="p-3.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-bold text-xs">
                      {u.displayName[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-neutral-900 dark:text-white truncate">{u.displayName}</p>
                      <p className="text-[11px] text-neutral-400 truncate">@{u.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Matched Questions */}
          {results.questions.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Questions ({results.questions.length})</span>
              </div>
              <div className="space-y-3">
                {results.questions.map((q) => (
                  <QuestionCard key={q.questionId} question={q} />
                ))}
              </div>
            </section>
          )}

        </div>
      )}

    </div>
  );
};
