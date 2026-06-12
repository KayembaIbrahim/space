'use client';

import { useState } from 'react';
import { MoreHorizontal, Trash2, Flag, Pin, Copy } from 'lucide-react';
import { useClickOutside } from '@/hooks';
import { useRef } from 'react';
import { useAuthStore } from '@/stores';

interface PostMenuProps {
  postId: string;
  isOwner: boolean;
}

export default function PostMenu({ postId, isOwner }: PostMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/posts?id=${postId}`, { method: 'DELETE' });
    setOpen(false);
    window.location.reload();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all"
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-8 w-48 glass-card shadow-xl z-50 overflow-hidden animate-slide-up">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <Copy size={16} />
            Copy link
          </button>

          {isOwner ? (
            <>
              <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
                <Pin size={16} />
                Pin to profile
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={16} />
                Delete post
              </button>
            </>
          ) : (
            <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
              <Flag size={16} />
              Report post
            </button>
          )}
        </div>
      )}
    </div>
  );
}
