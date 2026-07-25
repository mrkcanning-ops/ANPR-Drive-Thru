'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  short: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: '🏠', short: 'Home' },
  { label: 'Live Arrivals', href: '/arrivals', icon: '🚗', short: 'Arrivals' },
  { label: 'Active Orders', href: '/orders', icon: '📋', short: 'Orders' },
  { label: 'Customers', href: '/customers', icon: '👥', short: 'Customers' },
  { label: 'Settings', href: '/settings', icon: '⚙️', short: 'Settings' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex justify-around items-center h-16 z-40 lg:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive
                ? 'bg-emerald-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium mt-0.5">{item.short}</span>
          </Link>
        );
      })}
    </nav>
  );
}
