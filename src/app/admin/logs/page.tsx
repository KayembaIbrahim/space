'use client';

import { useState, useEffect } from 'react';
import { FileText, Loader2, Shield } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { AdminLog } from '@/types';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin?action=logs');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('ban')) return 'text-red-500 bg-red-500/10';
    if (action.includes('verify')) return 'text-green-500 bg-green-500/10';
    if (action.includes('role')) return 'text-blue-500 bg-blue-500/10';
    if (action.includes('delete')) return 'text-red-500 bg-red-500/10';
    return 'text-[var(--accent)] bg-[var(--accent)]/10';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-sm text-[var(--text-tertiary)]">Security and activity log</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={48} className="mx-auto text-[var(--text-tertiary)] mb-4" />
          <p className="text-[var(--text-tertiary)]">No audit logs yet</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="text-left px-4 py-3 font-medium text-[var(--text-tertiary)]">Admin</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--text-tertiary)]">Action</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--text-tertiary)] hidden md:table-cell">Target</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--text-tertiary)] hidden lg:table-cell">Details</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--text-tertiary)]">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Shield size={14} className="text-[var(--accent)]" />
                        <span className="font-medium">{log.admin?.display_name || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)] hidden md:table-cell">
                      {log.target_type && `${log.target_type}: `}
                      {log.target_id?.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-tertiary)] hidden lg:table-cell max-w-[200px] truncate">
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-tertiary)]">
                      {formatDate(log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
