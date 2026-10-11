import React from 'react';
import { Clock } from 'lucide-react';
import { getReadTimeDetails } from '../../core/utils/readTime';

interface ReadTimeBadgeProps {
  content?: string | null;
  className?: string;
  variant?: 'inline' | 'pill';
  size?: 'xs' | 'sm';
  showIcon?: boolean;
}

export const ReadTimeBadge: React.FC<ReadTimeBadgeProps> = ({
  content,
  className = '',
  variant = 'inline',
  size = 'xs',
  showIcon = true,
}) => {
  const details = getReadTimeDetails(content);

  const textSize = size === 'sm' ? 'text-xs' : 'text-[11px]';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-3 h-3';

  if (variant === 'pill') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-700/80 ${textSize} ${className}`}
        title={`Estimated reading duration: ${details.text} (${details.wordCount} words)`}
        aria-label={`Read time: ${details.text}`}
      >
        {showIcon && <Clock className={`${iconSize} text-neutral-400 shrink-0`} />}
        <span>{details.text}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-neutral-400 dark:text-neutral-500 font-normal ${textSize} ${className}`}
      title={`Approx. ${details.wordCount} words (~${details.text})`}
      aria-label={`Read time: ${details.text}`}
    >
      {showIcon && <Clock className={`${iconSize} text-neutral-400 shrink-0`} />}
      <span>{details.text}</span>
    </span>
  );
};
