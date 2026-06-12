'use client';

import { useState, useEffect } from 'react';
import {
  Users, FileText, Volume2, AlertTriangle, TrendingUp,
  Activity, BarChart3, ArrowUpRight, Loader2, BadgeCheck,
  Building2, Landmark
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stats {
  totalUsers: number;
  totalPosts: number;
  totalVoiceComments: number;
  pendingReports: number;
  todayPosts: number;
  badgeStats?: {
    blue: number;
    grey: number;
    gold: number;
    blueOrg: number;
    pendingRequests: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin?action=stats');
      const data = await res.json();
      setStats(data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-blue-600', change: '+12%' },
    { label: 'Total Posts', value: stats.totalPosts, icon: FileText, color: 'from-green-500 to-green-600', change: '+8%' },
    { label: 'Voice Comments', value: stats.totalVoiceComments, icon: Volume2, color: 'from-orange-500 to-yellow-500', change: '+24%' },
    { label: 'Pending Reports', value: stats.pendingReports, icon: AlertTriangle, color: 'from-red-500 to-red-600', change: '-3%' },
    { label: "Today's Posts", value: stats.todayPosts, icon: TrendingUp, color: 'from-purple-500 to-purple-600', change: '+15%' },
    { label: 'Pending Badges', value: stats.badgeStats?.pendingRequests || 0, icon: BadgeCheck, color: 'from-cyan-500 to-cyan-600', change: '' },
  ] : [];

  const badgeBreakdown = stats?.badgeStats ? [
    { label: 'Blue (Individual)', count: stats.badgeStats.blue, color: '#1DA1F2', icon: BadgeCheck },
    { label: 'Grey (Government)', count: stats.badgeStats.grey, color: '#6B7280', icon: Landmark },
    { label: 'Gold (Companies)', count: stats.badgeStats.gold, color: '#EAB308', icon: Building2 },
    { label: 'Org Associates', count: stats.badgeStats.blueOrg, color: '#1DA1F2', icon: Users },
  ] : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-[var(--text-tertiary)]">Platform overview and analytics</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-green-500">System Online</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {statCards.map((stat) => (
              <div key={stat.label} className="glass-card p-5 relative overflow-hidden group hover:shadow-lg transition-shadow">
                <div className={cn('absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 bg-gradient-to-br', stat.color)} />
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <p className="text-sm text-[var(--text-tertiary)] mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
                    <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                      <ArrowUpRight size={12} />
                      {stat.change} this week
                    </p>
                  </div>
                  <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white', stat.color)}>
                    <stat.icon size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Badge Breakdown */}
          {badgeBreakdown.length > 0 && (
            <div className="glass-card p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <BadgeCheck size={18} className="text-[var(--accent)]" />
                <h3 className="font-bold">Badge Breakdown</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badgeBreakdown.map((b) => (
                  <div key={b.label} className="text-center p-3 rounded-xl bg-[var(--bg-secondary)]">
                    <b.icon size={24} className="mx-auto mb-2" style={{ color: b.color }} />
                    <p className="text-2xl font-bold">{b.count}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{b.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={18} className="text-[var(--accent)]" />
                <h3 className="font-bold">Engagement Over Time</h3>
              </div>
              <div className="h-48 flex items-end gap-1">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 gradient-bg rounded-t opacity-60 hover:opacity-100 transition-opacity"
                    style={{ height: `${20 + Math.random() * 80}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-[var(--text-tertiary)]">
                <span>2 weeks ago</span>
                <span>Today</span>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={18} className="text-[var(--accent)]" />
                <h3 className="font-bold">Voice Usage</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Voice Comments', pct: 68 },
                  { label: 'Text Comments', pct: 85 },
                  { label: 'Posts with Media', pct: 42 },
                  { label: 'Poll Participation', pct: 31 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[var(--text-secondary)]">{item.label}</span>
                      <span className="font-medium">{item.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                      <div
                        className="h-full gradient-bg rounded-full transition-all duration-1000"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Send Announcement', color: 'bg-blue-500/10 text-blue-500' },
                { label: 'Review Reports', color: 'bg-red-500/10 text-red-500' },
                { label: 'Feature Toggle', color: 'bg-green-500/10 text-green-500' },
                { label: 'Export Data', color: 'bg-purple-500/10 text-purple-500' },
              ].map((action) => (
                <button
                  key={action.label}
                  className={cn('p-3 rounded-xl text-sm font-medium transition-all hover:scale-105', action.color)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
