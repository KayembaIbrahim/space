// ============================================
// Badge Types
// ============================================
export type BadgeType = 'blue' | 'grey' | 'gold' | 'blue_org';

export interface BadgeInfo {
  type: BadgeType;
  label?: string;
  issuedBy?: string;
  issuedAt?: string;
  expiresAt?: string;
  metadata?: {
    company_id?: string;
    company_name?: string;
    [key: string]: unknown;
  };
}

// ============================================
// Profile
// ============================================
export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  cover_url: string | null;
  website: string;
  location: string;
  role: 'user' | 'admin' | 'moderator';
  verified: boolean; // legacy compat — maps to badge_type != null
  badge_type: BadgeType | null;
  badge_label: string | null;
  badge_issued_by: string | null;
  badge_issued_at: string | null;
  badge_expires_at: string | null;
  badge_metadata: Record<string, unknown> | null;
  is_banned: boolean;
  ban_reason: string | null;
  follower_count: number;
  following_count: number;
  post_count: number;
  voice_comment_count: number;
  admin_portal_activated: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// Post
// ============================================
export interface Post {
  id: string;
  user_id: string;
  content: string | null;
  media_urls: string[];
  media_type: 'image' | 'video' | 'none' | null;
  post_type: 'text' | 'poll' | 'voice' | 'shared';
  poll_options: PollOption[] | null;
  poll_ends_at: string | null;
  like_count: number;
  repost_count: number;
  comment_count: number;
  voice_comment_count: number;
  bookmark_count: number;
  is_pinned: boolean;
  is_flagged: boolean;
  flag_reason: string | null;
  repost_of: string | null;
  created_at: string;
  updated_at: string;
  user?: Profile;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  repost_of_post?: Post;
}

export interface PollOption {
  text: string;
  votes: number;
}

// ============================================
// Voice Comment
// ============================================
export interface VoiceComment {
  id: string;
  user_id: string;
  post_id: string;
  parent_id: string | null;
  audio_url: string;
  duration: number;
  transcript: string | null;
  waveform_data: number[] | null;
  like_count: number;
  reply_count: number;
  is_flagged: boolean;
  created_at: string;
  user?: Profile;
  is_liked?: boolean;
}

// ============================================
// Comment
// ============================================
export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  parent_id: string | null;
  content: string;
  like_count: number;
  created_at: string;
  user?: Profile;
  is_liked?: boolean;
}

// ============================================
// Notification
// ============================================
export interface Notification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: 'like' | 'follow' | 'comment' | 'voice_comment' | 'mention' | 'repost' | 'admin' | 'badge';
  post_id: string | null;
  voice_comment_id: string | null;
  content: string | null;
  is_read: boolean;
  created_at: string;
  actor?: Profile;
  post?: Post;
}

// ============================================
// Report
// ============================================
export interface Report {
  id: string;
  reporter_id: string;
  post_id: string | null;
  voice_comment_id: string | null;
  reason: string;
  details: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewed_by: string | null;
  created_at: string;
  resolved_at: string | null;
  reporter?: Profile;
  post?: Post;
  voice_comment?: VoiceComment;
}

// ============================================
// Admin Log
// ============================================
export interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  admin?: Profile;
}

// ============================================
// Platform Setting
// ============================================
export interface PlatformSetting {
  key: string;
  value: unknown;
  updated_by: string | null;
  updated_at: string;
}

// ============================================
// Feed Post
// ============================================
export interface FeedPost extends Post {
  user: Profile;
}

// ============================================
// Badge Request
// ============================================
export interface BadgeRequest {
  id: string;
  user_id: string;
  requested_type: BadgeType;
  display_label: string | null;
  evidence_url: string | null;
  evidence_text: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  reviewed_by: string | null;
  review_notes: string | null;
  created_at: string;
  resolved_at: string | null;
  user?: Profile;
  reviewer?: Profile;
}

// ============================================
// Company
// ============================================
export interface Company {
  id: string;
  profile_id: string;
  company_name: string;
  industry: string;
  website: string;
  logo_url: string;
  is_verified: boolean;
  max_associates: number;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

// ============================================
// Company Associate
// ============================================
export interface CompanyAssociate {
  id: string;
  company_id: string;
  user_id: string;
  role: 'member' | 'admin' | 'executive';
  title: string;
  is_active: boolean;
  added_by: string | null;
  created_at: string;
  user?: Profile;
  company?: Company;
}

// ============================================
// Badge Subscription
// ============================================
export interface BadgeSubscription {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  status: 'active' | 'expired' | 'cancelled';
  amount_paid: number;
  currency: string;
  payment_method: string;
  payment_reference: string | null;
  starts_at: string;
  expires_at: string | null;
  auto_renew: boolean;
  created_at: string;
}
