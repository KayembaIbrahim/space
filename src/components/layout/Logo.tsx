'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 36, text: 'text-xl' },
    lg: { icon: 48, text: 'text-2xl' },
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'rounded-xl gradient-bg flex items-center justify-center animate-pulse-glow',
          size === 'sm' && 'w-8 h-8',
          size === 'md' && 'w-10 h-10',
          size === 'lg' && 'w-14 h-14'
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="text-white"
          width={sizes[size].icon * 0.55}
          height={sizes[size].icon * 0.55}
        >
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="18" cy="6" r="2" fill="#FFD700" />
          <path d="M14 14l-2 4M10 14l2 4" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      {showText && (
        <span className={cn('font-bold gradient-text', sizes[size].text)}>
          Space
        </span>
      )}
    </div>
  );
}
