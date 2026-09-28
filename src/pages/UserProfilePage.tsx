import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  Users,
  MessageSquare,
  HelpCircle,
  Bookmark,
  Check,
  Settings,
  Calendar,
  AlertCircle,
  Share2,
  Flag,
  MoreHorizontal,
  VolumeX,
  Volume2,
  UserX,
  UserCheck,
  X,
  ChevronRight
} from 'lucide-react';
import { UserProfile, Question, Answer, SavedItem } from '../core/models/types';
import { userService } from '../core/services/userService';
import { questionService } from '../core/services/questionService';
import { answerService } from '../core/services/answerService';
import { notificationService } from '../core/services/notificationService';
import { useAuth } from '../core/context/AuthContext';
import { QuestionCard } from '../components/question/QuestionCard';
import { ShareModal } from '../components/dialogs/ShareModal';
import { ReportModal } from '../components/dialogs/ReportModal';

export const UserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { currentUser, userProfile } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [activeTab, setActiveTab] = useState<'questions' | 'answers' | 'saved'>('questions');
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // Social graph modals
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);
  const [followersList, setFollowersList] = useState<UserProfile[]>([]);
  const [followingList, setFollowingList] = useState<UserProfile[]>([]);
  const [socialLoading, setSocialLoading] = useState(false);

  // Share & Report
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);

    userService.getUserByUsername(username).then(async (user) => {
      if (!user) {
        // Fallback check if username is a UID
        const byUid = await userService.getUserByUid(username);
        setProfile(byUid);
        if (byUid) {
          loadUserData(byUid);
        } else {
          setLoading(false);
        }
      } else {
        setProfile(user);
        loadUserData(user);
      }
    });
  }, [username, currentUser]);

  const loadUserData = async (u: UserProfile) => {
    try {
      const [qList, aList] = await Promise.all([
        questionService.getQuestions({ authorUid: u.uid, limitCount: 50 }),
        answerService.getAnswersByAuthor(u.uid, 50)
      ]);
      setQuestions(qList);
      setAnswers(aList);

      if (currentUser && currentUser.uid === u.uid) {
        const saved = await questionService.getSavedQuestions(u.uid);
        setSavedItems(saved);
      }

      if (currentUser && currentUser.uid !== u.uid) {
        const [following, blocked, muted] = await Promise.all([
          userService.isFollowingUser(currentUser.uid, u.uid),
          userService.isUserBlocked(currentUser.uid, u.uid),
          userService.isUserMuted(currentUser.uid, u.uid)
        ]);
        setIsFollowing(following);
        setIsBlocked(blocked);
        setIsMuted(muted);
      }
    } catch (err) {
      console.error('Error loading user profile details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!currentUser || !profile) return;
    try {
      if (isFollowing) {
        await userService.unfollowUser(currentUser.uid, profile.uid);
        setIsFollowing(false);
        setProfile(p => p ? { ...p, followersCount: Math.max(0, p.followersCount - 1) } : null);
      } else {
        await userService.followUser(currentUser.uid, profile.uid);
        notificationService.createNotification(
          profile.uid,
          'follow',
          'New Follower',
          `${userProfile?.displayName || 'Someone'} started following you.`,
          profile.username,
          'user',
          currentUser.uid,
          userProfile?.displayName || 'Member'
        );
        setIsFollowing(true);
        setProfile(p => p ? { ...p, followersCount: p.followersCount + 1 } : null);
      }
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  const handleToggleBlock = async () => {
    if (!currentUser || !profile) return;
    try {
      if (isBlocked) {
        await userService.unblockUser(currentUser.uid, profile.uid);
        setIsBlocked(false);
      } else {
        await userService.blockUser(currentUser.uid, profile.uid);
        setIsBlocked(true);
      }
      setMenuOpen(false);
    } catch (err) {
      console.error('Error toggling block:', err);
    }
  };

  const handleToggleMute = async () => {
    if (!currentUser || !profile) return;
    try {
      if (isMuted) {
        await userService.unmuteUser(currentUser.uid, profile.uid);
        setIsMuted(false);
      } else {
        await userService.muteUser(currentUser.uid, profile.uid);
        setIsMuted(true);
      }
      setMenuOpen(false);
    } catch (err) {
      console.error('Error toggling mute:', err);
    }
  };

  const openFollowersModal = async () => {
    if (!profile) return;
    setSocialLoading(true);
    setFollowersModalOpen(true);
    try {
      const list = await userService.getFollowers(profile.uid);
      setFollowersList(list);
    } catch (err) {
      console.error('Error loading followers:', err);
    } finally {
      setSocialLoading(false);
    }
  };

  const openFollowingModal = async () => {
    if (!profile) return;
    setSocialLoading(true);
    setFollowingModalOpen(true);
    try {
      const list = await userService.getFollowing(profile.uid);
      setFollowingList(list);
    } catch (err) {
      console.error('Error loading following list:', err);
    } finally {
      setSocialLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-44 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl animate-pulse" />
        <div className="h-40 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md mx-auto space-y-3">
        <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-950 dark:text-white">User Not Found</h2>
        <p className="text-xs text-neutral-500">The user profile does not exist.</p>
        <Link to="/" className="inline-block text-xs font-semibold text-neutral-900 dark:text-white underline">
          Return to home
        </Link>
      </div>
    );
  }

  const isOwner = currentUser && currentUser.uid === profile.uid;
  const derivedReputation = Math.max(10, 10 + (profile.answerCount || 0) * 5 + (profile.questionCount || 0) * 2);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Profile Header */}
      <div className="p-6 sm:p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.displayName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-neutral-200 dark:border-neutral-700"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center font-bold text-2xl font-display">
                {profile.displayName[0]?.toUpperCase() || 'U'}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white font-display">
                  {profile.displayName}
                </h1>
                {isBlocked && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                    Blocked
                  </span>
                )}
                {isMuted && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    Muted
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500">@{profile.username}</p>
              
              <div className="flex items-center gap-3 text-xs text-neutral-400 mt-2">
                <span
                  className="flex items-center gap-1 cursor-help"
                  title={`Derived Reputation Formula: 10 + (${profile.answerCount || 0} answers × 5) + (${profile.questionCount || 0} questions × 2)`}
                >
                  <Award className="w-3.5 h-3.5 text-neutral-500" />
                  <strong className="text-neutral-900 dark:text-white font-semibold tabular-nums">
                    {derivedReputation}
                  </strong> reputation
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  Joined {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start">
            {isOwner ? (
              <Link
                to="/settings"
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </Link>
            ) : currentUser ? (
              <>
                <button
                  onClick={handleToggleFollow}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isFollowing
                      ? 'border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                      : 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Following
                    </>
                  ) : (
                    'Follow'
                  )}
                </button>

                {/* More options menu */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                    aria-label="User actions"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {menuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-44 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 text-xs z-30"
                      onClick={() => setMenuOpen(false)}
                    >
                      <button
                        onClick={() => setShareModalOpen(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left text-neutral-700 dark:text-neutral-300"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Share Profile
                      </button>
                      <button
                        onClick={handleToggleMute}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left text-neutral-700 dark:text-neutral-300"
                      >
                        {isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                        {isMuted ? 'Unmute User' : 'Mute User'}
                      </button>
                      <button
                        onClick={handleToggleBlock}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left text-neutral-700 dark:text-neutral-300"
                      >
                        {isBlocked ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                        {isBlocked ? 'Unblock User' : 'Block User'}
                      </button>
                      <button
                        onClick={() => setReportModalOpen(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-left text-red-600 dark:text-red-400"
                      >
                        <Flag className="w-3.5 h-3.5" /> Report Member
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : null}

            {/* Share profile button for everyone */}
            <button
              onClick={() => setShareModalOpen(true)}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
              aria-label="Share Profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line pt-2">
            {profile.bio}
          </p>
        )}

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <span>
            <strong className="text-neutral-900 dark:text-white tabular-nums">{profile.questionCount}</strong> questions
          </span>
          <span>
            <strong className="text-neutral-900 dark:text-white tabular-nums">{profile.answerCount}</strong> answers
          </span>
          <button
            type="button"
            onClick={openFollowersModal}
            className="hover:underline cursor-pointer"
          >
            <strong className="text-neutral-900 dark:text-white tabular-nums">{profile.followersCount}</strong> followers
          </button>
          <button
            type="button"
            onClick={openFollowingModal}
            className="hover:underline cursor-pointer"
          >
            <strong className="text-neutral-900 dark:text-white tabular-nums">{profile.followingCount}</strong> following
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 text-xs">
        <button
          onClick={() => setActiveTab('questions')}
          className={`pb-2.5 px-2 font-semibold transition-colors border-b-2 -mb-[2px] cursor-pointer ${
            activeTab === 'questions'
              ? 'border-neutral-950 dark:border-white text-neutral-950 dark:text-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Questions ({questions.length})
        </button>

        <button
          onClick={() => setActiveTab('answers')}
          className={`pb-2.5 px-2 font-semibold transition-colors border-b-2 -mb-[2px] cursor-pointer ${
            activeTab === 'answers'
              ? 'border-neutral-950 dark:border-white text-neutral-950 dark:text-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Answers ({answers.length})
        </button>

        {isOwner && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-2.5 px-2 font-semibold transition-colors border-b-2 -mb-[2px] cursor-pointer ${
              activeTab === 'saved'
                ? 'border-neutral-950 dark:border-white text-neutral-950 dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Saved Items ({savedItems.length})
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'questions' && (
          questions.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2">
              <p className="text-xs text-neutral-500">No public questions posted yet.</p>
            </div>
          ) : (
            questions.map((q) => (
              <QuestionCard key={q.questionId} question={q} />
            ))
          )
        )}

        {activeTab === 'answers' && (
          answers.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2">
              <p className="text-xs text-neutral-500">No public answers contributed yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {answers.map((ans) => (
                <div
                  key={ans.answerId}
                  className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2.5 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span className="flex items-center gap-1.5">
                      <strong className="text-neutral-900 dark:text-white font-semibold">
                        {ans.voteCount}
                      </strong>{' '}
                      votes
                      {ans.helpfulCount > 0 && (
                        <span className="ml-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          · {ans.helpfulCount} helpful
                        </span>
                      )}
                    </span>
                    <span>{new Date(ans.createdAt).toLocaleDateString()}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 line-clamp-3 leading-relaxed">
                    {ans.body}
                  </p>

                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <Link
                      to={`/question/${ans.questionId}`}
                      className="text-xs font-semibold text-neutral-900 dark:text-white hover:underline inline-flex items-center gap-1"
                    >
                      View Full Discussion <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'saved' && (
          savedItems.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2">
              <p className="text-xs text-neutral-500">Questions you bookmark will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center justify-between"
                >
                  <Link
                    to={`/question/${item.questionId}`}
                    className="text-xs font-semibold text-neutral-900 dark:text-white hover:underline truncate"
                  >
                    {item.title}
                  </Link>
                  <span className="text-[11px] text-neutral-400 shrink-0 ml-3">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Followers Modal */}
      {followersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-950 dark:text-white">Followers</h3>
              <button onClick={() => setFollowersModalOpen(false)} className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            {socialLoading ? (
              <p className="text-xs text-neutral-500 py-4 text-center">Loading followers...</p>
            ) : followersList.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4 text-center">No followers yet.</p>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {followersList.map((f) => (
                  <Link
                    key={f.uid}
                    to={`/user/${f.username}`}
                    onClick={() => setFollowersModalOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    {f.photoUrl ? (
                      <img src={f.photoUrl} alt={f.displayName} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold">
                        {f.displayName[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="truncate">
                      <p className="text-xs font-semibold text-neutral-950 dark:text-white truncate">{f.displayName}</p>
                      <p className="text-[11px] text-neutral-500 truncate">@{f.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Following Modal */}
      {followingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-950 dark:text-white">Following</h3>
              <button onClick={() => setFollowingModalOpen(false)} className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            {socialLoading ? (
              <p className="text-xs text-neutral-500 py-4 text-center">Loading following...</p>
            ) : followingList.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4 text-center">Not following anyone yet.</p>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {followingList.map((f) => (
                  <Link
                    key={f.uid}
                    to={`/user/${f.username}`}
                    onClick={() => setFollowingModalOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    {f.photoUrl ? (
                      <img src={f.photoUrl} alt={f.displayName} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold">
                        {f.displayName[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="truncate">
                      <p className="text-xs font-semibold text-neutral-950 dark:text-white truncate">{f.displayName}</p>
                      <p className="text-[11px] text-neutral-500 truncate">@{f.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={`Profile: ${profile.displayName}`}
        url={window.location.href}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="user"
        targetId={profile.uid}
      />

    </div>
  );
};

