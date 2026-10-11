import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  HelpCircle,
  Users,
  Award,
  Calendar,
  UserPlus,
  UserCheck,
  ExternalLink
} from 'lucide-react';
import { UserProfile } from '../../core/models/types';
import { useAuth } from '../../core/context/AuthContext';
import { userService } from '../../core/services/userService';
import { notificationService } from '../../core/services/notificationService';
import { ReputationBadge } from './ReputationBadge';
import { computeReputation } from '../../core/utils/reputation';
import { evaluateUserActivityBadges } from '../../core/utils/activityBadges';

interface UserPreviewCardProps {
  user: UserProfile;
  highlightUsername?: string;
  onFollowChange?: (targetUid: string, isFollowing: boolean) => void;
}

export const UserPreviewCard: React.FC<UserPreviewCardProps> = ({
  user,
  highlightUsername,
  onFollowChange
}) => {
  const { currentUser, userProfile: myProfile } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(user.followersCount || 0);

  const isSelf = currentUser?.uid === user.uid;
  const derivedRep = computeReputation({
    answers: user.answerCount,
    questions: user.questionCount,
    baseReputation: user.reputation || 10
  });

  const { primaryBadge } = evaluateUserActivityBadges({ profile: user });

  useEffect(() => {
    if (currentUser && !isSelf) {
      userService.isFollowingUser(currentUser.uid, user.uid).then(setIsFollowing);
    }
  }, [currentUser, user.uid, isSelf]);

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser || isSelf || followingLoading) return;

    setFollowingLoading(true);
    try {
      if (isFollowing) {
        await userService.unfollowUser(currentUser.uid, user.uid);
        setIsFollowing(false);
        setFollowersCount((prev) => Math.max(0, prev - 1));
        if (onFollowChange) onFollowChange(user.uid, false);
      } else {
        await userService.followUser(currentUser.uid, user.uid);
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
        if (onFollowChange) onFollowChange(user.uid, true);

        // Notify user
        notificationService.createNotification(
          user.uid,
          'follow',
          'New Follower',
          `${myProfile?.displayName || 'Someone'} started following you.`,
          user.username,
          'user',
          currentUser.uid,
          myProfile?.displayName || 'Member'
        );
      }
    } catch (err) {
      console.error('Error toggling follow in UserPreviewCard:', err);
    } finally {
      setFollowingLoading(false);
    }
  };

  const isMatchedByUsername =
    highlightUsername &&
    user.username.toLowerCase().includes(highlightUsername.toLowerCase().replace(/^@/, ''));

  return (
    <article
      className="p-4 sm:p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-xs flex flex-col justify-between gap-4 group"
      data-testid={`user-preview-${user.username}`}
    >
      <div>
        {/* Top Header: Avatar, Name, Handle, Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to={`/user/${user.username}`} className="shrink-0">
              {user.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.displayName}
                  className="w-12 h-12 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center font-bold text-lg font-display">
                  {user.displayName[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  to={`/user/${user.username}`}
                  className="font-bold text-sm text-neutral-950 dark:text-white hover:underline truncate"
                >
                  {user.displayName}
                </Link>
                <ReputationBadge
                  reputation={derivedRep}
                  size="xs"
                  variant="pill"
                />
                {primaryBadge && (
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold border ${primaryBadge.color.border} ${primaryBadge.color.darkBorder} ${primaryBadge.color.bg} ${primaryBadge.color.darkBg} ${primaryBadge.color.text} ${primaryBadge.color.darkText} truncate max-w-[130px]`}
                    title={`${primaryBadge.name}: ${primaryBadge.description}`}
                  >
                    <span>{primaryBadge.shortLabel}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                <Link
                  to={`/user/${user.username}`}
                  className={`font-mono text-[11px] truncate ${
                    isMatchedByUsername
                      ? 'text-neutral-900 dark:text-neutral-100 font-semibold underline decoration-amber-500 underline-offset-2'
                      : 'hover:text-neutral-800 dark:hover:text-neutral-300'
                  }`}
                >
                  @{user.username}
                </Link>
                {isMatchedByUsername && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                    Match
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Follow Action */}
          {currentUser && !isSelf && (
            <button
              type="button"
              onClick={handleToggleFollow}
              disabled={followingLoading}
              className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isFollowing
                  ? 'border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20'
                  : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800'
              }`}
              title={isFollowing ? 'Unfollow' : 'Follow member'}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Follow</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* User Bio */}
        {user.bio ? (
          <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-3 line-clamp-2 leading-relaxed">
            {user.bio}
          </p>
        ) : (
          <p className="text-xs text-neutral-400 italic mt-3">
            OpenAsk community member
          </p>
        )}
      </div>

      {/* Stats Footprint */}
      <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center gap-3.5 flex-wrap">
          <span className="flex items-center gap-1" title={`${user.answerCount || 0} answers`}>
            <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
            <strong className="font-semibold text-neutral-900 dark:text-white tabular-nums">
              {user.answerCount || 0}
            </strong>
            <span className="text-[11px]">answers</span>
          </span>

          <span className="flex items-center gap-1" title={`${user.questionCount || 0} questions`}>
            <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
            <strong className="font-semibold text-neutral-900 dark:text-white tabular-nums">
              {user.questionCount || 0}
            </strong>
            <span className="text-[11px]">questions</span>
          </span>

          <span className="flex items-center gap-1" title={`${followersCount} followers`}>
            <Users className="w-3.5 h-3.5 text-neutral-400" />
            <strong className="font-semibold text-neutral-900 dark:text-white tabular-nums">
              {followersCount}
            </strong>
            <span className="text-[11px]">followers</span>
          </span>
        </div>

        <Link
          to={`/user/${user.username}`}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white group-hover:translate-x-0.5 transition-transform"
        >
          <span>Profile</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </article>
  );
};
