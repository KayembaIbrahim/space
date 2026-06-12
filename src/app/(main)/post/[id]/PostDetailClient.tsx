'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import PostCard from '@/components/feed/PostCard';
import VoiceCommentSection from '@/components/voice/VoiceCommentSection';
import type { Post, Profile } from '@/types';

export default function PostDetailClient() {
  const params = useParams();
  const postId = params.id as string;
  const [post, setPost] = useState<(Post & { user: Profile }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId) fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/detail?id=${postId}`);
      const data = await res.json();
      setPost(data.post);
    } catch {
      // API not available in static export
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-16 px-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center text-white text-2xl font-bold">P</div>
        <h3 className="text-lg font-bold mb-2">Post not found</h3>
        <p className="text-sm text-[var(--text-tertiary)] mb-4">This post may have been removed or the link is invalid.</p>
        <Link href="/feed" className="btn-primary inline-flex">Back to Feed</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-14 md:top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-color)] px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/feed" className="hover:bg-[var(--bg-secondary)] p-1 rounded-lg">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold">Post</h1>
        </div>
      </div>

      <PostCard post={post} />

      <div className="border-b border-[var(--border-color)]">
        <VoiceCommentSection postId={postId} />
      </div>
    </div>
  );
}
