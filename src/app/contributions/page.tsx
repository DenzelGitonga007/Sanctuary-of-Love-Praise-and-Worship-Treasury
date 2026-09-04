'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTreasury } from '@/lib/store';
import { ContributionType } from '@/types';
import { HISTORICAL_MONTHS } from '@/lib/constants';
import { exportContributionsToCSV, downloadFile } from '@/lib/export';
import {
  HeartHandshake,
  Download,
  Filter,
  Search,
  CheckCircle2,
  Coffee,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';

export default function ContributionsPage() {
  const { members, contributions, settings } = useTreasury();
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered contributions list
  const filteredContributions = contributions.filter((c) => {
    const matchMonth = selectedMonth === 'All' || c.month.toLowerCase() === selectedMonth.toLowerCase();
    const matchType = selectedType === 'All' || c.type === selectedType;
    const matchName = c.memberName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchMonth && matchType && matchName;
  });

  const totalFilteredAmount = filteredContributions.reduce((sum, c) => sum + c.amount, 0);

  const handleExportCSV = () => {
    const csvData = exportContributionsToCSV(filteredContributions);
    downloadFile(csvData, `sol_pw_contributions_${selectedMonth.toLowerCase()}_${Date.now()}.csv`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-church-sky-100 dark:bg-church-sky-950 text-church-sky-700 dark:text-church-sky-300 text-xs font-semibold mb-2">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Praise & Worship Financial Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-church-dark-900 dark:text-white tracking-tight">
            Contributions Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Detailed record of regular monthly giving (KES 100), overnight tea support (KES 100), and special projects.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-church-sky-600 dark:hover:bg-church-sky-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-church-dark-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-church-dark-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member name..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-church-sky-500"
            />
          </div>

          {/* Month Filter */}
          <div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-church-sky-500 font-medium"
            >
              <option value="All">All Months (April – Sept 2026)</option>
              {HISTORICAL_MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m} 2026
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-church-sky-500 font-medium"
            >
              <option value="All">All Contribution Types</option>
              <option value="MONTHLY">Monthly Contribution (KES 100)</option>
              <option value="TEA">Tea Contribution (KES 100)</option>
              <option value="TEA_URN">Tea Urn Drive</option>
              <option value="SPECIAL">Special Giving / Gifts</option>
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-church-dark-800">
          <span>
            Showing <strong>{filteredContributions.length}</strong> recorded contributions
          </span>
          <span className="font-semibold text-church-dark-900 dark:text-white">
            Subtotal: <strong>{settings.currency} {totalFilteredAmount.toLocaleString()}</strong>
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-church-dark-900 rounded-3xl border border-slate-200 dark:border-church-dark-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-church-dark-950 border-b border-slate-200 dark:border-church-dark-800 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4 sm:px-6">Member Name</th>
                <th className="py-3.5 px-4">Period</th>
                <th className="py-3.5 px-4">Contribution Type</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Date / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-church-dark-800/60 font-sans">
              {filteredContributions.length > 0 ? (
                filteredContributions.map((c) => {
                  const isExpected =
                    (c.type === 'MONTHLY' && c.amount >= settings.expectedMonthlyContribution) ||
                    (c.type === 'TEA' && c.amount >= settings.expectedTeaContribution);

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-church-dark-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-church-dark-900 dark:text-white">
                        <Link
                          href={`/members/${c.memberId}`}
                          className="hover:text-church-sky-600 transition-colors"
                        >
                          {c.memberName}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                        {c.month} {c.year}
                      </td>
                      <td className="py-3.5 px-4">
                        {c.type === 'MONTHLY' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-church-sky-50 dark:bg-church-sky-950/60 text-church-sky-700 dark:text-church-sky-300 text-[11px] font-semibold">
                            <HeartHandshake className="w-3 h-3 text-church-sky-500" />
                            <span>Monthly</span>
                          </span>
                        )}
                        {c.type === 'TEA' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-church-gold-50 dark:bg-church-gold-950/60 text-church-gold-800 dark:text-church-gold-300 text-[11px] font-semibold">
                            <Coffee className="w-3 h-3 text-church-gold-600" />
                            <span>Tea</span>
                          </span>
                        )}
                        {c.type === 'TEA_URN' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] font-semibold">
                            <Sparkles className="w-3 h-3 text-purple-500" />
                            <span>Tea Urn</span>
                          </span>
                        )}
                        {!['MONTHLY', 'TEA', 'TEA_URN'].includes(c.type) && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-church-dark-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                            <span>{c.type}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-church-dark-900 dark:text-white">
                        {settings.currency} {c.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {isExpected ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-600 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Contributed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-amber-600 text-xs font-semibold">
                            <span>Partial</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs text-slate-500">
                        {c.dateReceived || 'Recorded'}
                        {c.notes && <span className="block text-[10px] text-slate-400 italic">{c.notes}</span>}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 text-xs italic">
                    No contributions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
