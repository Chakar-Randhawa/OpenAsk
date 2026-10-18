import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  Compass,
  Bookmark,
  Sun,
  Moon,
  Settings,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Hash,
  AtSign,
  X,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { searchService, SearchResults } from '../../core/services/searchService';
import { useTheme } from '../theme/ThemeProvider';
import { INITIAL_CATEGORIES } from '../../core/constants/initialCategories';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PaletteAction {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  category: 'action' | 'category' | 'question' | 'user';
  onSelect: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ questions: [], categories: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    if (!query.trim()) {
      setResults({ questions: [], categories: [], users: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      searchService.search(query.trim())
        .then((res) => {
          setResults(res);
          setSelectedIndex(0);
        })
        .finally(() => setLoading(false));
    }, 150);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Default quick actions
  const defaultActions: PaletteAction[] = [
    {
      id: 'action-ask',
      title: 'Ask a Question',
      subtitle: 'Post a new inquiry to the community',
      icon: <PlusCircle className="w-4 h-4 text-emerald-500" />,
      category: 'action',
      onSelect: () => {
        navigate('/ask');
        onClose();
      }
    },
    {
      id: 'action-categories',
      title: 'Browse 50 Knowledge Topics',
      subtitle: 'Explore curated disciplines and research domains',
      icon: <Compass className="w-4 h-4 text-sky-500" />,
      category: 'action',
      onSelect: () => {
        navigate('/categories');
        onClose();
      }
    },
    {
      id: 'action-discover',
      title: 'Discover Feed',
      subtitle: 'Explore trending questions across all fields',
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
      category: 'action',
      onSelect: () => {
        navigate('/discover');
        onClose();
      }
    },
    {
      id: 'action-saved',
      title: 'View Bookmarks & Saved',
      subtitle: 'Access your bookmarked questions and answers',
      icon: <Bookmark className="w-4 h-4 text-amber-500" />,
      category: 'action',
      onSelect: () => {
        navigate('/saved');
        onClose();
      }
    },
    {
      id: 'action-theme',
      title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      subtitle: `Currently using ${theme} theme`,
      icon: theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-500" />,
      category: 'action',
      onSelect: () => {
        toggleTheme();
        onClose();
      }
    },
    {
      id: 'action-settings',
      title: 'Account Settings',
      subtitle: 'Manage profile, preferences, and privacy',
      icon: <Settings className="w-4 h-4 text-neutral-500" />,
      category: 'action',
      onSelect: () => {
        navigate('/settings');
        onClose();
      }
    }
  ];

  // Dynamic matched items
  const matchedActions: PaletteAction[] = [];

  // 1. Matched Categories
  if (query.trim()) {
    results.categories.forEach((cat) => {
      matchedActions.push({
        id: `cat-${cat.slug}`,
        title: cat.name,
        subtitle: cat.description || `Browse questions in ${cat.name}`,
        icon: <FolderOpen className="w-4 h-4 text-sky-500" />,
        category: 'category',
        onSelect: () => {
          navigate(`/category/${cat.slug}`);
          onClose();
        }
      });
    });

    // If query looks like a tag (#tag), surface tag search
    if (query.trim().startsWith('#')) {
      const tagClean = query.trim().replace(/^#+/, '');
      matchedActions.push({
        id: `tag-${tagClean}`,
        title: `#${tagClean}`,
        subtitle: `Search questions tagged with #${tagClean}`,
        icon: <Hash className="w-4 h-4 text-indigo-500" />,
        category: 'action',
        onSelect: () => {
          navigate(`/search?q=${encodeURIComponent('#' + tagClean)}`);
          onClose();
        }
      });
    }

    // 2. Matched Users
    results.users.forEach((u) => {
      matchedActions.push({
        id: `user-${u.uid}`,
        title: `${u.displayName} (@${u.username})`,
        subtitle: u.bio || `${u.reputation || 10} reputation · ${u.answerCount || 0} answers`,
        icon: <AtSign className="w-4 h-4 text-purple-500" />,
        category: 'user',
        onSelect: () => {
          navigate(`/user/${u.username}`);
          onClose();
        }
      });
    });

    // 3. Matched Questions
    results.questions.forEach((q) => {
      matchedActions.push({
        id: `q-${q.questionId}`,
        title: q.title,
        subtitle: `${q.categoryName} · ${q.answerCount} answers · ${q.voteCount} votes ${
          q.acceptedAnswerId || q.isSolved ? '· ✅ Solved' : ''
        }`,
        icon: (
          <HelpCircle
            className={`w-4 h-4 ${
              q.acceptedAnswerId || q.isSolved ? 'text-emerald-500' : 'text-neutral-400'
            }`}
          />
        ),
        category: 'question',
        onSelect: () => {
          navigate(`/question/${q.questionId}`);
          onClose();
        }
      });
    });
  }

  // Filter default actions if query is present
  const filteredQuickActions = query.trim()
    ? defaultActions.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : defaultActions;

  const currentItems = query.trim()
    ? [...matchedActions, ...filteredQuickActions]
    : defaultActions;

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, currentItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + currentItems.length) % Math.max(1, currentItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentItems[selectedIndex]) {
        currentItems[selectedIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-palette-title"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            id="command-palette-title"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search questions, topics, #tags, @users, or quick commands..."
            className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono text-neutral-500 bg-neutral-200 dark:bg-neutral-800 rounded border border-neutral-300 dark:border-neutral-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 divide-y divide-neutral-100 dark:divide-neutral-800/60"
        >
          {loading && (
            <div className="p-4 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-neutral-400 border-t-neutral-900 dark:border-t-white rounded-full" />
              <span>Searching community knowledge...</span>
            </div>
          )}

          {!loading && currentItems.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <HelpCircle className="w-8 h-8 text-neutral-400 mx-auto" />
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                No matching results found for "{query}"
              </p>
              <p className="text-xs text-neutral-500">
                Try searching by topic name, question keywords, or prefix with @ for username.
              </p>
            </div>
          ) : (
            currentItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.onSelect}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 shrink-0">
                    {item.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate leading-tight">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>

                  {isSelected && (
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950/50 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono text-[10px]">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono text-[10px]">↵</kbd> Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono text-[10px]">ESC</kbd> Close
            </span>
          </div>
          <span className="text-[10px] text-neutral-400">
            OpenAsk Command Palette
          </span>
        </div>
      </div>
    </div>
  );
};
