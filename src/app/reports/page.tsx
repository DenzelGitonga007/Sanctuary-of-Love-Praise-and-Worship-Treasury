'use client';

import React from 'react';
import { useTreasury } from '@/lib/store';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Users,
  Receipt,
  TrendingUp,
  HeartHandshake,
  Coffee,
  CheckCircle2,
} from 'lucide-react';

export default function ReportsPage() {
  const { monthlyStats, members, contributions, expenses, settings, currentBalance } = useTreasury();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-church-sky-100 dark:bg-church-sky-950 text-church-sky-700 dark:text-church-sky-300 text-xs font-semibold mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Ministry Audit & Financial Reports</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-church-dark-900 dark:text-white tracking-tight">
            Treasury Transparency Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Sanctuary of Love Worship Center Praise & Worship Team • Dandora, Kenya
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-church-sky-600 dark:hover:bg-church-sky-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print Complete Audit Report</span>
        </button>
      </div>

      {/* Report Summary Card */}
      <div className="bg-white dark:bg-church-dark-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-church-dark-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-church-dark-800 pb-4 gap-2">
          <div>
            <h2 className="text-lg font-bold text-church-dark-900 dark:text-white">
              Executive Financial Overview (2026)
            </h2>
            <span className="text-xs text-slate-400">
              Audit Period: April 2026 – September 2026
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase font-bold text-slate-400">Current Balance</span>
            <p className="text-xl sm:text-2xl font-extrabold text-church-sky-600 font-display">
              {settings.currency} {currentBalance.toLocaleString()}/=
            </p>
          </div>
        </div>

        {/* Monthly Breakdown Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-church-dark-950 border-b border-slate-200 dark:border-church-dark-800 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4 text-right">Monthly Inflow</th>
                <th className="py-3 px-4 text-right">Tea Inflow</th>
                <th className="py-3 px-4 text-right">Special/Urn</th>
                <th className="py-3 px-4 text-right">Expenses</th>
                <th className="py-3 px-4 text-right">Net Movement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-church-dark-800/60 font-sans">
              {monthlyStats.map((stat) => (
                <tr key={`${stat.month}-${stat.year}`}>
                  <td className="py-3.5 px-4 font-semibold text-church-dark-900 dark:text-white">
                    {stat.month} {stat.year}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium">
                    {stat.monthlyTotal > 0 ? `${settings.currency} ${stat.monthlyTotal.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium">
                    {stat.teaTotal > 0 ? `${settings.currency} ${stat.teaTotal.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-purple-600">
                    {stat.otherTotal > 0 ? `${settings.currency} ${stat.otherTotal.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-church-rose-600">
                    {stat.expensesTotal > 0 ? `- ${settings.currency} ${stat.expensesTotal.toLocaleString()}` : 'KES 0'}
                  </td>
                  <td className={`py-3.5 px-4 text-right font-bold ${stat.netChange >= 0 ? 'text-emerald-600' : 'text-church-rose-600'}`}>
                    {stat.netChange >= 0 ? '+' : ''}{settings.currency} {stat.netChange.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
