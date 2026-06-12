'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Volume2, Megaphone, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Settings {
  voiceMaxDuration: number;
  voiceMinDuration: number;
  allowSocialLogin: boolean;
  allowPolls: boolean;
  allowVoiceComments: boolean;
  maxMediaPerPost: number;
  maintenanceMode: boolean;
  announcement: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    voiceMaxDuration: 60,
    voiceMinDuration: 2,
    allowSocialLogin: true,
    allowPolls: true,
    allowVoiceComments: true,
    maxMediaPerPost: 4,
    maintenanceMode: false,
    announcement: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateSetting',
          data: { key: 'platform_settings', value: settings, adminId: 'current-admin' },
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={cn('transition-colors', value ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]')}
    >
      {value ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
    </button>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Platform Settings</h1>
          <p className="text-sm text-[var(--text-tertiary)]">Configure your Space instance</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Voice Settings */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Volume2 size={18} className="text-[var(--accent)]" />
            <h2 className="font-bold">Voice Comments</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Allow Voice Comments</p>
                <p className="text-xs text-[var(--text-tertiary)]">Enable voice replies on posts</p>
              </div>
              <Toggle
                value={settings.allowVoiceComments}
                onChange={(v) => setSettings({ ...settings, allowVoiceComments: v })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Min Duration (seconds)</label>
                <input
                  type="number"
                  value={settings.voiceMinDuration}
                  onChange={(e) => setSettings({ ...settings, voiceMinDuration: parseInt(e.target.value) })}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Max Duration (seconds)</label>
                <input
                  type="number"
                  value={settings.voiceMaxDuration}
                  onChange={(e) => setSettings({ ...settings, voiceMaxDuration: parseInt(e.target.value) })}
                  className="input-field text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="glass-card p-6">
          <h2 className="font-bold mb-4">Feature Toggles</h2>
          <div className="space-y-4">
            {[
              { label: 'Social Login', desc: 'Allow Google/X login', key: 'allowSocialLogin' as const },
              { label: 'Polls', desc: 'Allow poll creation on posts', key: 'allowPolls' as const },
            ].map((feature) => (
              <div key={feature.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{feature.label}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{feature.desc}</p>
                </div>
                <Toggle
                  value={settings[feature.key]}
                  onChange={(v) => setSettings({ ...settings, [feature.key]: v })}
                />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium block mb-1">Max Media Per Post</label>
              <input
                type="number"
                value={settings.maxMediaPerPost}
                onChange={(e) => setSettings({ ...settings, maxMediaPerPost: parseInt(e.target.value) })}
                className="input-field text-sm w-24"
              />
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone size={18} className="text-[var(--accent)]" />
            <h2 className="font-bold">Global Announcement</h2>
          </div>
          <textarea
            value={settings.announcement}
            onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
            placeholder="Enter a platform-wide announcement..."
            className="input-field min-h-[100px]"
          />
        </div>

        {/* Maintenance */}
        <div className="glass-card p-6 border-red-500/20">
          <h2 className="font-bold mb-4 text-red-500">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Maintenance Mode</p>
              <p className="text-xs text-[var(--text-tertiary)]">Temporarily disable the platform</p>
            </div>
            <Toggle
              value={settings.maintenanceMode}
              onChange={(v) => setSettings({ ...settings, maintenanceMode: v })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
