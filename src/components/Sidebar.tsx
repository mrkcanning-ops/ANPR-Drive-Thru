'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Home,
  Car,
  ClipboardList,
  Coffee,
  Users,
  Video,
  BarChart3,
  Settings,
  ChevronDown,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface SidebarProps {
  activeItem?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: Home },
  { label: 'Live Arrivals', href: '/arrivals', icon: Car },
  { label: 'Active Orders', href: '/orders', icon: ClipboardList },
  { label: 'Menu', href: '/menu', icon: Coffee },
  { label: 'Customers', href: '/team', icon: Users },
  { label: 'Cameras', href: '/settings', icon: Video },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
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
        } sm:translate-x-0 fixed sm:static left-0 top-0 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 z-40 flex flex-col hidden lg:flex`}
      >
        {/* Logo */}
        <div className="px-6 py-5 flex items-center gap-2">
          <Coffee size={26} className="text-emerald-400" />
          <h2 className="text-xl font-bold text-white">CoffeeHub</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  activeItem === item.label
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2 cursor-pointer">
            <div className="relative w-9 h-9 flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Admin</p>
              <p className="text-xs text-gray-400 truncate">Administrator</p>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
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
