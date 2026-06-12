'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Heart, MessageCircle, Repeat2, Bookmark, MoreHorizontal,
  Volume2, Share2
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { Post, Profile } from '@/types';
import { useAuthStore } from '@/stores';
import VoiceCommentSection from '@/components/voice/VoiceCommentSection';
import PollDisplay from './PollDisplay';
import PostMenu from './PostMenu';
import BadgeIcon from '@/components/ui/BadgeIcon';

interface PostCardProps {
  post: Post & { user: Profile };
  onLike?: (postId: string) => void;
  onRepost?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
}

export default function PostCard({ post, onLike, onRepost, onBookmark }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [bookmarked, setBookmarked] = useState(post.is_bookmarked || false);
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(post.repost_count);
  const { user } = useAuthStore();

  const handleLike = async () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    onLike?.(post.id);
  };

  const handleBookmark = async () => {
    setBookmarked(!bookmarked);
    onBookmark?.(post.id);
  };

  const handleRepost = async () => {
    setReposted(!reposted);
    setRepostCount(reposted ? repostCount - 1 : repostCount + 1);
    onRepost?.(post.id);
  };

  const isPoll = post.post_type === 'poll' && post.poll_options;

  return (
    <article className="border-b border-[var(--border-color)] animate-fade-in">
      {/* Repost indicator */}
      {post.repost_of && (
        <div className="flex items-center gap-2 px-4 pt-3 text-xs text-[var(--text-tertiary)]">
          <Repeat2 size={14} />
          <span>You reposted</span>
        </div>
      )}

      <div className="p-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <Link href={`/profile/${post.user_id}`} className="shrink-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                {post.user?.avatar_url ? (
                  <img src={post.user.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  post.user?.display_name?.charAt(0) || 'U'
                )}
              </div>
              {/* Badge overlay on avatar */}
              {post.user?.badge_type && (
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[var(--bg-primary)] flex items-center justify-center"
                  style={{ backgroundColor: getBadgeColor(post.user.badge_type) }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" fill="white" />
                  </svg>
                </div>
              )}
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                <Link
                  href={`/profile/${post.user_id}`}
                  className="font-semibold text-sm text-[var(--text-primary)] hover:underline truncate"
                >
                  {post.user?.display_name}
                </Link>
                <BadgeIcon badgeType={post.user?.badge_type} size="xs" />
                <span className="text-sm text-[var(--text-tertiary)] truncate">
                  @{post.user?.username}
                </span>
                <span className="text-[var(--text-tertiary)] hidden sm:inline">·</span>
                <span className="text-sm text-[var(--text-tertiary)] hidden sm:inline">
                  {formatDate(post.created_at)}
                </span>
              </div>
              <PostMenu postId={post.id} isOwner={user?.id === post.user_id} />
            </div>

            {/* Content */}
            {post.content && (
              <p className="mt-2 text-[var(--text-primary)] whitespace-pre-wrap break-words">
                {post.content}
              </p>
            )}

            {/* Media */}
            {post.media_urls && post.media_urls.length > 0 && (
              <div className={cn(
                'mt-3 rounded-xl overflow-hidden',
                post.media_urls.length > 1 && 'grid grid-cols-2 gap-1'
              )}>
                {post.media_urls.map((url, i) => (
                  <div key={i} className="aspect-video bg-[var(--bg-secondary)] rounded-xl overflow-hidden">
                    {post.media_type === 'video' ? (
                      <video src={url} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Poll */}
            {isPoll && (
              <PollDisplay
                options={post.poll_options!}
                postId={post.id}
                endsAt={post.poll_ends_at}
              />
            )}

            {/* Voice Comment Indicator */}
            {post.voice_comment_count > 0 && (
              <div className="mt-3 flex items-center gap-2 text-sm text-[var(--accent)]">
                <Volume2 size={16} />
                <span>{post.voice_comment_count} voice {post.voice_comment_count === 1 ? 'reply' : 'replies'}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-3 -ml-2">
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all text-sm group"
              >
                <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                <span>{post.comment_count}</span>
              </button>

              <button
                onClick={handleRepost}
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all text-sm group',
                  reposted ? 'text-green-500' : 'text-[var(--text-tertiary)] hover:text-green-500 hover:bg-green-500/10'
                )}
              >
                <Repeat2 size={18} className="group-hover:scale-110 transition-transform" />
                <span>{repostCount}</span>
              </button>

              <button
                onClick={handleLike}
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all text-sm group',
                  liked ? 'text-red-500' : 'text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-500/10'
                )}
              >
                <Heart size={18} className={cn('group-hover:scale-110 transition-transform', liked && 'fill-current')} />
                <span>{likeCount}</span>
              </button>

              <button
                onClick={handleBookmark}
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all text-sm group',
                  bookmarked ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10'
                )}
              >
                <Bookmark size={18} className={cn('group-hover:scale-110 transition-transform', bookmarked && 'fill-current')} />
                <span>{post.bookmark_count}</span>
              </button>

              <button className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all text-sm group">
                <Share2 size={18} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Comments Section */}
      {showComments && (
        <VoiceCommentSection postId={post.id} />
      )}
    </article>
  );
}

function getBadgeColor(type: string): string {
  switch (type) {
    case 'blue': return '#1DA1F2';
    case 'grey': return '#6B7280';
    case 'gold': return '#EAB308';
    case 'blue_org': return '#1DA1F2';
    default: return '#1DA1F2';
  }
}
