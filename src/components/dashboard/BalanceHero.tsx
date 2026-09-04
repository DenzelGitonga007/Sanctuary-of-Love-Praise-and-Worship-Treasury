'use client';

import React from 'react';
import Link from 'next/link';
import { useTreasury } from '@/lib/store';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar,
  Share2,
  Search,
  ShieldCheck,
} from 'lucide-react';

interface BalanceHeroProps {
  onOpenShareModal?: () => void;
}

export default function BalanceHero({ onOpenShareModal }: BalanceHeroProps) {
  const { currentBalance, settings, totalMonthly, totalTea, totalExpenses, isAdmin } = useTreasury();

  const formattedBalance = currentBalance.toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-church-dark-900 via-church-sky-950 to-church-dark-950 text-white p-6 sm:p-10 shadow-2xl border border-church-sky-800/40">
      {/* Decorative gradient glow circles */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-church-sky-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 rounded-full bg-church-gold-400/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-church-rose-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        {/* Left Side: Balance & Metadata */}
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-church-sky-500/10 border border-church-sky-400/30 text-church-sky-300 text-xs font-semibold backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Verified Live Treasury Balance</span>
          </div>

          <div>
            <span className="text-xs sm:text-sm font-medium text-slate-300 tracking-wide uppercase">
              Current Treasury Balance
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold text-church-gold-400 font-display">
                {settings.currency}
              </span>
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-display">
                {formattedBalance}/=
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400 pt-1">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-church-sky-400" />
              <span>Current Financial Period: <strong>2026 (April – September+)</strong></span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-church-gold-400" />
              <span>Double-entry validated</span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action Pills */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
          <Link
            href="/members"
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-church-sky-600 to-church-sky-500 hover:from-church-sky-500 hover:to-church-sky-400 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-church-sky-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Search className="w-4 h-4" />
            <span>Check My Contribution Record</span>
          </Link>

          {isAdmin ? (
            <Link
              href="/admin/import"
              className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-church-rose-600 to-church-rose-700 hover:from-church-rose-500 hover:to-church-rose-600 text-white font-semibold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-church-gold-300" />
              <span>Import List</span>
            </Link>
          ) : (
            <Link
              href="/contributions"
              className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-sm transition-all"
            >
              <span>Explore All Monthly Records</span>
              <ArrowUpRight className="w-4 h-4 opacity-75" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
