'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTreasury } from '@/lib/store';
import {
  HeartHandshake,
  LayoutDashboard,
  Users,
  Receipt,
  BookOpen,
  FileSpreadsheet,
  QrCode,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  LogOut,
  Database,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import QRCodeModal from '@/components/ui/QRCodeModal';

export default function Navbar() {
  const pathname = usePathname();
  const { isAdmin, logout, isSupabaseLive, isSyncing, refreshFromCloud, lastSyncedAt } = useTreasury();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Contributions', href: '/contributions', icon: HeartHandshake },
    { name: 'Members', href: '/members', icon: Users },
    { name: 'Expenses', href: '/expenses', icon: Receipt },
    { name: 'Ledger', href: '/ledger', icon: BookOpen },
    { name: 'Reports', href: '/reports', icon: FileSpreadsheet },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-church-dark-900/95 backdrop-blur border-b border-church-sky-100 dark:border-church-dark-800 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo & Church Branding */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-church-sky-600 via-church-sky-500 to-church-gold-400 flex items-center justify-center text-white shadow-md shadow-church-sky-500/20 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm sm:text-base text-church-dark-900 dark:text-white tracking-tight leading-tight">
                    Sanctuary of Love
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-church-sky-100 dark:bg-church-sky-900/60 text-church-sky-700 dark:text-church-sky-300 rounded">
                    Dandora
                  </span>
                </div>
                <span className="text-xs sm:text-xs font-semibold bg-gradient-to-r from-church-sky-600 to-church-rose-600 bg-clip-text text-transparent">
                  Praise & Worship Treasury
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                      active
                        ? 'bg-church-sky-50 dark:bg-church-sky-900/40 text-church-sky-600 dark:text-church-sky-300 shadow-sm border border-church-sky-100 dark:border-church-sky-800'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-church-dark-800 hover:text-church-sky-600'
                    }`}
                  >
                    <Icon className="w-4 h-4 opacity-80" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons & Admin CTA */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Cloud DB Status Indicator */}
              <button
                onClick={() => refreshFromCloud()}
                title={
                  isSupabaseLive
                    ? `Supabase Live Connected${lastSyncedAt ? ` (Synced: ${lastSyncedAt.toLocaleTimeString()})` : ''} - Click to refresh`
                    : 'Offline / LocalStorage mode - Click to connect'
                }
                disabled={isSyncing}
                className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  isSupabaseLive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  {isSupabaseLive && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isSupabaseLive ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  ></span>
                </span>
                <span className="text-[11px] font-semibold tracking-tight">
                  {isSyncing ? 'Syncing...' : isSupabaseLive ? 'Cloud Live' : 'Local Mode'}
                </span>
                <RefreshCw
                  className={`w-3 h-3 ml-0.5 opacity-70 ${isSyncing ? 'animate-spin' : ''}`}
                />
              </button>

              {/* QR Code trigger */}
              <button
                onClick={() => setQrModalOpen(true)}
                title="Church Noticeboard QR Code"
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-church-sky-600 hover:bg-church-sky-50 dark:hover:bg-church-dark-800 rounded-lg transition-colors"
              >
                <QrCode className="w-5 h-5" />
              </button>

              {isAdmin ? (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/admin"
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-church-rose-600 to-church-rose-700 hover:from-church-rose-500 hover:to-church-rose-600 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </Link>
                  <button
                    onClick={logout}
                    title="Logout Treasurer"
                    className="p-2 text-slate-400 hover:text-church-rose-600 rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 border border-church-sky-200 dark:border-church-sky-800 text-church-sky-700 dark:text-church-sky-300 hover:bg-church-sky-50 dark:hover:bg-church-dark-800 text-xs sm:text-sm font-semibold rounded-lg transition-colors shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-church-sky-600" />
                  <span>Treasurer Login</span>
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-church-dark-800 rounded-lg"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-church-sky-100 dark:border-church-dark-800 bg-white dark:bg-church-dark-900 px-4 pt-2 pb-6 space-y-1 shadow-lg animate-fade-in">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    active
                      ? 'bg-church-sky-50 dark:bg-church-sky-900/50 text-church-sky-600 dark:text-church-sky-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-church-dark-800'
                  }`}
                >
                  <Icon className="w-5 h-5 opacity-80" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-100 dark:border-church-dark-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setQrModalOpen(true);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-church-dark-800 rounded-lg"
              >
                <QrCode className="w-5 h-5 text-church-sky-600" />
                <span>Show Church Noticeboard QR</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* QR Code Modal */}
      <QRCodeModal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} />
    </>
  );
}
