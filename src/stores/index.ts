import { create } from 'zustand';
import type { Profile } from '@/types';

interface AuthState {
  user: Profile | null;
  loading: boolean;
  setUser: (user: Profile | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));

interface ThemeState {
  darkMode: boolean;
  toggleTheme: () => void;
  setDarkMode: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  darkMode: true,
  toggleTheme: () => set((s) => {
    const next = !s.darkMode;
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
    }
    return { darkMode: next };
  }),
  setDarkMode: (dark) => set({ darkMode: dark }),
}));

interface AdminState {
  isActivated: boolean;
  isUnlocked: boolean;
  setActivated: (v: boolean) => void;
  setUnlocked: (v: boolean) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  isActivated: false,
  isUnlocked: false,
  setActivated: (v) => set({ isActivated: v }),
  setUnlocked: (v) => set({ isUnlocked: v }),
}));

interface NotificationState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  increment: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  increment: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
}));
