'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, Hash } from 'lucide-react';
import PostCard from '@/components/feed/PostCard';
import type { Post, Profile } from '@/types';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [trending, setTrending] = useState<(Post & { user: Profile })[]>([]);
  const [searchResults, setSearchResults] = useState<(Post & { user: Profile })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const res = await fetch('/api/posts?mode=algorithmic&limit=20');
      const data = await res.json();
      setTrending(data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?mode=algorithmic&limit=50&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const trendingTopics = [
    { tag: 'SpaceLaunch', count: '12.4K' },
    { tag: 'VoiceChat', count: '8.2K' },
    { tag: 'TechTalk', count: '5.1K' },
    { tag: 'MusicMonday', count: '3.8K' },
    { tag: 'ArtSpace', count: '2.9K' },
  ];

  return (
    <div>
      <div className="sticky top-14 md:top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold mb-3">Explore</h1>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search Space..."
              className="input-field pl-10"
            />
          </div>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="p-4 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={18} className="text-[var(--accent)]" />
          <h2 className="font-bold">Trending</h2>
        </div>
        <div className="space-y-3">
          {trendingTopics.map((topic) => (
            <div key={topic.tag} className="flex items-center justify-between hover:bg-[var(--bg-secondary)] p-2 rounded-lg cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <Hash size={16} className="text-[var(--accent)]" />
                <span className="font-medium text-sm">{topic.tag}</span>
              </div>
              <span className="text-xs text-[var(--text-tertiary)]">{topic.count} posts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Results / Trending Posts */}
      <div>
        {(searchResults.length > 0 ? searchResults : trending).map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
