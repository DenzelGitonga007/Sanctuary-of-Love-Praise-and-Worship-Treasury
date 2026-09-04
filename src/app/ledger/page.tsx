'use client';

import React, { useState } from 'react';
import { useTreasury } from '@/lib/store';
import {
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Download,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { downloadFile } from '@/lib/export';

interface LedgerItem {
  id: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  category: string;
  amount: number;
  reference?: string;
  notes?: string;
}

export default function LedgerPage() {
  const { contributions, expenses, settings, currentBalance } = useTreasury();
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Assemble full transaction ledger sorted chronologically
  const incomeItems: LedgerItem[] = contributions.map((c) => ({
    id: c.id,
    date: c.dateReceived || '2026-04-01',
    type: 'INCOME',
    description: `${c.memberName} (${c.type} - ${c.month} ${c.year})`,
    category: c.type,
    amount: c.amount,
    notes: c.notes,
  }));

  const expenseItems: LedgerItem[] = expenses.map((e) => ({
    id: e.id,
    date: e.date,
    type: 'EXPENSE',
    description: e.description,
    category: e.category,
    amount: e.amount,
    reference: e.reference,
    notes: e.notes,
  }));

  const allItems = [...incomeItems, ...expenseItems].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filtered = allItems.filter((item) => {
    const matchType = filterType === 'ALL' || item.type === filterType;
    const matchSearch =
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  const handleExport = () => {
    const headers = ['ID', 'Date', 'Type', 'Description', 'Category', 'Amount (KES)', 'Reference'];
    const rows = filtered.map((i) => [
      `"${i.id}"`,
      `"${i.date}"`,
      `"${i.type}"`,
      `"${i.description.replace(/"/g, '""')}"`,
      `"${i.category}"`,
      i.amount,
      `"${i.reference || ''}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadFile(csv, `sol_pw_treasury_ledger_${Date.now()}.csv`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-church-sky-100 dark:bg-church-sky-950 text-church-sky-700 dark:text-church-sky-300 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Double-Entry Treasury Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-church-dark-900 dark:text-white tracking-tight">
            Complete Financial Transaction Journal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Live movement audit tracking every shilling collected and disbursed in the Praise & Worship fund.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-church-dark-800 dark:hover:bg-church-dark-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-church-dark-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-church-dark-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ledger entries..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-church-sky-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            {(['ALL', 'INCOME', 'EXPENSE'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  filterType === type
                    ? 'bg-church-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-church-dark-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {type === 'ALL' ? 'All Movements' : type === 'INCOME' ? 'Inflows Only' : 'Disbursements Only'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-church-dark-900 rounded-3xl border border-slate-200 dark:border-church-dark-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-church-dark-950 border-b border-slate-200 dark:border-church-dark-800 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4 sm:px-6">Date</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Fund Category</th>
                <th className="py-3.5 px-4 text-right">Inflow (+)</th>
                <th className="py-3.5 px-4 text-right">Outflow (-)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-church-dark-800/60 font-sans">
              {filtered.map((item) => {
                const isIncome = item.type === 'INCOME';
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-church-dark-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 sm:px-6 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-3.5 px-4">
                      {isIncome ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                          <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                          <span>Income</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-church-rose-50 dark:bg-church-rose-950 text-church-rose-700 dark:text-church-rose-300 text-[11px] font-semibold">
                          <ArrowDownRight className="w-3 h-3 text-church-rose-600" />
                          <span>Expense</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-church-dark-900 dark:text-white">
                      {item.description}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                      {isIncome ? `${settings.currency} ${item.amount.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-church-rose-600">
                      {!isIncome ? `- ${settings.currency} ${item.amount.toLocaleString()}` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
