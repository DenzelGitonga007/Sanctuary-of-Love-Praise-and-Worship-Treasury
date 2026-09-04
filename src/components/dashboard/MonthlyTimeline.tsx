'use client';

import React from 'react';
import Link from 'next/link';
import { useTreasury } from '@/lib/store';
import {
  Calendar,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Users,
  Coffee,
  HeartHandshake,
  Receipt,
  PlusCircle,
} from 'lucide-react';

export default function MonthlyTimeline() {
  const { monthlyStats, settings, isAdmin } = useTreasury();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-church-dark-900 dark:text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-church-sky-600" />
            <span>Monthly Financial Records (2026)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Comprehensive breakdown of collections and expenditures since April 2026
          </p>
        </div>
        <Link
          href="/contributions"
          className="text-xs sm:text-sm font-semibold text-church-sky-600 hover:text-church-sky-700 flex items-center space-x-1"
        >
          <span>View Matrix Table</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {monthlyStats.map((stat) => {
          const isPositive = stat.netChange >= 0;
          const isBlank = stat.monthlyTotal === 0 && stat.teaTotal === 0 && stat.expensesTotal === 0;

          return (
            <div
              key={`${stat.month}-${stat.year}`}
              className={`relative overflow-hidden rounded-2xl bg-white dark:bg-church-dark-900 border transition-all duration-200 hover:shadow-md flex flex-col justify-between p-5 ${
                isBlank
                  ? 'border-dashed border-slate-300 dark:border-church-dark-800 opacity-90'
                  : 'border-slate-200 dark:border-church-dark-800 shadow-sm'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-church-dark-800">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-church-sky-50 dark:bg-church-sky-950 flex items-center justify-center text-church-sky-600 font-bold text-xs">
                    {stat.month.slice(0, 3)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-church-dark-900 dark:text-white">
                      {stat.month} {stat.year}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {stat.totalContributorsCount > 0
                        ? `${stat.totalContributorsCount} active contributors`
                        : 'Pending records'}
                    </span>
                  </div>
                </div>

                <div
                  className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                    isPositive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-church-rose-50 text-church-rose-700 dark:bg-church-rose-950 dark:text-church-rose-300'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-church-rose-600" />
                  )}
                  <span>
                    Net {isPositive ? '+' : ''}
                    {settings.currency} {stat.netChange.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Data Rows */}
              <div className="py-3 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center space-x-1.5">
                    <HeartHandshake className="w-3.5 h-3.5 text-church-sky-600" />
                    <span>Monthly ({stat.monthlyContributorsCount} members):</span>
                  </span>
                  <span className="font-semibold text-church-dark-900 dark:text-white">
                    {stat.monthlyTotal > 0 ? `${settings.currency} ${stat.monthlyTotal.toLocaleString()}` : '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center space-x-1.5">
                    <Coffee className="w-3.5 h-3.5 text-church-gold-600" />
                    <span>Tea ({stat.teaContributorsCount} members):</span>
                  </span>
                  <span className="font-semibold text-church-dark-900 dark:text-white">
                    {stat.teaTotal > 0 ? `${settings.currency} ${stat.teaTotal.toLocaleString()}` : '—'}
                  </span>
                </div>

                {stat.otherTotal > 0 && (
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center space-x-1.5 text-church-rose-600">
                      <span>✨ Special/Urn:</span>
                    </span>
                    <span className="font-semibold text-church-dark-900 dark:text-white">
                      {settings.currency} {stat.otherTotal.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-church-dark-800/60">
                  <span className="flex items-center space-x-1.5 text-slate-500">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Expenses:</span>
                  </span>
                  <span className="font-semibold text-church-rose-600">
                    {stat.expensesTotal > 0 ? `- ${settings.currency} ${stat.expensesTotal.toLocaleString()}` : 'KES 0'}
                  </span>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-2 border-t border-slate-100 dark:border-church-dark-800 flex items-center justify-between">
                <Link
                  href={`/contributions?month=${stat.month}`}
                  className="w-full text-center py-1.5 text-xs font-semibold text-church-sky-600 hover:text-church-sky-700 bg-church-sky-50 dark:bg-church-sky-950/40 hover:bg-church-sky-100 dark:hover:bg-church-sky-900/60 rounded-lg transition-colors flex items-center justify-center space-x-1"
                >
                  <span>View Full {stat.month} Records</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
