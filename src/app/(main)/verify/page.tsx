'use client';

import { useState } from 'react';
import {
  BadgeCheck, Shield, Landmark, Building2, CheckCircle, Loader2,
  ArrowLeft, Star, Zap, Crown, Globe, Lock
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import BadgeIcon from '@/components/ui/BadgeIcon';

type BadgeTier = 'blue' | 'grey' | 'gold';

const TIERS = [
  {
    type: 'blue' as BadgeTier,
    name: 'Blue Badge',
    tagline: 'For Individuals',
    price: '$9.99/mo',
    priceAnnual: '$99/yr',
    color: '#1DA1F2',
    icon: BadgeCheck,
    features: [
      'Blue verification checkmark',
      'Priority in search results',
      'Enhanced profile visibility',
      'Verified badge on all posts',
      'Access to premium voice features',
    ],
    description: 'Get verified and stand out. Your identity confirmed, your voice amplified.',
  },
  {
    type: 'grey' as BadgeTier,
    name: 'Grey Badge',
    tagline: 'For Government',
    price: 'Free',
    priceAnnual: '',
    color: '#6B7280',
    icon: Landmark,
    features: [
      'Grey government verification',
      'Official state account status',
      'Priority support',
      'Anti-impersonation protection',
      'Custom account labeling',
    ],
    description: 'For verified government officials, agencies, and state-affiliated accounts.',
  },
  {
    type: 'gold' as BadgeTier,
    name: 'Gold Badge',
    tagline: 'For Companies',
    price: '$29.99/mo',
    priceAnnual: '$299/yr',
    color: '#EAB308',
    icon: Crown,
    features: [
      'Gold organization verification',
      'Issue blue ticks to associates',
      'Up to 50 team members',
      'Company profile page',
      'Analytics dashboard',
      'API access',
    ],
    description: 'For businesses, organizations, and brands. Verify your team members with linked badges.',
  },
];

export default function VerifyPage() {
  const [selectedTier, setSelectedTier] = useState<BadgeTier | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    username: '',
    evidence: '',
    reason: '',
    website: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          userId: 'current-user',
          requestedType: selectedTier,
          evidenceText: form.reason,
          evidenceUrl: form.website,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Starfield background */}
      <div className="absolute inset-0 starfield opacity-50" />
      <div className="gradient-orb w-[500px] h-[500px] bg-orange-500 top-[-200px] right-[-200px]" />
      <div className="gradient-orb w-[400px] h-[400px] bg-gold bottom-[-100px] left-[-100px]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/feed" className="inline-flex items-center gap-1 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] mb-6">
            <ArrowLeft size={16} /> Back to Space
          </Link>
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            Get <span className="gradient-text">Verified</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-lg mx-auto">
            Stand out on Space. Prove your identity, build trust, and unlock premium features.
          </p>
        </div>

        {/* Tier Cards */}
        {!selectedTier && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {TIERS.map((tier) => {
              const Icon = tier.icon;
              return (
                <button
                  key={tier.type}
                  onClick={() => setSelectedTier(tier.type)}
                  className="glass-card p-6 text-left hover:shadow-xl hover:scale-[1.02] transition-all group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${tier.color}20` }}
                  >
                    <BadgeIcon badgeType={tier.type} size="lg" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">{tier.name}</h3>
                  <p className="text-xs text-[var(--text-tertiary)] mb-3">{tier.tagline}</p>
                  <p className="text-2xl font-black mb-1" style={{ color: tier.color }}>
                    {tier.price}
                  </p>
                  {tier.priceAnnual && (
                    <p className="text-xs text-[var(--text-tertiary)] mb-4">or {tier.priceAnnual}</p>
                  )}
                  {!tier.priceAnnual && <div className="h-4 mb-4" />}
                  <p className="text-sm text-[var(--text-secondary)] mb-4">{tier.description}</p>
                  <ul className="space-y-2">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                        <CheckCircle size={14} className="shrink-0 mt-0.5" style={{ color: tier.color }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        )}

        {/* Application Form */}
        {selectedTier && !submitted && (
          <div className="max-w-lg mx-auto animate-slide-up">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setSelectedTier(null)} className="p-1 hover:bg-[var(--bg-secondary)] rounded-lg">
                  <ArrowLeft size={20} />
                </button>
                <BadgeIcon badgeType={selectedTier} size="md" />
                <div>
                  <h2 className="font-bold">Apply for {TIERS.find((t) => t.type === selectedTier)?.name}</h2>
                  <p className="text-xs text-[var(--text-tertiary)]">Complete the form below</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Your Username</label>
                  <input
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="@username"
                    className="input-field"
                  />
                </div>

                {selectedTier === 'blue' && (
                  <>
                    <div>
                      <label className="text-sm font-medium block mb-1">Why do you want verification?</label>
                      <textarea
                        value={form.reason}
                        onChange={(e) => setForm({ ...form, reason: e.target.value })}
                        placeholder="Tell us about yourself and why you should be verified..."
                        className="input-field min-h-[100px]"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Website / Social Profile</label>
                      <input
                        value={form.website}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                        placeholder="https://..."
                        className="input-field"
                      />
                    </div>
                  </>
                )}

                {selectedTier === 'grey' && (
                  <div>
                    <label className="text-sm font-medium block mb-1">Government Entity / Official Role</label>
                    <textarea
                      value={form.reason}
                      onChange={(e) => setForm({ ...form, reason: e.target.value })}
                      placeholder="e.g. Mayor of London, US State Department, NHS England..."
                      className="input-field min-h-[100px]"
                    />
                  </div>
                )}

                {selectedTier === 'gold' && (
                  <>
                    <div>
                      <label className="text-sm font-medium block mb-1">Company Name</label>
                      <input
                        value={form.reason}
                        onChange={(e) => setForm({ ...form, reason: e.target.value })}
                        placeholder="Your company or organization name"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Company Website</label>
                      <input
                        value={form.website}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                        placeholder="https://company.com"
                        className="input-field"
                      />
                    </div>
                  </>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !form.username}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                  Submit Application
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success */}
        {submitted && (
          <div className="max-w-lg mx-auto text-center animate-slide-up">
            <div className="glass-card p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center">
                <CheckCircle size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Application Submitted</h2>
              <p className="text-[var(--text-secondary)] mb-6">
                Your {TIERS.find((t) => t.type === selectedTier)?.name} application is being reviewed.
                We&apos;ll notify you once a decision is made.
              </p>
              <Link href="/feed" className="btn-primary inline-flex items-center gap-2">
                Back to Feed
              </Link>
            </div>
          </div>
        )}

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-6 text-[var(--text-tertiary)]">
            <div className="flex items-center gap-2 text-xs">
              <Lock size={14} />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Globe size={14} />
              <span>Global</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Zap size={14} />
              <span>Fast Review</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
