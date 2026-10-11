import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'shimmer' | 'pulse' | 'none';
  width?: string | number;
  height?: string | number;
}

/**
 * Base atomic Skeleton primitive
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  animation = 'shimmer',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-none';
      case 'rounded':
        return 'rounded-xl';
      case 'text':
      default:
        return 'rounded-md';
    }
  };

  const getAnimationClass = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse bg-neutral-200 dark:bg-neutral-800';
      case 'none':
        return 'bg-neutral-200 dark:bg-neutral-800';
      case 'shimmer':
      default:
        return 'animate-shimmer';
    }
  };

  const inlineStyles: React.CSSProperties = {
    ...style,
    ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {})
  };

  return (
    <div
      role="status"
      aria-label="Loading..."
      aria-hidden="true"
      className={`select-none pointer-events-none ${getVariantClass()} ${getAnimationClass()} ${className}`}
      style={inlineStyles}
      {...props}
    />
  );
};

/**
 * Skeleton for an individual Question Card in the feed, search, and topics
 */
export const QuestionCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <article
      className={`p-4 sm:p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3.5 ${className}`}
      role="status"
      aria-label="Loading discussion card"
    >
      {/* Category and Author Metadata line */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-3.5 w-24 rounded" />
        <span className="text-neutral-300 dark:text-neutral-700 text-xs">·</span>
        <Skeleton className="h-3.5 w-20 rounded" />
        <span className="text-neutral-300 dark:text-neutral-700 text-xs">·</span>
        <Skeleton className="h-3 w-12 rounded" />
      </div>

      {/* Question Title */}
      <div className="space-y-1.5">
        <Skeleton className="h-5 w-11/12 rounded" />
        <Skeleton className="h-5 w-3/5 rounded" />
      </div>

      {/* Question Excerpt Body */}
      <div className="space-y-1.5 pt-0.5">
        <Skeleton className="h-3.5 w-full rounded" />
        <Skeleton className="h-3.5 w-4/5 rounded" />
      </div>

      {/* Bottom Action Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-20 rounded-lg" />
          <Skeleton className="h-7 w-24 rounded-lg" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-7 w-7 rounded-lg" />
        </div>
      </div>
    </article>
  );
};

/**
 * Skeleton for a list of Question Cards (e.g. Home, Category, Saved, Search)
 */
export const QuestionListSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 4,
  className = 'space-y-4'
}) => {
  return (
    <div className={className} role="status" aria-label="Loading questions">
      {Array.from({ length: count }).map((_, index) => (
        <QuestionCardSkeleton key={index} />
      ))}
    </div>
  );
};

/**
 * Skeleton for Question Detail Page
 */
export const QuestionDetailSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`} role="status" aria-label="Loading question details">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-12 rounded" />
        <span className="text-neutral-300 dark:text-neutral-700 text-xs">/</span>
        <Skeleton className="h-3 w-28 rounded" />
      </div>

      {/* Question Header Card */}
      <article className="p-6 sm:p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-5">
        {/* Author / Date line */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Skeleton variant="circular" className="w-8 h-8" />
            <div className="space-y-1">
              <Skeleton className="h-3.5 w-28 rounded" />
              <Skeleton className="h-2.5 w-16 rounded" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-lg" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-7 w-11/12 rounded" />
          <Skeleton className="h-7 w-3/4 rounded" />
        </div>

        {/* Full Question Body */}
        <div className="space-y-2.5 py-1">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <Skeleton className="h-4 w-4/6 rounded" />
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      </article>

      {/* Answer Section Header */}
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-6 w-32 rounded" />
        <Skeleton className="h-7 w-36 rounded-lg" />
      </div>

      {/* Answers Skeleton Cards */}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="p-5 sm:p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3.5"
          >
            <div className="flex items-center gap-2.5">
              <Skeleton variant="circular" className="w-7 h-7" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-24 rounded" />
                <Skeleton className="h-2.5 w-14 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-full rounded" />
              <Skeleton className="h-3.5 w-11/12 rounded" />
              <Skeleton className="h-3.5 w-2/3 rounded" />
            </div>
            <div className="pt-2 flex items-center gap-3">
              <Skeleton className="h-7 w-16 rounded-lg" />
              <Skeleton className="h-7 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton for User Profile Page
 */
export const UserProfileSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`} role="status" aria-label="Loading user profile">
      {/* Profile Header */}
      <div className="p-6 sm:p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton variant="rounded" className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40 rounded" />
              <Skeleton className="h-3.5 w-28 rounded" />
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="h-3 w-20 rounded" />
                <span className="text-neutral-300 dark:text-neutral-700">·</span>
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            </div>
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>

        {/* Bio skeleton */}
        <div className="space-y-1.5 pt-1">
          <Skeleton className="h-3.5 w-3/4 rounded" />
          <Skeleton className="h-3.5 w-1/2 rounded" />
        </div>

        {/* Stats metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-xl space-y-1.5">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-5 w-12 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs navigation skeleton */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      {/* Profile feed items skeleton */}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <QuestionCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton for Topic / Category Card in Discover Page
 */
export const CategoryCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`p-4 sm:p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3 ${className}`}
      role="status"
    >
      <div className="flex items-center gap-3">
        <Skeleton variant="rounded" className="w-9 h-9 rounded-lg" />
        <div className="space-y-1.5 flex-1 min-w-0">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
      </div>
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-2/3 rounded" />
      <div className="pt-2 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/80">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-5 w-12 rounded" />
      </div>
    </div>
  );
};

