'use client';

import React, { useState } from 'react';
import { useTreasury } from '@/lib/store';
import { ContributionType } from '@/types';
import { HISTORICAL_MONTHS } from '@/lib/constants';
import {
  HeartHandshake,
  PlusCircle,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  X,
} from 'lucide-react';

export default function AdminContributionsPage() {
  const { members, contributions, addContribution, updateContribution, deleteContribution, settings } = useTreasury();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [month, setMonth] = useState('September');
  const [year, setYear] = useState(2026);
  const [type, setType] = useState<ContributionType>('MONTHLY');
  const [amount, setAmount] = useState<number>(100);
  const [dateReceived, setDateReceived] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    addContribution({
      memberId: member.id,
      memberName: member.name,
      month,
      year,
      type,
      amount: Number(amount),
      dateReceived,
      notes: notes.trim() || undefined,
    });

    setIsAdding(false);
    setNotes('');
  };

  const filtered = contributions.filter((c) => {
    const matchMonth = selectedMonth === 'All' || c.month.toLowerCase() === selectedMonth.toLowerCase();
    const matchName = c.memberName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchMonth && matchName;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-church-dark-900 dark:text-white">
            Manage Contributions
          </h1>
          <p className="text-xs text-slate-500">
            Add manual records, edit existing amounts, or remove duplicate entries.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-church-sky-600 hover:bg-church-sky-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isAdding ? 'Close Entry Form' : 'Add Single Contribution'}</span>
        </button>
      </div>

      {/* Manual Entry Card */}
      {isAdding && (
        <div className="bg-white dark:bg-church-dark-900 p-6 rounded-3xl border border-church-sky-200 dark:border-church-dark-800 shadow-md animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-church-dark-800 pb-3">
            <h3 className="font-bold text-sm text-church-dark-900 dark:text-white">
              Record New Contribution
            </h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Member
              </label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800"
              >
                {HISTORICAL_MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m} 2026
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ContributionType)}
                className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800"
              >
                <option value="MONTHLY">Monthly Contribution</option>
                <option value="TEA">Tea Contribution</option>
                <option value="TEA_URN">Tea Urn Support</option>
                <option value="SPECIAL">Special Gift</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Amount ({settings.currency})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Date Received
              </label>
              <input
                type="date"
                value={dateReceived}
                onChange={(e) => setDateReceived(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional remark..."
                className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-xs text-slate-500 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-church-sky-600 hover:bg-church-sky-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-church-dark-900 p-4 rounded-2xl border border-slate-200 dark:border-church-dark-800 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search member name..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800"
          />
        </div>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800"
        >
          <option value="All">All Months</option>
          {HISTORICAL_MONTHS.map((m) => (
            <option key={m} value={m}>
              {m} 2026
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-church-dark-900 rounded-3xl border border-slate-200 dark:border-church-dark-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-church-dark-950 border-b border-slate-200 dark:border-church-dark-800 text-slate-500 text-[11px] uppercase font-bold">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Month</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Date / Notes</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-church-dark-800/60 font-sans">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-church-dark-800/40">
                  <td className="py-3 px-4 font-semibold text-church-dark-900 dark:text-white">
                    {c.memberName}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {c.month} {c.year}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-church-dark-800">
                      {c.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-church-dark-900 dark:text-white">
                    {settings.currency} {c.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {c.dateReceived}
                    {c.notes && <span className="block text-[10px] text-slate-400">{c.notes}</span>}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete this ${c.type} record for ${c.memberName}?`)) {
                          deleteContribution(c.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-church-rose-600 rounded"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
