'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import CreatePost from '@/components/feed/CreatePost';
import PostCard from '@/components/feed/PostCard';
import type { Post, Profile } from '@/types';

type FeedMode = 'algorithmic' | 'chronological';

export default function FeedPage() {
  const [posts, setPosts] = useState<(Post & { user: Profile })[]>([]);
  const [feedMode, setFeedMode] = useState<FeedMode>('algorithmic');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  useEffect(() => {
    fetchPosts();
  }, [feedMode]);

  const fetchPosts = async (reset = true) => {
    if (reset) {
      setLoading(true);
      setPage(0);
    } else {
      setLoadingMore(true);
    }

    try {
      const offset = reset ? 0 : page * limit;
      const res = await fetch(`/api/posts?mode=${feedMode}&limit=${limit}&offset=${offset}`);
      const data = await res.json();

      if (reset) {
        setPosts(data.posts || []);
      } else {
        setPosts((prev) => [...prev, ...(data.posts || [])]);
      }
      setHasMore((data.posts || []).length === limit);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setPage((p) => p + 1);
      fetchPosts(false);
    }
  };

  const handleNewPost = () => {
    fetchPosts();
  };

  return (
    <div>
      {/* Header */}
      <div className="sticky top-14 md:top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">Home</h1>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-secondary)]">
            <button
              onClick={() => setFeedMode('algorithmic')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                feedMode === 'algorithmic'
                  ? 'gradient-bg text-white'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              )}
            >
              <Sparkles size={14} />
              For You
            </button>
            <button
              onClick={() => setFeedMode('chronological')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                feedMode === 'chronological'
                  ? 'gradient-bg text-white'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              )}
            >
              <Clock size={14} />
              Latest
            </button>
          </div>
        </div>
      </div>

      {/* Create Post */}
      <CreatePost onPost={handleNewPost} />

      {/* Posts Feed */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 px-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center">
            <Sparkles size={32} className="text-white" />
          </div>
          <h3 className="text-lg font-bold mb-2">Welcome to Space</h3>
          <p className="text-sm text-[var(--text-tertiary)]">
            Your feed is empty. Follow people and start posting to see activity here.
          </p>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => {}}
              onRepost={() => {}}
              onBookmark={() => {}}
            />
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full py-4 text-sm text-[var(--accent)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              {loadingMore ? (
                <Loader2 size={20} className="animate-spin mx-auto" />
              ) : (
                'Load more'
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
