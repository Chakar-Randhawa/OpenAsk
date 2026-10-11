import React from 'react';
import { X, Award, Sparkles, BookOpen, Star, Crown, CheckCircle2, ArrowRight } from 'lucide-react';
import { REPUTATION_TIERS, ReputationTier } from '../../core/utils/reputation';

interface ReputationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userReputation?: number;
}

export const ReputationModal: React.FC<ReputationModalProps> = ({
  isOpen,
  onClose,
  userReputation
}) => {
  if (!isOpen) return null;

  const renderIcon = (tier: ReputationTier, className = 'w-4 h-4') => {
    switch (tier.iconName) {
      case 'Crown':
        return <Crown className={className} />;
      case 'Star':
        return <Star className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'Sparkles':
      default:
        return <Sparkles className={className} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rep-modal-title"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 font-semibold text-sm text-neutral-900 dark:text-white">
            <Award className="w-4 h-4 text-amber-500" />
            <span id="rep-modal-title">Community Reputation & Badges</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Reputation reflects your standing, helpfulness, and expertise across OpenAsk. Badges are displayed alongside your username to highlight verified contributions.
          </p>

          {/* How to earn reputation */}
          <div className="p-3.5 bg-neutral-50 dark:bg-neutral-850 rounded-xl space-y-2 border border-neutral-100 dark:border-neutral-800">
            <h4 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>How Reputation is Earned</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center justify-between p-2 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700/60">
                <span>Helpful answer accepted</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">+15 pts</strong>
              </div>
              <div className="flex items-center justify-between p-2 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700/60">
                <span>Community upvote</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">+10 pts</strong>
              </div>
              <div className="flex items-center justify-between p-2 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700/60">
                <span>Answer published</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">+5 pts</strong>
              </div>
              <div className="flex items-center justify-between p-2 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700/60">
                <span>Question asked</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">+2 pts</strong>
              </div>
            </div>
          </div>

          {/* Tier levels list */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-neutral-900 dark:text-white">
              Reputation Tiers & Badges
            </h4>
            <div className="space-y-2">
              {REPUTATION_TIERS.map((tier) => {
                const isCurrent =
                  userReputation !== undefined &&
                  userReputation >= tier.minReputation &&
                  userReputation <= tier.maxReputation;

                return (
                  <div
                    key={tier.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                      isCurrent
                        ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-800/80 shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border ${tier.colorClasses.bg} ${tier.colorClasses.text} ${tier.colorClasses.border} ${tier.colorClasses.darkBg} ${tier.colorClasses.darkText} ${tier.colorClasses.darkBorder}`}
                      >
                        {renderIcon(tier, 'w-4 h-4')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-neutral-900 dark:text-white">
                            {tier.name}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                              Your Tier
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          {tier.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-200 text-xs">
                        {tier.minReputation}
                        {tier.maxReputation === Infinity ? '+' : ` - ${tier.maxReputation}`}
                      </span>
                      <p className="text-[10px] text-neutral-400">pts</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 bg-neutral-50 dark:bg-neutral-850 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
