'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTreasury } from '@/lib/store';
import { exportExpensesToCSV, downloadFile } from '@/lib/export';
import {
  Receipt,
  Download,
  Filter,
  Search,
  Coffee,
  Gift,
  Wrench,
  CreditCard,
  PlusCircle,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

export default function ExpensesPage() {
  const { expenses, settings, isAdmin } = useTreasury();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = expenses.filter((e) => {
    const matchCat = selectedCategory === 'All' || e.category === selectedCategory;
    const matchSearch =
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.reference && e.reference.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const totalFiltered = filtered.reduce((sum, e) => sum + e.amount, 0);

  const handleExportCSV = () => {
    const csvData = exportExpensesToCSV(filtered);
    downloadFile(csvData, `sol_pw_expenses_${Date.now()}.csv`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Tea':
        return <Coffee className="w-4 h-4 text-church-gold-600" />;
      case 'Gift':
        return <Gift className="w-4 h-4 text-church-rose-600" />;
      case 'Equipment':
        return <Wrench className="w-4 h-4 text-church-sky-600" />;
      case 'Transaction Cost':
        return <CreditCard className="w-4 h-4 text-slate-500" />;
      default:
        return <Receipt className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-church-rose-100 dark:bg-church-rose-950 text-church-rose-700 dark:text-church-rose-300 text-xs font-semibold mb-2">
            <Receipt className="w-3.5 h-3.5" />
            <span>Treasury Expenditure & Disbursements</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-church-dark-900 dark:text-white tracking-tight">
            Team Expenses Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Complete transparency on tea supplies, instruments, gifts, sound accessories, and transaction fees.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isAdmin && (
            <Link
              href="/admin/expenses"
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-church-rose-600 hover:bg-church-rose-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record Expense</span>
            </Link>
          )}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-church-dark-800 dark:hover:bg-church-dark-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
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
              placeholder="Search expense description or reference..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-church-sky-500"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-church-sky-500 font-medium"
            >
              <option value="All">All Categories</option>
              <option value="Tea">Tea & Snacks Supplies</option>
              <option value="Gift">Gifts & Celebrations</option>
              <option value="Equipment">Equipment & Instruments</option>
              <option value="Transaction Cost">Carrier & Withdrawal Fees</option>
              <option value="Transport">Transport</option>
              <option value="Other">Other Disbursements</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-church-dark-800">
          <span>
            Showing <strong>{filtered.length}</strong> recorded expenditures
          </span>
          <span className="font-semibold text-church-rose-600">
            Total Disbursed: <strong>{settings.currency} {totalFiltered.toLocaleString()}</strong>
          </span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-church-dark-900 rounded-3xl border border-slate-200 dark:border-church-dark-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-church-dark-950 border-b border-slate-200 dark:border-church-dark-800 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4 sm:px-6">Date</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-right">Reference / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-church-dark-800/60 font-sans">
              {filtered.map((exp) => (
                <tr
                  key={exp.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-church-dark-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 sm:px-6 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {exp.date}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-church-dark-900 dark:text-white max-w-sm">
                    {exp.description}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-church-dark-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                      {getCategoryIcon(exp.category)}
                      <span>{exp.category}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-church-rose-600 font-display">
                    {settings.currency} {exp.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right text-xs text-slate-500">
                    <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {exp.reference || '—'}
                    </span>
                    {exp.notes && (
                      <span className="block text-[10px] text-slate-400 italic">{exp.notes}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 dark:bg-church-dark-950 font-bold border-t-2 border-slate-200 dark:border-church-dark-800 text-church-dark-900 dark:text-white">
                <td colSpan={3} className="py-3.5 px-4 sm:px-6 uppercase text-xs">
                  Total Expenditure
                </td>
                <td className="py-3.5 px-4 text-right text-church-rose-600 text-sm font-display">
                  {settings.currency} {totalFiltered.toLocaleString()}/=
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
