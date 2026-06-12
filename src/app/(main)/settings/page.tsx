'use client';

import { useState } from 'react';
import { ArrowLeft, Camera, Loader2, Save, User, Bell, Shield, Palette } from 'lucide-react';
import Link from 'next/link';
import { useThemeStore } from '@/stores';

export default function SettingsPage() {
  const { darkMode, toggleTheme } = useThemeStore();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Save profile settings
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div>
      <div className="sticky top-14 md:top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link href="/feed" className="hover:bg-[var(--bg-secondary)] p-1 rounded-lg">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold">Settings</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-[var(--accent)]" />
            <h2 className="font-bold">Profile</h2>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center text-white text-2xl font-bold">
                U
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-white">
                <Camera size={14} />
              </button>
            </div>
            <div>
              <p className="text-sm font-medium">Profile Photo</p>
              <p className="text-xs text-[var(--text-tertiary)]">JPG, PNG. Max 5MB</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-1">Display Name</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input-field" placeholder="Your name" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input-field min-h-[80px]" placeholder="Tell us about yourself" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1">Location</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} className="input-field" placeholder="City, Country" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Website</label>
                <input value={website} onChange={(e) => setWebsite(e.target.value)} className="input-field" placeholder="https://" />
              </div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Palette size={18} className="text-[var(--accent)]" />
            <h2 className="font-bold">Appearance</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Dark Mode</p>
              <p className="text-xs text-[var(--text-tertiary)]">Toggle dark/light theme</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-[var(--accent)]' : 'bg-[var(--border-color)]'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-[var(--accent)]" />
            <h2 className="font-bold">Notifications</h2>
          </div>
          {['Likes', 'Replies', 'Voice Replies', 'Follows', 'Mentions'].map((item) => (
            <div key={item} className="flex items-center justify-between py-2 border-b border-[var(--border-color)] last:border-0">
              <span className="text-sm">{item}</span>
              <button className="relative w-12 h-6 rounded-full bg-[var(--accent)]">
                <div className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white shadow" />
              </button>
            </div>
          ))}
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
