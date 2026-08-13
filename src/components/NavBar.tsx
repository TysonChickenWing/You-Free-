'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/free-days', label: 'Free Days', icon: '👨‍👩‍👧' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/golf', label: 'Golf', icon: '⛳' },
  { href: '/groups', label: 'Groups', icon: '👥' },
  { href: '/profile', label: 'Profile', icon: '🙂' },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-10 border-t border-border bg-surface">
      <div className="mx-auto flex max-w-2xl">
        {TABS.map((tab) => {
          const active = pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${
                active ? 'text-primary' : 'text-text-muted'
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
