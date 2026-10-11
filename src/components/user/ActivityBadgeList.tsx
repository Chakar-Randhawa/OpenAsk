import React, { useState } from 'react';
import {
  Flame,
  Brain,
  Award,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  Crown,
  Star,
  Zap,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  ActivityBadge,
  UserBadgeEvaluationResult,
  evaluateUserActivityBadges
} from '../../core/utils/activityBadges';
import { BadgeModal } from './BadgeModal';
import { UserProfile, Question, Answer } from '../../core/models/types';

interface ActivityBadgeListProps {
  profile: UserProfile;
  questions?: Question[];
  answers?: Answer[];
  variant?: 'showcase' | 'compact' | 'pills-only';
  className?: string;
}

export const ActivityBadgeList: React.FC<ActivityBadgeListProps> = ({
  profile,
  questions = [],
  answers = [],
  variant = 'showcase',
  className = '',
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const evaluation: UserBadgeEvaluationResult = evaluateUserActivityBadges({
    profile,
    questions,
    answers,
  });

  const renderBadgeIcon = (name: ActivityBadge['iconName'], className: string) => {
    switch (name) {
      case 'Flame':
        return <Flame className={className} />;
      case 'Brain':
        return <Brain className={className} />;
      case 'HelpCircle':
        return <HelpCircle className={className} />;
      case 'CheckCircle2':
        return <CheckCircle2 className={className} />;
      case 'Crown':
        return <Crown className={className} />;
      case 'Star':
        return <Star className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Sparkles':
      case 'Award':
      default:
        return <Award className={className} />;
    }
  };

  const { unlockedBadges } = evaluation;

  if (unlockedBadges.length === 0) {
    return null;
  }

  if (variant === 'pills-only') {
    return (
      <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
        {unlockedBadges.slice(0, 3).map((badge) => (
          <span
            key={badge.id}
            onClick={() => setModalOpen(true)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badge.color.border} ${badge.color.darkBorder} ${badge.color.bg} ${badge.color.darkBg} ${badge.color.text} ${badge.color.darkText} cursor-pointer hover:opacity-90 transition-opacity`}
            title={badge.description}
          >
            {renderBadgeIcon(badge.iconName, `w-3 h-3 ${badge.color.icon}`)}
            <span>{badge.shortLabel}</span>
          </span>
        ))}
        {unlockedBadges.length > 3 && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-[10px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 underline cursor-pointer"
          >
            +{unlockedBadges.length - 3} more
          </button>
        )}
        <BadgeModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          evaluation={evaluation}
          userName={profile.displayName}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            Activity Badges
          </h3>
          <span className="text-[10px] text-neutral-400 tabular-nums">
            ({unlockedBadges.length} earned)
          </span>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-0.5 cursor-pointer"
        >
          <span>View all criteria</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Badges Grid / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {unlockedBadges.map((badge) => (
          <div
            key={badge.id}
            onClick={() => setModalOpen(true)}
            className={`p-2.5 rounded-xl border ${badge.color.border} ${badge.color.darkBorder} ${badge.color.bg} ${badge.color.darkBg} cursor-pointer hover:shadow-xs transition-shadow flex items-center gap-2.5 group`}
            title={`${badge.name}: ${badge.description}`}
          >
            <div className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 shadow-2xs shrink-0">
              {renderBadgeIcon(badge.iconName, `w-4 h-4 ${badge.color.icon}`)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h4 className={`text-xs font-bold truncate ${badge.color.text} ${badge.color.darkText}`}>
                  {badge.name}
                </h4>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 rounded bg-white/80 dark:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400 shrink-0">
                  {badge.tier}
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                {badge.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <BadgeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        evaluation={evaluation}
        userName={profile.displayName}
      />
    </div>
  );
};
