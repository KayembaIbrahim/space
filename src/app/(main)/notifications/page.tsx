'use client';

import { useState, useEffect } from 'react';
import { Bell, Heart, UserPlus, MessageCircle, Repeat2, Volume2, Shield, Check } from 'lucide-react';
import Link from 'next/link';
import { formatDate, cn } from '@/lib/utils';
import type { Notification } from '@/types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications?userId=current-user&unreadOnly=${filter === 'unread'}`);
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'current-user' }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={16} className="text-red-500 fill-red-500" />;
      case 'follow': return <UserPlus size={16} className="text-blue-500" />;
      case 'comment': return <MessageCircle size={16} className="text-green-500" />;
      case 'voice_comment': return <Volume2 size={16} className="text-orange-500" />;
      case 'repost': return <Repeat2 size={16} className="text-purple-500" />;
      case 'admin': return <Shield size={16} className="text-yellow-500" />;
      default: return <Bell size={16} />;
    }
  };

  return (
    <div>
      <div className="sticky top-14 md:top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">Notifications</h1>
          <button
            onClick={markAllRead}
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Mark all read
          </button>
        </div>
        <div className="flex px-4 gap-2 pb-3">
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize',
                filter === f
                  ? 'gradient-bg text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 px-8">
          <Bell size={48} className="mx-auto text-[var(--text-tertiary)] mb-4" />
          <p className="text-[var(--text-tertiary)]">No notifications yet</p>
        </div>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className={cn(
              'flex items-start gap-3 px-4 py-3 border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors',
              !n.is_read && 'bg-[var(--accent)]/5'
            )}
          >
            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center shrink-0 text-white">
              {getIcon(n.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--text-primary)]">
                {n.actor?.display_name || 'Someone'}{' '}
                {n.type === 'follow' && 'followed you'}
                {n.type === 'like' && 'liked your post'}
                {n.type === 'comment' && 'replied to your post'}
                {n.type === 'voice_comment' && 'left a voice reply'}
                {n.type === 'repost' && 'reposted your post'}
                {n.type === 'admin' && n.content}
              </p>
              <span className="text-xs text-[var(--text-tertiary)]">{formatDate(n.created_at)}</span>
            </div>
            {!n.is_read && (
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0 mt-2" />
            )}
          </div>
        ))
      )}
    </div>
  );
}
