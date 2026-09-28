import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Compass,
  Layers,
  Bookmark,
  Users,
  ShieldCheck,
  HelpCircle,
  TrendingUp,
  Cpu,
  Brain,
  Code,
  Atom,
  Building2,
  Globe
} from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';

export const Sidebar: React.FC = () => {
  const { currentUser } = useAuth();

  const primaryLinks = [
    { label: 'Feed', path: '/', icon: Home },
    { label: 'Discover', path: '/discover', icon: Compass },
    { label: 'All Topics', path: '/categories', icon: Layers },
    ...(currentUser
      ? [
          { label: 'Following', path: '/following', icon: Users },
          { label: 'Saved Items', path: '/saved', icon: Bookmark },
        ]
      : []),
  ];

  const popularTopics = [
    { name: 'Technology', slug: 'technology', icon: Cpu },
    { name: 'Artificial Intelligence', slug: 'artificial-intelligence', icon: Brain },
    { name: 'Programming', slug: 'programming', icon: Code },
    { name: 'Science', slug: 'science', icon: Atom },
    { name: 'Business', slug: 'business', icon: Building2 },
    { name: 'Global Affairs', slug: 'geography', icon: Globe },
  ];

  return (
    <aside className="w-56 shrink-0 hidden lg:block sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-3">
      {/* Primary Navigation */}
      <div className="space-y-1 mb-8">
        <p className="px-3 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase mb-2">
          Navigation
        </p>
        {primaryLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Featured Topics */}
      <div className="space-y-1 mb-8">
        <div className="flex items-center justify-between px-3 mb-2">
          <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
            Top Categories
          </p>
          <TrendingUp className="w-3 h-3 text-neutral-400" />
        </div>
        {popularTopics.map((cat) => {
          const Icon = cat.icon;
          return (
            <NavLink
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5 shrink-0 text-neutral-500" />
              <span className="truncate">{cat.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Platform & Trust */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 space-y-1">
        <NavLink
          to="/guidelines"
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Community Rules</span>
        </NavLink>
        <NavLink
          to="/terms"
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Terms & Privacy</span>
        </NavLink>
      </div>
    </aside>
  );
};
