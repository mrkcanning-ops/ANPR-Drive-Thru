'use client';

import Link from 'next/link';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface SidebarProps {
  activeItem?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: '🏠' },
  { label: 'Live Arrivals', href: '/arrivals', icon: '🚗' },
  { label: 'Active Orders', href: '/orders', icon: '📋' },
  { label: 'Menu', href: '/menu', icon: '🍔' },
  { label: 'Customers', href: '/customers', icon: '👥' },
  { label: 'Cameras', href: '/cameras', icon: '📷' },
  { label: 'Analytics', href: '/analytics', icon: '📊' },
  { label: 'Settings', href: '/settings', icon: '⚙️' },
];

export function Sidebar({ activeItem = 'Dashboard' }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button - hidden on tablet and up */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="sm:hidden fixed top-4 left-4 z-50 bg-emerald-600 text-white p-2 rounded-lg"
      >
        ☰
      </button>

      {/* Sidebar - visible only on desktop (lg and up) */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } sm:translate-x-0 fixed sm:static left-0 top-0 h-screen w-64 bg-gray-900 text-white transition-transform duration-300 z-40 flex flex-col hidden lg:flex`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-xl font-bold">
              ☕
            </div>
            <h2 className="text-xl font-bold">CoffeeHub</h2>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeItem === item.label
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-medium">Admin</p>
              <p className="text-xs text-gray-400">online</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 sm:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
