import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Compass, Users, MessageSquare, ArrowRight, X, AtSign } from 'lucide-react';
import { searchService, SearchResults } from '../core/services/searchService';
import { QuestionCard } from '../components/question/QuestionCard';
import { QuestionListSkeleton } from '../components/ui/Skeleton';
import { UserPreviewCard } from '../components/user/UserPreviewCard';

type SearchTab = 'all' | 'members' | 'questions' | 'topics';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTerm = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(queryTerm);
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [results, setResults] = useState<SearchResults>({ questions: [], categories: [], users: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSearchInput(queryTerm);
    if (queryTerm.trim()) {
      setLoading(true);
      // If query starts with @, automatically select members tab
      if (queryTerm.trim().startsWith('@')) {
        setActiveTab('members');
      }
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

  const handleClear = () => {
    setSearchInput('');
    setSearchParams({});
    setResults({ questions: [], categories: [], users: [] });
  };

  const totalResults = results.questions.length + results.categories.length + results.users.length;
  const isUsernameSearch = queryTerm.trim().startsWith('@');
  const cleanUsername = queryTerm.trim().replace(/^@+/, '');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Search Input Box */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="w-5 h-5 absolute left-4 top-3.5 text-neutral-400" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by topic, keyword, or @username..."
          className="w-full pl-12 pr-32 py-3 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl focus:outline-none focus:border-neutral-400 text-neutral-900 dark:text-white shadow-xs"
        />
        <div className="absolute right-2 top-2 flex items-center gap-1.5">
          {searchInput && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-xl hover:bg-neutral-800 cursor-pointer"
          >
            Search
          </button>
        </div>
      </form>

      {/* Query Banner & Filter Tabs */}
      {queryTerm && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-500">
            <div className="flex items-center gap-2 flex-wrap">
              <span>
                Showing results for{' '}
                <span className="font-semibold text-neutral-900 dark:text-white">"{queryTerm}"</span>{' '}
                ({totalResults} found)
              </span>
              {isUsernameSearch && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                  <AtSign className="w-3 h-3 text-amber-500" />
                  Username search
                </span>
              )}
            </div>

            {/* Quick search by username hint button if not already searching with @ */}
            {!isUsernameSearch && (
              <button
                type="button"
                onClick={() => {
                  const newQ = `@${searchInput.trim() || 'username'}`;
                  setSearchInput(newQ);
                  setSearchParams({ q: newQ });
                }}
                className="text-[11px] text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Search as member</span>
                <span className="font-mono text-neutral-500">@{searchInput || 'handle'}</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-850 rounded-xl overflow-x-auto text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white font-semibold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span>All Results</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200 dark:bg-neutral-800 tabular-nums">
                {totalResults}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === 'members'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white font-semibold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Members</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200 dark:bg-neutral-800 tabular-nums">
                {results.users.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('questions')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === 'questions'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white font-semibold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Questions</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200 dark:bg-neutral-800 tabular-nums">
                {results.questions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('topics')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === 'topics'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white font-semibold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Topics</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200 dark:bg-neutral-800 tabular-nums">
                {results.categories.length}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Results View */}
      {loading ? (
        <QuestionListSkeleton count={3} />
      ) : queryTerm && totalResults === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3">
          <Search className="w-8 h-8 text-neutral-400 mx-auto" />
          <h3 className="text-base font-semibold text-neutral-950 dark:text-white">
            No results found for "{queryTerm}"
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {isUsernameSearch
              ? `No registered members match the username "@${cleanUsername}". Check the spelling or try searching without the @ prefix.`
              : 'Try broader keywords, searching by username with @username, or browse our topics.'}
          </p>
          <div className="pt-2">
            <Link
              to="/categories"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800"
            >
              <span>Explore All Topics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* TAB: MEMBERS */}
          {(activeTab === 'all' || activeTab === 'members') && results.users.length > 0 && (
            <section className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  <Users className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
                  <span>Members by Username ({results.users.length})</span>
                </div>
                {activeTab === 'all' && results.users.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('members')}
                    className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium cursor-pointer"
                  >
                    View all {results.users.length} members →
                  </button>
                )}
              </div>

              {/* Grid of Dedicated UserPreviewCards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {(activeTab === 'members' ? results.users : results.users.slice(0, 4)).map((u) => (
                  <UserPreviewCard
                    key={u.uid}
                    user={u}
                    highlightUsername={queryTerm}
                  />
                ))}
              </div>
            </section>
          )}

          {/* TAB: TOPICS */}
          {(activeTab === 'all' || activeTab === 'topics') && results.categories.length > 0 && (
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

          {/* TAB: QUESTIONS */}
          {(activeTab === 'all' || activeTab === 'questions') && results.questions.length > 0 && (
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

          {/* Empty state when tab filter has no results */}
          {activeTab === 'members' && results.users.length === 0 && (
            <div className="p-8 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-2">
              <Users className="w-6 h-6 text-neutral-400 mx-auto" />
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                No members found matching "{queryTerm}"
              </p>
              <p className="text-[11px] text-neutral-400">
                Try searching for a different handle or view all questions.
              </p>
            </div>
          )}

          {activeTab === 'questions' && results.questions.length === 0 && (
            <div className="p-8 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-2">
              <MessageSquare className="w-6 h-6 text-neutral-400 mx-auto" />
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                No questions found matching "{queryTerm}"
              </p>
            </div>
          )}

          {activeTab === 'topics' && results.categories.length === 0 && (
            <div className="p-8 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-2">
              <Compass className="w-6 h-6 text-neutral-400 mx-auto" />
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                No topics found matching "{queryTerm}"
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
