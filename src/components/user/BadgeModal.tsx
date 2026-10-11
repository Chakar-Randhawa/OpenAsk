import React from 'react';
import {
  X,
  Award,
  Flame,
  Brain,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  Crown,
  Star,
  Zap,
  Lock,
  Check
} from 'lucide-react';
import { ActivityBadge, UserBadgeEvaluationResult } from '../../core/utils/activityBadges';

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: UserBadgeEvaluationResult;
  userName: string;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  userName,
}) => {
  if (!isOpen) return null;

  const renderIcon = (name: ActivityBadge['iconName'], className: string) => {
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

  const { unlockedBadges, inProgressBadges } = evaluation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="badge-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 id="badge-modal-title" className="text-sm font-bold text-neutral-950 dark:text-white font-display">
                Activity Badges & Honors
              </h2>
              <p className="text-[11px] text-neutral-400">
                Earned by {userName} through peer contributions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Scroll */}
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Unlocked Badges Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                Unlocked Badges ({unlockedBadges.length})
              </span>
              <span className="text-[10px] text-neutral-400 font-normal">Active on Profile</span>
            </div>

            {unlockedBadges.length === 0 ? (
              <p className="text-xs text-neutral-400 italic">No badges unlocked yet.</p>
            ) : (
              <div className="space-y-2.5">
                {unlockedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-3.5 rounded-xl border ${badge.color.border} ${badge.color.darkBorder} ${badge.color.bg} ${badge.color.darkBg} flex items-start gap-3.5`}
                  >
                    <div className="p-2 rounded-lg bg-white dark:bg-neutral-800 shadow-xs shrink-0">
                      {renderIcon(badge.iconName, `w-5 h-5 ${badge.color.icon}`)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-xs font-bold ${badge.color.text} ${badge.color.darkText}`}>
                          {badge.name}
                        </h4>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 shadow-xs shrink-0">
                          {badge.tier}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                        {badge.description}
                      </p>
                      <div className="mt-2 text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1 font-mono">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Criteria met:</span>
                        <span>{badge.criteria}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* In-Progress Badges Section */}
          {inProgressBadges.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-neutral-400" />
                  Upcoming Badges to Unlock ({inProgressBadges.length})
                </span>
                <span className="text-[10px] text-neutral-400 font-normal">Activity Targets</span>
              </div>

              <div className="space-y-2.5">
                {inProgressBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850/60 flex items-start gap-3.5 opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <div className="p-2 rounded-lg bg-neutral-200/60 dark:bg-neutral-800 text-neutral-400 shrink-0">
                      {renderIcon(badge.iconName, 'w-5 h-5')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          {badge.name}
                        </h4>
                        <span className="text-[10px] text-neutral-400 tabular-nums">
                          {badge.progress.current} / {badge.progress.target} {badge.progress.unit}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                        {badge.criteria}
                      </p>

                      {/* Progress Bar */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${badge.progress.percent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400 tabular-nums">
                          {badge.progress.percent}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-between text-xs">
          <span className="text-neutral-400 text-[11px]">
            Badges update automatically as contributions are posted.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
