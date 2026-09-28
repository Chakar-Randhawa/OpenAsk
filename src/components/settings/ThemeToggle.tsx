import React from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme, Theme } from '../../core/context/ThemeContext';

export interface ThemeSettingsToggleProps {
  className?: string;
  onThemeChange?: (theme: Theme) => void;
  variant?: 'cards' | 'buttons' | 'dropdown';
}

export const ThemeToggle: React.FC<ThemeSettingsToggleProps> = ({
  className = '',
  onThemeChange,
  variant = 'cards'
}) => {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();

  const handleSelect = (newTheme: Theme) => {
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  const options: Array<{
    id: Theme;
    label: string;
    description: string;
    icon: typeof Sun;
  }> = [
    {
      id: 'light',
      label: 'Light Mode',
      description: 'Bright and clean aesthetic with high contrast',
      icon: Sun
    },
    {
      id: 'dark',
      label: 'Dark Mode',
      description: 'Subtle neutral dark palette designed for low-light focus',
      icon: Moon
    },
    {
      id: 'system',
      label: 'System Preference',
      description: `Adapts dynamically to operating system settings (currently ${systemTheme})`,
      icon: Monitor
    }
  ];

  if (variant === 'buttons') {
    return (
      <div
        className={`grid grid-cols-3 gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl ${className}`}
        role="radiogroup"
        aria-label="Color theme selection"
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
              onClick={() => handleSelect(opt.id)}
              className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white font-semibold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{opt.label.replace(' Mode', '').replace(' Preference', '')}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Default 'cards' presentation for Settings Page
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-3 gap-3.5 ${className}`}
      role="radiogroup"
      aria-label="Theme settings options"
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
            onClick={() => handleSelect(opt.id)}
            className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 dark:focus-visible:ring-white ${
              isSelected
                ? 'border-neutral-950 dark:border-white bg-neutral-100/90 dark:bg-neutral-800 shadow-xs ring-1 ring-neutral-950/10 dark:ring-white/20'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div
                className={`p-2 rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {isSelected ? (
                <span
                  className="flex items-center justify-center w-5 h-5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                  aria-hidden="true"
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              ) : (
                <span className="w-5 h-5 rounded-full border border-neutral-300 dark:border-neutral-700" aria-hidden="true" />
              )}
            </div>

            <p
              className={`text-xs font-semibold tracking-tight ${
                isSelected ? 'text-neutral-950 dark:text-white' : 'text-neutral-800 dark:text-neutral-200'
              }`}
            >
              {opt.label}
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
              {opt.description}
            </p>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
