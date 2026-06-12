'use client';

import { useState, useEffect } from 'react';
import { Bookmark, Loader2 } from 'lucide-react';
import PostCard from '@/components/feed/PostCard';
import type { Post, Profile } from '@/types';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<(Post & { user: Profile })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await fetch('/api/bookmarks?userId=current-user');
      const data = await res.json();
      setBookmarks(data.bookmarks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="sticky top-14 md:top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-color)] px-4 py-3">
        <h1 className="text-xl font-bold">Bookmarks</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-16 px-8">
          <Bookmark size={48} className="mx-auto text-[var(--text-tertiary)] mb-4" />
          <h3 className="text-lg font-bold mb-2">Save posts for later</h3>
          <p className="text-sm text-[var(--text-tertiary)]">
            Bookmark posts to easily find them again in the future.
          </p>
        </div>
      ) : (
        bookmarks.map((post) => (
          <PostCard key={post.id} post={post} />
        ))
      )}
    </div>
  );
}
