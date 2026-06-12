'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Flag, Settings, FileText, BadgeCheck,
  ArrowLeft, Shield, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/components/layout/Logo';

const adminNav = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/badges', icon: BadgeCheck, label: 'Badges' },
  { href: '/admin/moderation', icon: Flag, label: 'Moderation' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
  { href: '/admin/logs', icon: FileText, label: 'Audit Logs' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)]">
      {/* Admin Sidebar */}
      <aside className="hidden lg:flex w-[260px] h-screen sticky top-0 flex-col border-r border-[var(--border-color)] bg-[var(--bg-primary)]">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={20} className="text-[var(--accent)]" />
            <span className="font-bold text-sm">Admin Portal</span>
          </div>
          <Logo size="sm" />
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {adminNav.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'gradient-bg text-white shadow-lg shadow-orange-500/20'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border-color)]">
          <Link
            href="/feed"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all"
          >
            <ArrowLeft size={18} />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Mobile Admin Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-color)]">
        <Link href="/feed" className="p-1 hover:bg-[var(--bg-secondary)] rounded-lg">
          <ArrowLeft size={20} />
        </Link>
        <Shield size={18} className="text-[var(--accent)]" />
        <span className="font-bold text-sm">Admin Portal</span>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 py-2 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-t border-[var(--border-color)]">
        {adminNav.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all',
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'
              )}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Content */}
      <main className="flex-1 min-h-screen lg:ml-0">
        <div className="lg:hidden h-14" />
        <div className="max-w-5xl mx-auto p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </div>
      </main>
    </div>
  );
}
