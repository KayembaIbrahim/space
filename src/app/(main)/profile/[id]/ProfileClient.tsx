'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Calendar, MapPin, LinkIcon, Settings, UserPlus, UserMinus,
  Loader2, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import PostCard from '@/components/feed/PostCard';
import BadgeIcon, { BadgePill, BadgeAvatar } from '@/components/ui/BadgeIcon';
import type { Profile, Post } from '@/types';

export default function ProfileClient() {
  const params = useParams();
  const userId = params.id as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<(Post & { user: Profile })[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'voice' | 'likes'>('posts');

  useEffect(() => {
    if (userId) { fetchProfile(); fetchPosts(); }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/profile?id=${userId}`);
      const data = await res.json();
      setProfile(data.profile);
      setIsFollowing(data.isFollowing);
    } catch {} finally { setLoading(false); }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(`/api/posts?userId=${userId}&limit=50`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {}
  };

  const handleFollow = async () => {
    if (!profile) return;
    try {
      await fetch('/api/follow', {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: 'current-user-id', followingId: profile.id }),
      });
      setIsFollowing(!isFollowing);
      setProfile((prev) => prev ? { ...prev, follower_count: isFollowing ? prev.follower_count - 1 : prev.follower_count + 1 } : prev);
    } catch {}
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-[var(--accent)]" /></div>;

  if (!profile) return (
    <div className="text-center py-16 px-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center text-white text-2xl font-bold">?</div>
      <h3 className="text-lg font-bold mb-2">Profile not found</h3>
      <Link href="/feed" className="btn-primary inline-flex">Back to Feed</Link>
    </div>
  );

  return (
    <div>
      <div className="sticky top-14 md:top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link href="/feed" className="p-1 hover:bg-[var(--bg-secondary)] rounded-lg"><ArrowLeft size={20} /></Link>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold">{profile.display_name}</h1>
              <BadgeIcon badgeType={profile.badge_type} size="md" />
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">{profile.post_count} posts</p>
          </div>
        </div>
      </div>

      <div className="h-32 md:h-40 relative">
        {profile.cover_url ? <img src={profile.cover_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full gradient-bg opacity-30" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
      </div>

      <div className="px-4 -mt-12 relative z-10">
        <div className="flex items-end justify-between mb-4">
          <BadgeAvatar user={profile} size={80} />
          <div className="flex gap-2">
            {userId !== 'me' ? (
              <button onClick={handleFollow} className={isFollowing ? 'btn-secondary text-sm' : 'btn-primary text-sm'}>
                {isFollowing ? <><UserMinus size={14} className="inline mr-1" />Following</> : <><UserPlus size={14} className="inline mr-1" />Follow</>}
              </button>
            ) : <Link href="/settings" className="btn-secondary text-sm"><Settings size={14} className="inline mr-1" />Edit profile</Link>}
          </div>
        </div>
        <div className="flex items-center gap-2"><h2 className="text-xl font-bold">{profile.display_name}</h2><BadgeIcon badgeType={profile.badge_type} size="md" /></div>
        <p className="text-sm text-[var(--text-tertiary)]">@{profile.username}</p>
        {profile.badge_type && <div className="mt-2"><BadgePill badgeType={profile.badge_type} label={profile.badge_type === 'blue_org' ? `Associate · ${profile.badge_label || 'Company'}` : profile.badge_label || undefined} /></div>}
        {profile.bio && <p className="mt-2 text-[var(--text-primary)]">{profile.bio}</p>}
        <div className="flex items-center gap-4 mt-3 text-sm text-[var(--text-tertiary)]">
          {profile.location && <span className="flex items-center gap-1"><MapPin size={14} />{profile.location}</span>}
          {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[var(--accent)] hover:underline"><LinkIcon size={14} />{profile.website.replace(/https?:\/\//, '')}</a>}
          <span className="flex items-center gap-1"><Calendar size={14} />Joined {formatDate(profile.created_at)}</span>
        </div>
        <div className="flex gap-4 mt-3 text-sm">
          <span><strong className="text-[var(--text-primary)]">{profile.following_count}</strong> <span className="text-[var(--text-tertiary)]">following</span></span>
          <span><strong className="text-[var(--text-primary)]">{profile.follower_count}</strong> <span className="text-[var(--text-tertiary)]">followers</span></span>
        </div>
      </div>

      <div className="flex border-b border-[var(--border-color)] mt-4">
        {(['posts', 'voice', 'likes'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}>{tab}</button>
        ))}
      </div>

      <div>
        {posts.length === 0 ? <p className="text-center text-[var(--text-tertiary)] py-12">No posts yet</p> : posts.map((post) => <PostCard key={post.id} post={post} />)}
      </div>
    </div>
  );
}
