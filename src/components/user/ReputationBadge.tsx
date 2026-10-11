import React, { useState, useEffect } from 'react';
import { Sparkles, Award, BookOpen, Star, Crown, ChevronRight, Info } from 'lucide-react';
import { getReputationTier, getTierProgress, ReputationTier, computeReputation } from '../../core/utils/reputation';
import { userService } from '../../core/services/userService';

export interface ReputationBadgeProps {
  reputation?: number;
  userId?: string;
  answerCount?: number;
  questionCount?: number;
  upvotesCount?: number;
  isAnonymous?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'pill' | 'icon-only' | 'compact' | 'detailed';
  showTooltip?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const ReputationBadge: React.FC<ReputationBadgeProps> = ({
  reputation: explicitReputation,
  userId,
  answerCount,
  questionCount,
  upvotesCount,
  isAnonymous = false,
  size = 'xs',
  variant = 'compact',
  showTooltip = true,
  className = '',
  onClick
}) => {
  const [resolvedReputation, setResolvedReputation] = useState<number | null>(
    explicitReputation !== undefined
      ? explicitReputation
      : (answerCount !== undefined || questionCount !== undefined || upvotesCount !== undefined)
      ? computeReputation({ answers: answerCount, questions: questionCount, upvotes: upvotesCount })
      : null
  );
  const [showPopover, setShowPopover] = useState(false);

  useEffect(() => {
    if (isAnonymous) return;
    if (explicitReputation !== undefined) {
      setResolvedReputation(explicitReputation);
      return;
    }
    if (answerCount !== undefined || questionCount !== undefined || upvotesCount !== undefined) {
      setResolvedReputation(computeReputation({ answers: answerCount, questions: questionCount, upvotes: upvotesCount }));
      return;
    }
    if (userId) {
      let isMounted = true;
      userService.getUserReputation(userId).then((rep) => {
        if (isMounted) setResolvedReputation(rep);
      });
      return () => {
        isMounted = false;
      };
    }
  }, [explicitReputation, userId, answerCount, questionCount, upvotesCount, isAnonymous]);

  // NEVER show a reputation badge on anonymous content (strict privacy invariant)
  if (isAnonymous) {
    return null;
  }

  // If still resolving
  const finalRep = resolvedReputation !== null ? resolvedReputation : 10;
  const tier: ReputationTier = getReputationTier(finalRep);
  const progress = getTierProgress(finalRep);

  const renderIcon = (iconClass: string) => {
    switch (tier.iconName) {
      case 'Crown':
        return <Crown className={iconClass} />;
      case 'Star':
        return <Star className={iconClass} />;
      case 'BookOpen':
        return <BookOpen className={iconClass} />;
      case 'Award':
        return <Award className={iconClass} />;
      case 'Sparkles':
      default:
        return <Sparkles className={iconClass} />;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'lg':
        return 'w-4 h-4';
      case 'md':
        return 'w-3.5 h-3.5';
      case 'sm':
        return 'w-3 h-3';
      case 'xs':
      default:
        return 'w-2.5 h-2.5';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'lg':
        return 'text-xs font-semibold';
      case 'md':
        return 'text-[11px] font-medium';
      case 'sm':
        return 'text-[10px] font-medium';
      case 'xs':
      default:
        return 'text-[9.5px] font-semibold';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'lg':
        return 'px-2.5 py-1 gap-1.5';
      case 'md':
        return 'px-2 py-0.5 gap-1.5';
      case 'sm':
        return 'px-1.5 py-0.5 gap-1';
      case 'xs':
      default:
        return 'px-1.5 py-0.5 gap-1';
    }
  };

  const badgeContent = (
    <span
      className={`inline-flex items-center rounded-full border transition-all select-none cursor-help ${tier.colorClasses.bg} ${tier.colorClasses.text} ${tier.colorClasses.border} ${tier.colorClasses.darkBg} ${tier.colorClasses.darkText} ${tier.colorClasses.darkBorder} ${getTextSize()} ${getPadding()} ${className}`}
      title={`${tier.name} (${finalRep} reputation)`}
      onClick={(e) => {
        if (onClick) onClick(e);
        if (showTooltip) {
          setShowPopover(!showPopover);
        }
      }}
      role="status"
      aria-label={`Reputation: ${tier.badgeLabel} with ${finalRep} points`}
    >
      {renderIcon(getIconSize())}
      {variant !== 'icon-only' && (
        <span className="tracking-tight">{tier.badgeLabel}</span>
      )}
      {variant === 'detailed' && (
        <span className="opacity-75 font-mono text-[9px] tabular-nums">· {finalRep}</span>
      )}
    </span>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowPopover(true)}
      onMouseLeave={() => setShowPopover(false)}
    >
      {badgeContent}

      {/* Floating Detailed Hover Popover */}
      {showPopover && (
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-56 p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150"
          role="tooltip"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
              {renderIcon('w-3.5 h-3.5 text-amber-500')}
              <span>{tier.name}</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 tabular-nums">
              {finalRep} pts
            </span>
          </div>

          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5 leading-snug">
            {tier.description}
          </p>

          {/* Progress to next tier */}
          {progress.nextTier ? (
            <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                <span>Next: {progress.nextTier.name}</span>
                <span className="tabular-nums font-mono">{progress.pointsToNext} pts left</span>
              </div>
              <div className="w-full h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neutral-900 dark:bg-neutral-100 transition-all rounded-full"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="mt-2 pt-1.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
              <Crown className="w-3 h-3" />
              <span>Highest community tier reached</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