/**
 * Skeleton for Discover Page categories grid
 */
export const CategoryListSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 6,
  className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'
}) => {
  return (
    <div className={className} role="status" aria-label="Loading categories">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Skeleton for Notification items
 */
export const NotificationSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-start gap-3.5 ${className}`}
      role="status"
      aria-label="Loading notification"
    >
      <Skeleton variant="circular" className="w-8 h-8 shrink-0" />
      <div className="space-y-1.5 flex-1 min-w-0">
        <Skeleton className="h-3.5 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
      <Skeleton className="h-3 w-12 rounded shrink-0" />
    </div>
  );
};

/**
 * Skeleton for Notification Center List
 */
export const NotificationListSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 4,
  className = 'space-y-2.5'
}) => {
  return (
    <div className={className} role="status" aria-label="Loading notifications">
      {Array.from({ length: count }).map((_, i) => (
        <NotificationSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Skeleton for the Context Sidebar (desktop right column)
 */
export const ContextSidebarSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <aside className={`w-72 shrink-0 hidden xl:block space-y-6 ${className}`} role="status">
      {/* Assurance card skeleton */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" className="w-4 h-4" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-11/12 rounded" />
          <Skeleton className="h-3 w-3/4 rounded" />
        </div>
        <Skeleton className="h-3 w-28 rounded" />
      </div>

      {/* Suggested topics skeleton */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3.5">
        <Skeleton className="h-4 w-28 rounded" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="space-y-1 flex-1">
                <Skeleton className="h-3.5 w-3/5 rounded" />
                <Skeleton className="h-2.5 w-2/5 rounded" />
              </div>
              <Skeleton className="h-6 w-12 rounded" />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

/**
 * High-level Global Page Skeleton supporting all application layouts
 */
export interface GlobalPageSkeletonProps {
  variant?: 'feed' | 'detail' | 'profile' | 'categories' | 'notifications' | 'generic';
  count?: number;
  showSidebarSkeleton?: boolean;
  className?: string;
}

export const GlobalPageSkeleton: React.FC<GlobalPageSkeletonProps> = ({
  variant = 'feed',
  count,
  showSidebarSkeleton = false,
  className = ''
}) => {
  switch (variant) {
    case 'detail':
      return <QuestionDetailSkeleton className={className} />;

    case 'profile':
      return <UserProfileSkeleton className={className} />;

    case 'categories':
      return (
        <div className={`space-y-6 ${className}`}>
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-48 rounded" />
              <Skeleton className="h-3.5 w-72 rounded" />
            </div>
            <Skeleton className="h-9 w-60 rounded-xl" />
          </div>
          <CategoryListSkeleton count={count ?? 6} />
        </div>
      );

    case 'notifications':
      return (
        <div className={`max-w-2xl mx-auto space-y-5 ${className}`}>
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-48 rounded" />
              <Skeleton className="h-3.5 w-64 rounded" />
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-16 rounded-lg" />
            <Skeleton className="h-7 w-20 rounded-lg" />
          </div>
          <NotificationListSkeleton count={count ?? 5} />
        </div>
      );

    case 'generic':
      return (
        <div className={`space-y-4 max-w-3xl mx-auto ${className}`}>
          <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-4">
            <Skeleton className="h-6 w-1/3 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-4/5 rounded" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>
      );

    case 'feed':
    default:
      return (
        <div className={`flex items-start gap-8 ${className}`}>
          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-8 w-20 rounded-lg" />
                <Skeleton className="h-8 w-20 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
            <QuestionListSkeleton count={count ?? 4} />
          </div>

          {showSidebarSkeleton && <ContextSidebarSkeleton />}
        </div>
      );
  }
};
