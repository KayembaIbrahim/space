'use client';

import { useEffect, ReactNode } from 'react';
import { useThemeStore } from '@/stores';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const { setDarkMode } = useThemeStore();

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored ? stored === 'dark' : prefersDark;
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, [setDarkMode]);

  return <>{children}</>;
}
