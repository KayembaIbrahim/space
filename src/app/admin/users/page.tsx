'use client';

import { useState, useEffect } from 'react';
import {
  Search, Ban, CheckCircle, Shield, Loader2, UserCheck, UserX,
  BadgeCheck, Trash2, Plus, Filter
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import BadgeIcon, { BadgePill } from '@/components/ui/BadgeIcon';
import type { Profile, BadgeType } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'none' | 'blue' | 'grey' | 'gold' | 'blue_org'>('all');

  // Badge issue modal
  const [issueModal, setIssueModal] = useState<string | null>(null);
  const [issueType, setIssueType] = useState<BadgeType>('blue');
  const [issueLabel, setIssueLabel] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin?action=users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId: string, action: string, extra?: Record<string, unknown>) => {
    setActionLoading(userId);
    try {
      await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, targetId: userId, data: extra }),
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleIssueBadge = async (userId: string) => {
    setActionLoading(userId);
    try {
      await fetch('/api/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'issue',
          userId,
          badgeType: issueType,
          label: issueLabel || undefined,
        }),
      });
      setIssueModal(null);
      setIssueLabel('');
      fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeBadge = async (userId: string) => {
    setActionLoading(userId);
    try {
      await fetch('/api/badges', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke', userId }),
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch = u.username.toLowerCase().includes(q) || u.display_name.toLowerCase().includes(q);
    const matchesBadge = badgeFilter === 'all' ||
      (badgeFilter === 'none' && !u.badge_type) ||
      u.badge_type === badgeFilter;
    return matchesSearch && matchesBadge;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-[var(--text-tertiary)]">{users.length} total users</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {([
            { value: 'all' as const, label: 'All' },
            { value: 'none' as const, label: 'No Badge' },
            { value: 'blue' as const, label: 'Blue', color: '#1DA1F2' },
            { value: 'grey' as const, label: 'Grey', color: '#6B7280' },
            { value: 'gold' as const, label: 'Gold', color: '#EAB308' },
            { value: 'blue_org' as const, label: 'Org Assoc', color: '#1DA1F2' },
          ]).map((f) => (
            <button
              key={f.value}
              onClick={() => setBadgeFilter(f.value)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1',
                badgeFilter === f.value
                  ? 'gradient-bg text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              )}
            >
              {'color' in f && f.color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="text-left px-4 py-3 font-medium text-[var(--text-tertiary)]">User</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--text-tertiary)] hidden sm:table-cell">Badge</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--text-tertiary)] hidden md:table-cell">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--text-tertiary)] hidden lg:table-cell">Joined</th>
                  <th className="text-right px-4 py-3 font-medium text-[var(--text-tertiary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
                            {user.display_name.charAt(0)}
                          </div>
                          {user.badge_type && (
                            <div
                              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[1.5px] border-[var(--bg-primary)] flex items-center justify-center"
                              style={{ backgroundColor: getBadgeColor(user.badge_type) }}
                            >
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{user.display_name}</span>
                          </div>
                          <span className="text-xs text-[var(--text-tertiary)]">@{user.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {user.badge_type ? (
                        <BadgePill badgeType={user.badge_type} label={user.badge_label || undefined} />
                      ) : (
                        <span className="text-xs text-[var(--text-tertiary)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        user.role === 'admin' && 'bg-red-500/10 text-red-500',
                        user.role === 'moderator' && 'bg-blue-500/10 text-blue-500',
                        user.role === 'user' && 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-[var(--text-tertiary)]">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Badge Actions */}
                        {user.badge_type ? (
                          <button
                            onClick={() => handleRevokeBadge(user.id)}
                            disabled={actionLoading === user.id}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Revoke badge"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => setIssueModal(user.id)}
                            className="p-1.5 rounded-lg text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
                            title="Issue badge"
                          >
                            <BadgeCheck size={16} />
                          </button>
                        )}

                        {/* User Actions */}
                        {user.is_banned ? (
                          <button
                            onClick={() => handleAction(user.id, 'unban')}
                            className="p-1.5 rounded-lg text-green-500 hover:bg-green-500/10 transition-colors"
                            title="Unban"
                          >
                            <UserCheck size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(user.id, 'ban', { reason: 'Banned by admin' })}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Ban"
                          >
                            <Ban size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(user.id, 'setRole', { role: user.role === 'admin' ? 'user' : 'admin' })}
                          className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors"
                          title="Toggle admin"
                        >
                          <Shield size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Issue Badge Modal */}
      {issueModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card p-6 w-full max-w-md animate-slide-up">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BadgeCheck size={20} className="text-[var(--accent)]" />
              Issue Badge
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">Badge Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { type: 'blue' as BadgeType, label: 'Blue', color: '#1DA1F2', desc: 'Individual' },
                    { type: 'grey' as BadgeType, label: 'Grey', color: '#6B7280', desc: 'Government' },
                    { type: 'gold' as BadgeType, label: 'Gold', color: '#EAB308', desc: 'Company' },
                  ]).map((opt) => (
                    <button
                      key={opt.type}
                      onClick={() => setIssueType(opt.type)}
                      className={cn(
                        'p-3 rounded-xl border text-center transition-all',
                        issueType === opt.type ? 'border-current shadow-lg' : 'border-[var(--border-color)]'
                      )}
                      style={{ color: issueType === opt.type ? opt.color : 'var(--text-secondary)' }}
                    >
                      <BadgeIcon badgeType={opt.type} size="md" className="mx-auto mb-1" />
                      <div className="text-xs font-medium">{opt.label}</div>
                      <div className="text-[10px] opacity-60">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Label (optional)</label>
                <input
                  value={issueLabel}
                  onChange={(e) => setIssueLabel(e.target.value)}
                  placeholder="e.g. NASA, City of London"
                  className="input-field"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleIssueBadge(issueModal)}
                  disabled={actionLoading === issueModal}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {actionLoading === issueModal ? <Loader2 size={16} className="animate-spin" /> : <BadgeCheck size={16} />}
                  Issue Badge
                </button>
                <button
                  onClick={() => { setIssueModal(null); setIssueLabel(''); }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getBadgeColor(type: string): string {
  switch (type) {
    case 'blue': return '#1DA1F2';
    case 'grey': return '#6B7280';
    case 'gold': return '#EAB308';
    case 'blue_org': return '#1DA1F2';
    default: return '#1DA1F2';
  }
}
