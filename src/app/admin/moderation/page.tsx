'use client';

import { useState, useEffect } from 'react';
import {
  Flag, CheckCircle, XCircle, Eye, Loader2, AlertTriangle
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import type { Report } from '@/types';

export default function AdminModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/admin?action=reports');
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolveReport',
          targetId: reportId,
          data: { status, adminId: 'current-admin' },
        }),
      });
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = filter === 'pending'
    ? reports.filter((r) => r.status === 'pending')
    : reports;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Content Moderation</h1>
          <p className="text-sm text-[var(--text-tertiary)]">
            {reports.filter((r) => r.status === 'pending').length} pending reports
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(['pending', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize',
              filter === f
                ? 'gradient-bg text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)]'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-bold mb-2">All clear!</h3>
          <p className="text-sm text-[var(--text-tertiary)]">No reports to review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((report) => (
            <div key={report.id} className="glass-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className={cn(
                    report.status === 'pending' ? 'text-yellow-500' :
                    report.status === 'resolved' ? 'text-green-500' : 'text-[var(--text-tertiary)]'
                  )} />
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    report.status === 'pending' && 'bg-yellow-500/10 text-yellow-500',
                    report.status === 'resolved' && 'bg-green-500/10 text-green-500',
                    report.status === 'dismissed' && 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)]'
                  )}>
                    {report.status}
                  </span>
                </div>
                <span className="text-xs text-[var(--text-tertiary)]">{formatDate(report.created_at)}</span>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium mb-1">Reported by: @{report.reporter?.username || 'unknown'}</p>
                <p className="text-sm text-[var(--text-secondary)]">Reason: {report.reason}</p>
                {report.details && (
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">{report.details}</p>
                )}
              </div>

              {report.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResolve(report.id, 'resolved')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 text-sm font-medium hover:bg-green-500/20 transition-colors"
                  >
                    <CheckCircle size={14} />
                    Resolve
                  </button>
                  <button
                    onClick={() => handleResolve(report.id, 'dismissed')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-sm font-medium hover:bg-[var(--border-color)] transition-colors"
                  >
                    <XCircle size={14} />
                    Dismiss
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-sm font-medium hover:bg-[var(--border-color)] transition-colors">
                    <Eye size={14} />
                    View Content
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
