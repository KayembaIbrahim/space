'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Home, Search, Bell, Bookmark, User, Settings, LogOut,
  Moon, Sun, Shield, Menu, X, BadgeCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore, useNotificationStore, useAdminStore, useAuthStore } from '@/stores';
import { useTapDetection } from '@/hooks';
import Logo from './Logo';

const navItems = [
  { href: '/feed', icon: Home, label: 'Home' },
  { href: '/explore', icon: Search, label: 'Explore' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { href: '/profile/me', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { darkMode, toggleTheme } = useThemeStore();
  const { unreadCount } = useNotificationStore();
  const { setActivated } = useAdminStore();
  const { user } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);

  const handleLogoTap = useTapDetection({
    taps: 9,
    timeWindow: 5000,
    onTrigger: () => {
      if (user?.role === 'admin') {
        setActivated(true);
        window.location.href = '/admin';
      } else {
        setShowAdminPrompt(true);
      }
    },
  });

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 mb-2">
        <button onClick={handleLogoTap} className="cursor-pointer">
          <Logo size="lg" />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'gradient-bg text-white shadow-lg shadow-orange-500/20'
                  : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
              )}
            >
              <div className="relative">
                <item.icon size={20} />
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}

        {(user?.role === 'admin' || user?.role === 'moderator') && (
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
              pathname.startsWith('/admin')
                ? 'gradient-bg text-white shadow-lg shadow-orange-500/20'
                : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
            )}
          >
            <Shield size={20} />
            <span>Admin</span>
          </Link>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 space-y-1 border-t border-[var(--border-color)]">
        <Link
          href="/verify"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-[var(--accent)]/10 text-[var(--accent)] transition-all"
        >
          <BadgeCheck size={20} />
          <span>Get Verified</span>
        </Link>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-all"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-all"
        >
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[260px] h-screen sticky top-0 flex-col border-r border-[var(--border-color)] bg-[var(--bg-primary)] overflow-y-auto scrollbar-thin">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-color)]">
        <button onClick={handleLogoTap}>
          <Logo size="sm" />
        </button>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-[var(--bg-secondary)]">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-[var(--bg-secondary)]">
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-[var(--bg-primary)] animate-slide-up overflow-y-auto">
            <div className="flex justify-end p-4">
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-[var(--bg-secondary)]">
                <X size={20} />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 py-2 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-t border-[var(--border-color)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all',
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'
              )}
            >
              <div className="relative">
                <item.icon size={22} />
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Admin Portal Prompt */}
      {showAdminPrompt && (
        <AdminPortalPrompt onClose={() => setShowAdminPrompt(false)} />
      )}
    </>
  );
}

function AdminPortalPrompt({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setActivated } = useAdminStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/admin-activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setActivated(true);
        window.location.href = '/admin';
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch {
      setError('Connection error');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card p-6 w-full max-w-sm animate-slide-up">
        <h3 className="text-lg font-bold mb-4 gradient-text">Admin Portal</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="input-field"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">Access</button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
