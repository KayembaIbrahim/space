'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { PollOption } from '@/types';

interface PollDisplayProps {
  options: PollOption[];
  postId: string;
  endsAt: string | null;
}

export default function PollDisplay({ options, postId, endsAt }: PollDisplayProps) {
  const [voted, setVoted] = useState<number | null>(null);
  const [localOptions, setLocalOptions] = useState(options);
  const totalVotes = localOptions.reduce((sum, o) => sum + o.votes, 0);
  const isExpired = endsAt ? new Date(endsAt) < new Date() : false;

  const handleVote = async (index: number) => {
    if (voted !== null || isExpired) return;

    try {
      const res = await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, optionIndex: index }),
      });

      if (res.ok) {
        setVoted(index);
        setLocalOptions((prev) =>
          prev.map((o, i) => (i === index ? { ...o, votes: o.votes + 1 } : o))
        );
      }
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      {localOptions.map((option, i) => {
        const pct = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
        const isSelected = voted === i;

        return (
          <button
            key={i}
            onClick={() => handleVote(i)}
            disabled={voted !== null || isExpired}
            className={cn(
              'relative w-full rounded-xl border overflow-hidden transition-all text-left',
              voted !== null || isExpired
                ? 'cursor-default'
                : 'cursor-pointer hover:border-[var(--accent)]',
              isSelected
                ? 'border-[var(--accent)]'
                : 'border-[var(--border-color)]'
            )}
          >
            {/* Progress bar */}
            {(voted !== null || isExpired) && (
              <div
                className={cn(
                  'absolute inset-0 transition-all duration-500',
                  isSelected ? 'bg-[var(--accent)]/20' : 'bg-[var(--bg-secondary)]'
                )}
                style={{ width: `${pct}%` }}
              />
            )}

            <div className="relative flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                {voted !== null && (
                  <span className={cn(
                    'text-sm font-bold',
                    isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
                  )}>
                    {isSelected && '✓ '}
                  </span>
                )}
                <span className="text-sm font-medium">{option.text}</span>
              </div>
              {(voted !== null || isExpired) && (
                <span className={cn(
                  'text-sm font-bold',
                  isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
                )}>
                  {pct.toFixed(0)}%
                </span>
              )}
            </div>
          </button>
        );
      })}

      <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)] pt-1">
        <span>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
        {endsAt && (
          <span>{isExpired ? 'Ended' : `Ends ${new Date(endsAt).toLocaleDateString()}`}</span>
        )}
      </div>
    </div>
  );
}
