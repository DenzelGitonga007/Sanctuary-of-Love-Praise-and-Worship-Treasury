'use client';

import React from 'react';
import Link from 'next/link';
import { useTreasury } from '@/lib/store';
import {
  Sparkles,
  HeartHandshake,
  Receipt,
  Users,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const {
    currentBalance,
    totalMonthly,
    totalTea,
    totalOther,
    totalExpenses,
    members,
    contributions,
    monthlyStats,
    settings,
  } = useTreasury();

  const septemberStat = monthlyStats.find((s) => s.month.toLowerCase() === 'september') || {
    monthlyTotal: 0,
    teaTotal: 0,
    expensesTotal: 0,
    totalContributorsCount: 0,
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-church-dark-900 via-church-sky-950 to-church-dark-900 text-white p-6 sm:p-8 border border-church-sky-800/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-church-sky-500/20 border border-church-sky-400/30 text-church-sky-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Treasurer Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Praise & Worship Treasury
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Logged in as Ministry Treasurer • Sanctuary of Love Worship Center, Dandora
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/import"
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-church-sky-500 to-church-sky-600 hover:from-church-sky-400 hover:to-church-sky-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all hover:scale-102"
          >
            <Sparkles className="w-4 h-4 text-church-gold-300" />
            <span>Import List</span>
          </Link>
          <Link
            href="/admin/expenses"
            className="flex items-center space-x-2 px-4 py-2.5 bg-church-rose-600 hover:bg-church-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
          >
            <Receipt className="w-4 h-4" />
            <span>Record Expense</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-church-dark-900 border border-slate-200 dark:border-church-dark-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Live Treasury Balance</span>
          <p className="text-2xl font-extrabold text-church-sky-600 font-display mt-1">
            {settings.currency} {currentBalance.toLocaleString()}/=
          </p>
          <span className="text-[11px] text-slate-400">Double-entry verified</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-church-dark-900 border border-slate-200 dark:border-church-dark-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Inflows (All Months)</span>
          <p className="text-2xl font-extrabold text-emerald-600 font-display mt-1">
            {settings.currency} {(totalMonthly + totalTea + totalOther).toLocaleString()}/=
          </p>
          <span className="text-[11px] text-slate-400">{contributions.length} recorded contributions</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-church-dark-900 border border-slate-200 dark:border-church-dark-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Disbursements</span>
          <p className="text-2xl font-extrabold text-church-rose-600 font-display mt-1">
            {settings.currency} {totalExpenses.toLocaleString()}/=
          </p>
          <span className="text-[11px] text-slate-400">Tea, gifts, equipment & fees</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-church-dark-900 border border-slate-200 dark:border-church-dark-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Team Roster</span>
          <p className="text-2xl font-extrabold text-church-dark-900 dark:text-white font-display mt-1">
            {members.filter((m) => m.active).length} Active
          </p>
          <span className="text-[11px] text-slate-400">Total members registered</span>
        </div>
      </div>

      {/* September Status Callout */}
      <div className="p-6 rounded-3xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm sm:text-base text-amber-900 dark:text-amber-200">
              September 2026 Records Status
            </h3>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              {septemberStat.totalContributorsCount > 0
                ? `${septemberStat.totalContributorsCount} contributions recorded for September.`
                : 'September contributions have not been fully uploaded yet. Paste your WhatsApp/ChatGPT list in the import tool to update!'}
            </p>
          </div>
        </div>

        <Link
          href="/admin/import"
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs whitespace-nowrap self-start md:self-auto"
        >
          Import September List
        </Link>
      </div>
    </div>
  );
}
