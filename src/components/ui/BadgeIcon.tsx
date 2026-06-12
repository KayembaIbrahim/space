'use client';

import { cn } from '@/lib/utils';
import type { BadgeType, Profile } from '@/types';

// ============================================
// Badge color/style config
// ============================================
const BADGE_CONFIG: Record<BadgeType, {
  color: string;
  bg: string;
  border: string;
  label: string;
  icon: 'blue' | 'grey' | 'gold' | 'blue_org';
}> = {
  blue: {
    color: '#1DA1F2',
    bg: 'rgba(29, 161, 242, 0.15)',
    border: 'rgba(29, 161, 242, 0.3)',
    label: 'Verified',
    icon: 'blue',
  },
  grey: {
    color: '#6B7280',
    bg: 'rgba(107, 114, 128, 0.15)',
    border: 'rgba(107, 114, 128, 0.3)',
    label: 'Government',
    icon: 'grey',
  },
  gold: {
    color: '#EAB308',
    bg: 'rgba(234, 179, 8, 0.15)',
    border: 'rgba(234, 179, 8, 0.3)',
    label: 'Organization',
    icon: 'gold',
  },
  blue_org: {
    color: '#1DA1F2',
    bg: 'rgba(29, 161, 242, 0.15)',
    border: 'rgba(29, 161, 242, 0.3)',
    label: 'Associate',
    icon: 'blue_org',
  },
};

// ============================================
// SVG Badge Icons
// ============================================
function BadgeCheckSVG({ type, size }: { type: BadgeType; size: number }) {
  const config = BADGE_CONFIG[type];

  if (type === 'gold') {
    // Gold org badge: shield shape
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L3 6.5V12C3 17.25 6.75 22 12 23C17.25 22 21 17.25 21 12V6.5L12 2Z"
          fill={config.color}
          fillOpacity="0.2"
          stroke={config.color}
          strokeWidth="1.5"
        />
        <path
          d="M8 12.5L10.5 15L16 9.5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === 'grey') {
    // Grey gov badge: official seal
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill={config.color} fillOpacity="0.2" stroke={config.color} strokeWidth="1.5" />
        <path
          d="M12 6V18M8 8L12 6L16 8M8 16L12 18L16 16"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.5" />
      </svg>
    );
  }

  if (type === 'blue_org') {
    // Blue org associate: person with company link
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M9 12C10.6569 12 12 10.6569 12 9C12 7.34315 10.6569 6 9 6C7.34315 6 6 7.34315 6 9C6 10.6569 7.34315 12 9 12Z"
          fill={config.color}
          fillOpacity="0.3"
          stroke={config.color}
          strokeWidth="1.5"
        />
        <path
          d="M15 12C16.6569 12 18 10.6569 18 9C18 7.34315 16.6569 6 15 6C13.3431 6 12 7.34315 12 9C12 10.6569 13.3431 12 15 12Z"
          fill={config.color}
          fillOpacity="0.3"
          stroke={config.color}
          strokeWidth="1.5"
        />
        <path
          d="M3 20C3 17.2386 5.68629 15 9 15C12.3137 15 15 17.2386 15 20"
          stroke={config.color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M15 15C16.6569 15 18.1569 15.6716 19.2426 16.7574M15 15C15 16.3807 15.6193 17.6307 16.5858 18.5858M15 15C15 17.2091 16.1193 19.1213 17.7782 20.2426"
          stroke={config.color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="18" cy="19" r="3.5" fill={config.color} stroke="white" strokeWidth="1.5" />
        <path d="M17 19H19M18 18V20" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  // Default: Blue verified checkmark (like X/Twitter)
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.25 12C22.25 18.2125 17.9625 23 12 23C6.0375 23 1.75 18.2125 1.75 12C1.75 5.7875 6.0375 1 12 1C17.9625 1 22.25 5.7875 22.25 12Z"
        fill={config.color}
      />
      <path
        d="M8.5 12.5L10.5 14.5L15.5 9.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============================================
// BadgeIcon Component
// ============================================
interface BadgeIconProps {
  badgeType: BadgeType | null | undefined;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showTooltip?: boolean;
  className?: string;
}

const SIZE_MAP = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
};

export default function BadgeIcon({
  badgeType,
  size = 'sm',
  showLabel = false,
  showTooltip = true,
  className,
}: BadgeIconProps) {
  if (!badgeType) return null;

  const config = BADGE_CONFIG[badgeType];
  const px = SIZE_MAP[size];
  const tooltipText = badgeType === 'blue_org'
    ? `Verified via ${config.label}`
    : config.label;

  return (
    <span
      className={cn('inline-flex items-center gap-1 relative group', className)}
      title={showTooltip ? tooltipText : undefined}
    >
      <BadgeCheckSVG type={badgeType} size={px} />

      {showLabel && (
        <span
          className="text-xs font-medium"
          style={{ color: config.color }}
        >
          {tooltipText}
        </span>
      )}

      {/* Hover tooltip */}
      {showTooltip && !showLabel && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded-md text-xs font-medium text-white bg-gray-900 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {tooltipText}
        </span>
      )}
    </span>
  );
}

// ============================================
// Inline badge display (for name + badge)
// ============================================
interface BadgeNameProps {
  user: Profile;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BadgeName({ user, size = 'sm', className }: BadgeNameProps) {
  const config = user.badge_type ? BADGE_CONFIG[user.badge_type] : null;

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={cn(
        'font-semibold truncate',
        size === 'lg' && 'text-xl',
        size === 'md' && 'text-base',
        size === 'sm' && 'text-sm',
      )}>
        {user.display_name}
      </span>
      <BadgeIcon badgeType={user.badge_type} size={size === 'lg' ? 'md' : 'sm'} />
    </span>
  );
}

// ============================================
// Badge badge (pill-shaped label)
// ============================================
interface BadgePillProps {
  badgeType: BadgeType;
  label?: string;
  className?: string;
}

export function BadgePill({ badgeType, label, className }: BadgePillProps) {
  const config = BADGE_CONFIG[badgeType];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        className
      )}
      style={{
        color: config.color,
        backgroundColor: config.bg,
        borderColor: config.border,
      }}
    >
      <BadgeCheckSVG type={badgeType} size={12} />
      {label || config.label}
    </span>
  );
}

// ============================================
// Avatar with badge overlay
// ============================================
interface BadgeAvatarProps {
  user: Profile;
  size?: number;
  className?: string;
}

export function BadgeAvatar({ user, size = 40, className }: BadgeAvatarProps) {
  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div
        className="rounded-full gradient-bg flex items-center justify-center text-white font-bold overflow-hidden"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          user.display_name?.charAt(0) || 'U'
        )}
      </div>
      {user.badge_type && (
        <div
          className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 flex items-center justify-center"
          style={{
            borderColor: 'var(--bg-primary)',
            backgroundColor: BADGE_CONFIG[user.badge_type].color,
            width: size * 0.35,
            height: size * 0.35,
          }}
        >
          <BadgeCheckSVG type={user.badge_type} size={size * 0.25} />
        </div>
      )}
    </div>
  );
}

export { BADGE_CONFIG };
