'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Image, BarChart3, Mic, X, Globe, ChevronDown, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores';

interface CreatePostProps {
  onPost?: (content: string, type: string, media?: File[]) => void;
}

export default function CreatePost({ onPost }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'text' | 'poll' | 'voice'>('text');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [showPoll, setShowPoll] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuthStore();

  const handleSubmit = useCallback(async () => {
    if (!content.trim() && postType === 'text') return;
    if (postType === 'poll' && pollOptions.filter(o => o.trim()).length < 2) return;

    setIsPosting(true);
    try {
      const payload: Record<string, unknown> = {
        content: content.trim(),
        post_type: postType,
      };

      if (postType === 'poll') {
        payload.poll_options = pollOptions.filter(o => o.trim()).map(text => ({ text, votes: 0 }));
        payload.poll_ends_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setContent('');
        setPostType('text');
        setPollOptions(['', '']);
        setShowPoll(false);
        onPost?.(content, postType);
      }
    } catch (err) {
      console.error('Failed to post:', err);
    } finally {
      setIsPosting(false);
    }
  }, [content, postType, pollOptions, onPost]);

  const addPollOption = () => {
    if (pollOptions.length < 6) setPollOptions([...pollOptions, '']);
  };

  const updatePollOption = (index: number, value: string) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  };

  return (
    <div className={cn(
      'p-4 border-b border-[var(--border-color)] transition-all',
      isFocused && 'bg-[var(--bg-secondary)]/50'
    )}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm shrink-0">
          {user?.display_name?.charAt(0) || 'U'}
        </div>

        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => !content && setIsFocused(false)}
            placeholder="What's happening in Space?"
            className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none outline-none text-lg min-h-[60px]"
            rows={isFocused ? 3 : 1}
          />

          {/* Poll Creator */}
          {showPoll && postType === 'poll' && (
            <div className="mt-3 space-y-2 animate-slide-up">
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={opt}
                    onChange={(e) => updatePollOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="input-field text-sm"
                  />
                  {i >= 2 && (
                    <button
                      onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))}
                      className="p-2 text-[var(--text-tertiary)] hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 6 && (
                <button
                  onClick={addPollOption}
                  className="text-sm text-[var(--accent)] hover:underline"
                >
                  + Add option
                </button>
              )}
            </div>
          )}

          {/* Action Bar */}
          <div className={cn(
            'flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-color)]',
            !isFocused && !content && 'border-t-0 pt-0 mt-0'
          )}>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setShowPoll(!showPoll); setPostType(showPoll ? 'text' : 'poll'); }}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  showPoll ? 'text-[var(--accent)] bg-[var(--accent)]/10' : 'text-[var(--accent)] hover:bg-[var(--accent)]/10'
                )}
              >
                <BarChart3 size={20} />
              </button>
              <button className="p-2 rounded-lg text-[var(--accent)] hover:bg-[var(--accent)]/10">
                <Image size={20} />
              </button>
              <button className="p-2 rounded-lg text-[var(--accent)] hover:bg-[var(--accent)]/10">
                <Mic size={20} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
                <Globe size={14} />
                Everyone
                <ChevronDown size={12} />
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPosting || (!content.trim() && postType !== 'poll')}
                className={cn(
                  'btn-primary text-sm px-4 py-1.5',
                  (!content.trim() && postType !== 'poll') && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isPosting ? <Loader2 size={16} className="animate-spin" /> : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
