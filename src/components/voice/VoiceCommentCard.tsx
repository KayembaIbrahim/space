'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Heart, MoreHorizontal, Trash2, Flag } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import { cn, formatDuration, formatDate } from '@/lib/utils';
import type { VoiceComment } from '@/types';
import { useAuthStore } from '@/stores';
import Link from 'next/link';

interface VoiceCommentCardProps {
  comment: VoiceComment;
  onDelete?: () => void;
}

export default function VoiceCommentCard({ comment, onDelete }: VoiceCommentCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(comment.is_liked || false);
  const [likeCount, setLikeCount] = useState(comment.like_count);
  const [showMenu, setShowMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!waveformRef.current) return;

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'rgba(163, 163, 163, 0.3)',
      progressColor: '#FF8C00',
      cursorColor: '#FFD700',
      barWidth: 2,
      barRadius: 2,
      barGap: 1,
      height: 48,
      normalize: true,
    });

    ws.load(comment.audio_url);

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => setIsPlaying(false));
    ws.on('audioprocess', () => setCurrentTime(ws.getCurrentTime()));
    ws.on('seeking', () => setCurrentTime(ws.getCurrentTime()));

    wavesurferRef.current = ws;

    return () => ws.destroy();
  }, [comment.audio_url]);

  const togglePlay = useCallback(() => {
    wavesurferRef.current?.playPause();
  }, []);

  const handleLike = async () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    try {
      await fetch('/api/voice', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId: comment.id, action: liked ? 'unlike' : 'like' }),
      });
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this voice reply?')) return;
    try {
      await fetch(`/api/voice?id=${comment.id}`, { method: 'DELETE' });
      onDelete?.();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent)]/30 transition-all">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Link href={`/profile/${comment.user_id}`}>
          <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold shrink-0">
            {comment.user?.avatar_url ? (
              <img src={comment.user.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
            ) : (
              comment.user?.display_name?.charAt(0) || 'U'
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/profile/${comment.user_id}`} className="text-sm font-semibold text-[var(--text-primary)] hover:underline">
              {comment.user?.display_name}
            </Link>
            <span className="text-xs text-[var(--text-tertiary)]">
              {formatDate(comment.created_at)}
            </span>
          </div>

          {/* Waveform Player */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
            >
              {isPlaying ? (
                <Pause size={14} className="text-white" />
              ) : (
                <Play size={14} className="text-white ml-0.5" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div ref={waveformRef} className="w-full" />
            </div>

            <span className="text-xs font-mono text-[var(--text-tertiary)] shrink-0">
              {formatDuration(currentTime)} / {formatDuration(comment.duration)}
            </span>
          </div>

          {/* Transcript */}
          {comment.transcript && (
            <p className="mt-2 text-xs text-[var(--text-secondary)] italic">
              &quot;{comment.transcript}&quot;
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleLike}
              className={cn(
                'flex items-center gap-1 text-xs transition-colors',
                liked ? 'text-red-500' : 'text-[var(--text-tertiary)] hover:text-red-500'
              )}
            >
              <Heart size={14} className={liked ? 'fill-current' : ''} />
              {likeCount}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              >
                <MoreHorizontal size={14} />
              </button>

              {showMenu && (
                <div className="absolute left-0 bottom-6 w-36 glass-card shadow-xl z-10 overflow-hidden">
                  {user?.id === comment.user_id ? (
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  ) : (
                    <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-500/10">
                      <Flag size={12} />
                      Report
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
