import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AuthProvider } from '../providers/AuthProvider';
import { QueryProvider } from '../providers/QueryProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'You Free',
  description: 'Find the days you’re both free.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
