'use client';

import type { ReactNode } from 'react';

import { NavBar } from '../../components/NavBar';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="mx-auto w-full max-w-2xl flex-1 px-5 py-6">{children}</div>
      <NavBar />
    </div>
  );
}
