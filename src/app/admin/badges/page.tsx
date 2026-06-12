'use client';

import { useState, useEffect } from 'react';
import {
  BadgeCheck, CheckCircle, XCircle, Clock, Search, Loader2,
  Eye, Building2, Landmark, User as UserIcon, Filter, ChevronDown,
  AlertTriangle, Shield, Plus, Minus, ArrowRight, Trash2
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import BadgeIcon, { BadgePill } from '@/components/ui/BadgeIcon';
import type { BadgeRequest, Profile, BadgeType } from '@/types';

type Tab = 'requests' | 'direct' | 'companies';

export default function AdminBadgesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('requests');
  const [requests, setRequests] = useState<BadgeRequest[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Direct issue form
  const [issueUser, setIssueUser] = useState('');
  const [issueType, setIssueType] = useState<BadgeType>('blue');
  const [issueLabel, setIssueLabel] = useState('');
  const [issueResult, setIssueResult] = useState<{ success: boolean; msg: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab, filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'requests') {
        const res = await fetch(`/api/badges?action=requests&status=${filterStatus}`);
        const data = await res.json();
        setRequests(data.requests || []);
      } else {
        const res = await fetch('/api/admin?action=users');
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewRequest = async (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    setActionLoading(requestId);
    try {
      await fetch('/api/badges', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reviewRequest', requestId, status, reviewNotes: notes }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDirectIssue = async () => {
    setIssueResult(null);
    try {
      const res = await fetch('/api/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'issue',
          username: issueUser,
          badgeType: issueType,
          label: issueLabel || undefined,
        }),
      });
      const data = await res.json();
      setIssueResult({ success: !data.error, msg: data.error || `Badge issued to @${issueUser}` });
      if (!data.error) {
        setIssueUser('');
        setIssueLabel('');
        fetchData();
      }
    } catch (err) {
      setIssueResult({ success: false, msg: 'Failed to issue badge' });
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
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = activeTab === 'direct'
    ? users.filter(u => {
        const q = search.toLowerCase();
        return u.username.toLowerCase().includes(q) || u.display_name.toLowerCase().includes(q);
      })
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Badge Management</h1>
          <p className="text-sm text-[var(--text-tertiary)]">Manage verification badges across the platform</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-secondary)] mb-6">
        {([
          { key: 'requests', label: 'Requests', icon: Clock },
          { key: 'direct', label: 'Direct Issue', icon: Shield },
          { key: 'companies', label: 'Companies', icon: Building2 },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium flex-1 justify-center transition-all',
              activeTab === key
                ? 'gradient-bg text-white'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* ============================================ */}
      {/* TAB: Badge Requests */}
      {/* ============================================ */}
      {activeTab === 'requests' && (
        <>
          <div className="flex items-center gap-2 mb-4">
            {(['pending', 'all'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-all capitalize',
                  filterStatus === s ? 'gradient-bg text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)]'
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[var(--accent)]" /></div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
              <h3 className="font-bold mb-1">All clear</h3>
              <p className="text-sm text-[var(--text-tertiary)]">No badge requests to review</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="glass-card p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm">
                        {req.user?.display_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm">{req.user?.display_name}</span>
                          <BadgeIcon badgeType={req.user?.badge_type} size="xs" />
                        </div>
                        <span className="text-xs text-[var(--text-tertiary)]">@{req.user?.username}</span>
                      </div>
                    </div>
                    <span className="text-xs text-[var(--text-tertiary)]">{formatDate(req.created_at)}</span>
                  </div>

                  <div className="mb-3 pl-[52px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[var(--text-tertiary)]">Requested:</span>
                      <BadgePill badgeType={req.requested_type} label={req.display_label || undefined} />
                    </div>
                    {req.evidence_text && (
                      <p className="text-sm text-[var(--text-secondary)] mt-1">&quot;{req.evidence_text}&quot;</p>
                    )}
                    {req.evidence_url && (
                      <a href={req.evidence_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--accent)] hover:underline">
                        View evidence
                      </a>
                    )}
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex gap-2 pl-[52px]">
                      <button
                        onClick={() => handleReviewRequest(req.id, 'approved')}
                        disabled={actionLoading === req.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 text-xs font-medium hover:bg-green-500/20 transition-colors"
                      >
                        {actionLoading === req.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReviewRequest(req.id, 'rejected', 'Does not meet requirements')}
                        disabled={actionLoading === req.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium hover:bg-red-500/20 transition-colors"
                      >
                        <XCircle size={12} />
                        Reject
                      </button>
                    </div>
                  )}

                  {req.status !== 'pending' && (
                    <div className="pl-[52px]">
                      <span className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-full',
                        req.status === 'approved' && 'bg-green-500/10 text-green-500',
                        req.status === 'rejected' && 'bg-red-500/10 text-red-500',
                        req.status === 'expired' && 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)]',
                      )}>
                        {req.status}
                        {req.review_notes && ` — ${req.review_notes}`}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ============================================ */}
      {/* TAB: Direct Issue */}
      {/* ============================================ */}
      {activeTab === 'direct' && (
        <div className="space-y-6">
          {/* Issue Form */}
          <div className="glass-card p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Shield size={18} className="text-[var(--accent)]" />
              Issue Badge Directly
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Username</label>
                <input
                  value={issueUser}
                  onChange={(e) => setIssueUser(e.target.value)}
                  placeholder="@username"
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Badge Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { type: 'blue' as BadgeType, label: 'Blue (Individual)', color: '#1DA1F2' },
                    { type: 'grey' as BadgeType, label: 'Grey (Government)', color: '#6B7280' },
                    { type: 'gold' as BadgeType, label: 'Gold (Company)', color: '#EAB308' },
                  ]).map((opt) => (
                    <button
                      key={opt.type}
                      onClick={() => setIssueType(opt.type)}
                      className={cn(
                        'p-3 rounded-xl border text-center text-xs font-medium transition-all',
                        issueType === opt.type
                          ? 'border-current shadow-lg'
                          : 'border-[var(--border-color)] hover:border-[var(--text-tertiary)]'
                      )}
                      style={{ color: opt.type === issueType ? opt.color : 'var(--text-secondary)' }}
                    >
                      <BadgeIcon badgeType={opt.type} size="md" className="mx-auto mb-1" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Label (optional)</label>
                <input
                  value={issueLabel}
                  onChange={(e) => setIssueLabel(e.target.value)}
                  placeholder="e.g. NASA, City of London, etc."
                  className="input-field"
                />
              </div>

              {issueResult && (
                <div className={cn(
                  'p-3 rounded-lg text-sm',
                  issueResult.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                )}>
                  {issueResult.msg}
                </div>
              )}

              <button onClick={handleDirectIssue} className="btn-primary">
                Issue Badge
              </button>
            </div>
          </div>

          {/* User List */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="input-field pl-10"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-[var(--accent)]" /></div>
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-color)]">
                      <th className="text-left px-4 py-3 font-medium text-[var(--text-tertiary)]">User</th>
                      <th className="text-left px-4 py-3 font-medium text-[var(--text-tertiary)] hidden sm:table-cell">Badge</th>
                      <th className="text-left px-4 py-3 font-medium text-[var(--text-tertiary)] hidden md:table-cell">Role</th>
                      <th className="text-right px-4 py-3 font-medium text-[var(--text-tertiary)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.slice(0, 50).map((user) => (
                      <tr key={user.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
                              {user.display_name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{user.display_name}</span>
                                <BadgeIcon badgeType={user.badge_type} size="xs" />
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
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
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
                                onClick={() => { setIssueUser(user.username); setActiveTab('direct'); }}
                                className="p-1.5 rounded-lg text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
                                title="Issue badge"
                              >
                                <Plus size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* TAB: Companies */}
      {/* ============================================ */}
      {activeTab === 'companies' && (
        <CompanyManager />
      )}
    </div>
  );
}

// ============================================
// Company Manager Sub-Component
// ============================================
function CompanyManager() {
  const [companies, setCompanies] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formIndustry, setFormIndustry] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [associates, setAssociates] = useState<Profile[]>([]);
  const [addUsername, setAddUsername] = useState('');
  const [addTitle, setAddTitle] = useState('');
  const [result, setResult] = useState<{ success: boolean; msg: string } | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/company?action=list');
      const data = await res.json();
      setCompanies(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssociates = async (companyId: string) => {
    try {
      const res = await fetch(`/api/company?action=associates&companyId=${companyId}`);
      const data = await res.json();
      setAssociates(data.associates || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCompany = async () => {
    try {
      const res = await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: formName, username: formUsername, industry: formIndustry }),
      });
      const data = await res.json();
      if (data.error) {
        setResult({ success: false, msg: data.error });
      } else {
        setResult({ success: true, msg: 'Company created with gold badge!' });
        setShowCreate(false);
        setFormName('');
        setFormUsername('');
        setFormIndustry('');
        fetchCompanies();
      }
    } catch {
      setResult({ success: false, msg: 'Failed to create company' });
    }
  };

  const handleAddAssociate = async () => {
    if (!selectedCompany || !addUsername) return;
    try {
      const res = await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addAssociate',
          companyId: selectedCompany,
          username: addUsername,
          title: addTitle,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setResult({ success: false, msg: data.error });
      } else {
        setResult({ success: true, msg: `Blue tick issued to @${addUsername}` });
        setAddUsername('');
        setAddTitle('');
        fetchAssociates(selectedCompany);
      }
    } catch {
      setResult({ success: false, msg: 'Failed to add associate' });
    }
  };

  const handleRemoveAssociate = async (userId: string) => {
    if (!selectedCompany) return;
    try {
      await fetch('/api/company', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: selectedCompany, userId }),
      });
      fetchAssociates(selectedCompany);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Company */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <Building2 size={18} className="text-yellow-500" />
            Companies
          </h3>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-sm">
            <Plus size={14} className="inline mr-1" />
            Create Company
          </button>
        </div>

        {showCreate && (
          <div className="space-y-3 mb-4 p-4 rounded-xl bg-[var(--bg-secondary)] animate-slide-up">
            <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Company name" className="input-field text-sm" />
            <input value={formUsername} onChange={(e) => setFormUsername(e.target.value)} placeholder="@username" className="input-field text-sm" />
            <input value={formIndustry} onChange={(e) => setFormIndustry(e.target.value)} placeholder="Industry" className="input-field text-sm" />
            <button onClick={handleCreateCompany} className="btn-primary text-sm">Create & Issue Gold Badge</button>
          </div>
        )}

        {result && (
          <div className={cn('p-3 rounded-lg text-sm mb-4', result.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500')}>
            {result.msg}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-[var(--accent)]" /></div>
        ) : companies.length === 0 ? (
          <p className="text-center text-sm text-[var(--text-tertiary)] py-8">No companies registered yet</p>
        ) : (
          <div className="space-y-2">
            {companies.map((c) => (
              <div
                key={c.id}
                onClick={() => { setSelectedCompany(c.id); fetchAssociates(c.id); }}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all',
                  selectedCompany === c.id
                    ? 'bg-yellow-500/10 border border-yellow-500/30'
                    : 'bg-[var(--bg-secondary)] hover:bg-[var(--border-color)]'
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <BadgeIcon badgeType="gold" size="md" />
                </div>
                <div className="flex-1">
                  <span className="font-medium text-sm">{c.display_name}</span>
                  <span className="text-xs text-[var(--text-tertiary)] block">@{c.username}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Associates Panel */}
      {selectedCompany && (
        <div className="glass-card p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <BadgeIcon badgeType="blue_org" size="md" />
            Company Associates
          </h3>

          <div className="flex gap-2 mb-4">
            <input value={addUsername} onChange={(e) => setAddUsername(e.target.value)} placeholder="@username" className="input-field text-sm flex-1" />
            <input value={addTitle} onChange={(e) => setAddTitle(e.target.value)} placeholder="Title (optional)" className="input-field text-sm flex-1" />
            <button onClick={handleAddAssociate} className="btn-primary text-sm shrink-0">
              <Plus size={14} className="inline mr-1" />
              Add
            </button>
          </div>

          <p className="text-xs text-[var(--text-tertiary)] mb-3">
            Associates get a <BadgePill badgeType="blue_org" className="inline-flex" /> badge linked to this company
          </p>

          {associates.length === 0 ? (
            <p className="text-center text-sm text-[var(--text-tertiary)] py-6">No associates yet</p>
          ) : (
            <div className="space-y-2">
              {associates.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg bg-[var(--bg-secondary)]">
                  <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
                    {a.display_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-sm truncate">{a.display_name}</span>
                      <BadgeIcon badgeType="blue_org" size="xs" />
                    </div>
                    <span className="text-xs text-[var(--text-tertiary)]">@{a.username}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveAssociate(a.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
