'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import ThemeProvider from '@/components/layout/ThemeProvider';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 min-h-screen md:ml-0">
          <div className="max-w-[600px] mx-auto min-h-screen border-x border-[var(--border-color)] bg-[var(--bg-primary)]">
            <div className="md:hidden h-14" />
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
