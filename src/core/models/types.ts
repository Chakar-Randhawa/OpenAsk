export interface UserProfile {
  uid: string;
  displayName: string;
  username: string;
  bio?: string;
  photoUrl?: string;
  followersCount: number;
  followingCount: number;
  questionCount: number;
  answerCount: number;
  reputation: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPrivate {
  email: string;
  defaultAnonymous?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  themePreference?: 'system' | 'light' | 'dark';
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  followerCount: number;
  questionCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface Question {
  questionId: string;
  title: string;
  body: string;
  categoryId: string;
  categoryName: string;
  tagIds: string[];
  isAnonymous: boolean;
  authorUid?: string;
  authorDisplayName?: string;
  authorUsername?: string;
  authorPhotoUrl?: string;
  answerCount: number;
  viewCount: number;
  voteCount: number;
  followerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOwner {
  questionId: string;
  ownerUid: string;
  createdAt: string;
}

export interface Answer {
  answerId: string;
  questionId: string;
  body: string;
  isAnonymous: boolean;
  authorUid?: string;
  authorDisplayName?: string;
  authorUsername?: string;
  authorPhotoUrl?: string;
  voteCount: number;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnswerOwner {
  answerId: string;
  questionId: string;
  ownerUid: string;
  createdAt: string;
}

export interface Vote {
  id: string; // `${userId}_${answerId}`
  userId: string;
  answerId: string;
  questionId: string;
  value: 1 | -1;
  createdAt: string;
}

export interface HelpfulVote {
  id: string; // `${userId}_${answerId}`
  userId: string;
  answerId: string;
  questionId: string;
  createdAt: string;
}

export interface Comment {
  commentId: string;
  targetType: 'question' | 'answer';
  targetId: string;
  body: string;
  isAnonymous: boolean;
  authorUid?: string;
  authorDisplayName?: string;
  authorUsername?: string;
  createdAt: string;
}

export interface Follow {
  id: string; // `${followerUid}_${targetUid}`
  followerUid: string;
  targetUid: string;
  createdAt: string;
}

export interface CategoryFollow {
  id: string; // `${userId}_${categorySlug}`
  userId: string;
  categorySlug: string;
  createdAt: string;
}

export interface QuestionFollow {
  id: string; // `${userId}_${questionId}`
  userId: string;
  questionId: string;
  createdAt: string;
}

export interface SavedItem {
  id: string; // `${userId}_${itemId}`
  userId: string;
  itemType: 'question' | 'answer';
  itemId: string;
  questionId: string;
  title: string;
  createdAt: string;
}

export interface NotificationItem {
  notificationId: string;
  recipientUid: string;
  senderUid?: string;
  senderName?: string;
  type: 'answer' | 'comment' | 'helpful' | 'vote' | 'follow' | 'system';
  title: string;
  body: string;
  targetId?: string;
  targetType?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ReportItem {
  reportId: string;
  reporterUid: string;
  targetType: 'question' | 'answer' | 'user' | 'comment';
  targetId: string;
  reason: string;
  details: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  createdAt: string;
}

export interface BlockItem {
  id: string;
  userId: string;
  blockedUid: string;
  createdAt: string;
}

export interface MuteItem {
  id: string;
  userId: string;
  mutedUid: string;
  createdAt: string;
}
