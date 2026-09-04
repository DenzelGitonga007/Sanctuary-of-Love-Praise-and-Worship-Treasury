'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTreasury } from '@/lib/store';
import {
  LayoutDashboard,
  Sparkles,
  HeartHandshake,
  Receipt,
  Users,
  Settings,
  History,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isLoading } = useTreasury();

  if (isLoading) {
    return <div className="py-20 text-center text-xs text-slate-500">Loading admin suite...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-church-rose-50 dark:bg-church-rose-950/60 mx-auto flex items-center justify-center text-church-rose-600">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-church-dark-900 dark:text-white">Admin Access Restricted</h2>
        <p className="text-xs text-slate-500">
          Please log in with your treasurer credentials to manage sanctuary records.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-church-sky-600 text-white font-semibold text-xs rounded-xl shadow-md"
        >
          <span>Go to Treasurer Login</span>
        </Link>
      </div>
    );
  }

  const adminNav = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Import Lists', href: '/admin/import', icon: Sparkles, badge: 'Smart' },
    { name: 'Contributions', href: '/admin/contributions', icon: HeartHandshake },
    { name: 'Expenses', href: '/admin/expenses', icon: Receipt },
    { name: 'Members', href: '/admin/members', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'Audit Log', href: '/admin/audit-log', icon: History },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Admin Top Navigation Bar */}
      <div className="bg-white dark:bg-church-dark-900 p-2 sm:p-3 rounded-2xl border border-slate-200 dark:border-church-dark-800 shadow-sm flex items-center overflow-x-auto gap-1">
        {adminNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${isActive
                  ? 'bg-church-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-church-dark-800'
                }`}
            >
              <Icon className="w-4 h-4 opacity-90" />
              <span>{item.name}</span>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-church-gold-100 text-church-gold-800 font-bold'
                  }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
