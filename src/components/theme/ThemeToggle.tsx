import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme, Theme } from '../../core/context/ThemeContext';

export interface ThemeToggleProps {
  variant?: 'navbar' | 'segmented' | 'cards';
  className?: string;
  onThemeChange?: (theme: Theme) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'navbar',
  className = '',
  onThemeChange
}) => {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const handleSelectTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    setDropdownOpen(false);
    onThemeChange?.(newTheme);
  };

  // 1. CARDS VARIANT (Used on Settings page)
  if (variant === 'cards') {
    const options: Array<{
      id: Theme;
      label: string;
      desc: string;
      icon: typeof Sun;
    }> = [
      {
        id: 'light',
        label: 'Light',
        desc: 'Crisp, high-contrast light presentation',
        icon: Sun
      },
      {
        id: 'dark',
        label: 'Dark',
        desc: 'Deep neutral dark tones comfortable in low light',
        icon: Moon
      },
      {
        id: 'system',
        label: 'System',
        desc: `Matches device preference (currently ${systemTheme})`,
        icon: Monitor
      }
    ];

    return (
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${className}`}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelectTheme(opt.id)}
              aria-pressed={isSelected}
              className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800 shadow-sm ring-1 ring-neutral-900/10 dark:ring-white/20'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isSelected && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-[10px]">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <p
                className={`text-xs font-semibold ${
                  isSelected ? 'text-neutral-950 dark:text-white' : 'text-neutral-800 dark:text-neutral-200'
                }`}
              >
                {opt.label}
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                {opt.desc}
              </p>
            </button>
          );
        })}
      </div>
    );
  }

  // 2. SEGMENTED VARIANT (Used on Mobile menu and compact layouts)
  if (variant === 'segmented') {
    const options: Array<{ id: Theme; label: string; icon: typeof Sun }> = [
      { id: 'light', label: 'Light', icon: Sun },
      { id: 'dark', label: 'Dark', icon: Moon },
      { id: 'system', label: 'System', icon: Monitor }
    ];

    return (
      <div
        className={`grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl ${className}`}
        role="radiogroup"
        aria-label="Theme selection"
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelectTheme(opt.id)}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white font-semibold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // 3. NAVBAR DROPDOWN VARIANT (Default Desktop Navbar Theme Toggle)
  const ActiveIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
          dropdownOpen
            ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white'
            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
        }`}
        aria-label={`Current theme: ${theme} (displays ${resolvedTheme}). Click to change.`}
        aria-haspopup="menu"
        aria-expanded={dropdownOpen}
      >
        <ActiveIcon className="w-4 h-4" />
      </button>

      {dropdownOpen && (
        <div
          className="absolute right-0 mt-2 w-44 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 py-1.5 text-xs z-50 animate-in fade-in zoom-in-95 duration-100"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-3 py-1 border-b border-neutral-100 dark:border-neutral-750 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500">
              Appearance
            </span>
          </div>

          <button
            type="button"
            role="menuitemradio"
            aria-checked={theme === 'light'}
            onClick={() => handleSelectTheme('light')}
            className={`w-full flex items-center justify-between px-3 py-2 text-left cursor-pointer transition-colors ${
              theme === 'light'
                ? 'bg-neutral-50 dark:bg-neutral-700/50 text-neutral-950 dark:text-white font-medium'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </span>
            {theme === 'light' && <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white" />}
          </button>

          <button
            type="button"
            role="menuitemradio"
            aria-checked={theme === 'dark'}
            onClick={() => handleSelectTheme('dark')}
            className={`w-full flex items-center justify-between px-3 py-2 text-left cursor-pointer transition-colors ${
              theme === 'dark'
                ? 'bg-neutral-50 dark:bg-neutral-700/50 text-neutral-950 dark:text-white font-medium'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dark</span>
            </span>
            {theme === 'dark' && <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white" />}
          </button>

          <button
            type="button"
            role="menuitemradio"
            aria-checked={theme === 'system'}
            onClick={() => handleSelectTheme('system')}
            className={`w-full flex items-center justify-between px-3 py-2 text-left cursor-pointer transition-colors ${
              theme === 'system'
                ? 'bg-neutral-50 dark:bg-neutral-700/50 text-neutral-950 dark:text-white font-medium'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Monitor className="w-3.5 h-3.5 text-neutral-400" />
              <span>
                System
                <span className="ml-1.5 text-[10px] text-neutral-400 dark:text-neutral-500 font-normal">
                  ({systemTheme})
                </span>
              </span>
            </span>
            {theme === 'system' && <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white" />}
          </button>
        </div>
      )}
    </div>
  );
};
