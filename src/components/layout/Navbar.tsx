import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  Bell,
  User,
  LogOut,
  Settings,
  Bookmark,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { ThemeToggle } from '../theme/ThemeToggle';

interface NavbarProps {
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Discover', path: '/discover' },
    { label: 'Topics', path: '/categories' },
    { label: 'Guidelines', path: '/guidelines' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -ml-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <Link
            to="/"
            className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 dark:text-white font-display"
          >
            OpenAsk
          </Link>
        </div>

        {/* Zone 2: Clean 4-6 text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-neutral-950 dark:text-white font-semibold'
                    : 'hover:text-neutral-950 dark:hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Actions (Search, Theme, Ask, User) */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex relative items-center">
            <Search className="w-4 h-4 absolute left-3 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search OpenAsk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 md:w-56 lg:w-64 pl-9 pr-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 rounded-lg border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 focus:bg-white dark:focus:bg-neutral-900 focus:outline-none transition-all"
            />
          </form>

          {/* Theme Selector */}
          <ThemeToggle variant="navbar" />

          {/* Ask Button */}
          <Link
            to="/ask"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden xs:inline">Ask Question</span>
          </Link>

          {/* User / Authentication */}
          {currentUser ? (
            <>
              {/* Notification icon */}
              <Link
                to="/notifications"
                className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
              </Link>

              {/* Profile Avatar & Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {userProfile?.photoUrl ? (
                    <img
                      src={userProfile.photoUrl}
                      alt={userProfile.displayName}
                      className="w-7 h-7 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center text-xs font-bold">
                      {userProfile?.displayName ? userProfile.displayName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                </button>

                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-1.5 text-xs z-50"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-neutral-100 dark:border-neutral-800">
                      <p className="font-semibold text-neutral-900 dark:text-white truncate">
                        {userProfile?.displayName}
                      </p>
                      <p className="text-neutral-500 truncate">@{userProfile?.username}</p>
                    </div>

                    <Link
                      to={`/user/${userProfile?.username || currentUser.uid}`}
                      className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                    >
                      <User className="w-4 h-4" /> My Profile
                    </Link>

                    <Link
                      to="/saved"
                      className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                    >
                      <Bookmark className="w-4 h-4" /> Bookmarks
                    </Link>

                    <Link
                      to="/settings"
                      className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </Link>

                    <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />

                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Sign In
            </Link>
          )}

        </div>
      </div>

      {/* Mobile Slideout Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-3">
            <Search className="w-4 h-4 absolute left-3 text-neutral-400" />
            <input
              type="text"
              placeholder="Search discussions & categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 rounded-lg border-0 focus:ring-1 focus:ring-neutral-400"
            />
          </form>

          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile Theme Selector */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <p className="text-[11px] font-medium text-neutral-500 mb-2">Theme</p>
            <ThemeToggle variant="segmented" />
          </div>

          {!currentUser && (
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-1/2 text-center py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-1/2 text-center py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
