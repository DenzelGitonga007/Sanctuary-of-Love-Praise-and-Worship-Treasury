'use client';

import React, { useState, useMemo } from 'react';
import { useTreasury } from '@/lib/store';
import { ContributionType } from '@/types';
import { HISTORICAL_MONTHS, MONTHS } from '@/lib/constants';
import {
  HeartHandshake,
  PlusCircle,
  Trash2,
  CheckSquare,
  Square,
  Search,
  X,
  AlertTriangle,
  CheckCircle2,
  Edit3,
} from 'lucide-react';

const TYPE_LABELS: Record<ContributionType, string> = {
  MONTHLY: 'Monthly',
  TEA: 'Tea',
  TEA_URN: 'Tea Urn',
  SPECIAL: 'Special',
  OTHER: 'Other',
};

const TYPE_COLORS: Record<ContributionType, string> = {
  MONTHLY: 'bg-church-sky-100 dark:bg-church-sky-900/40 text-church-sky-800 dark:text-church-sky-300',
  TEA: 'bg-church-gold-100 dark:bg-church-gold-900/40 text-church-gold-800 dark:text-church-gold-300',
  TEA_URN: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300',
  SPECIAL: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300',
  OTHER: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
};

export default function AdminContributionsPage() {
  const {
    members,
    contributions,
    addContribution,
    updateContribution,
    deleteContribution,
    deleteContributionsByMonth,
    bulkDeleteContributions,
    settings,
  } = useTreasury();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [isAdding, setIsAdding] = useState(false);

  // Selection state for bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');

  // Form state for new contribution
  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [month, setMonth] = useState('September');
  const [year] = useState(2026);
  const [type, setType] = useState<ContributionType>('MONTHLY');
  const [amount, setAmount] = useState<number>(100);
  const [dateReceived, setDateReceived] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return contributions.filter((c) => {
      const matchMonth = selectedMonth === 'All' || c.month.toLowerCase() === selectedMonth.toLowerCase();
      const matchType = selectedType === 'All' || c.type === selectedType;
      const matchName = c.memberName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchMonth && matchType && matchName;
    });
  }, [contributions, selectedMonth, selectedType, searchQuery]);

  const allSelected = filtered.length > 0 && filtered.every((c) => selectedIds.has(c.id));
  const someSelected = selectedIds.size > 0;
  const selectedTotal = contributions
    .filter((c) => selectedIds.has(c.id))
    .reduce((s, c) => s + c.amount, 0);

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

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
    flash('Contribution saved.');
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)));
    }
  };

  const handleBulkDelete = () => {
    if (!confirm(`Permanently delete ${selectedIds.size} selected record(s)? This cannot be undone.`)) return;
    const count = bulkDeleteContributions(Array.from(selectedIds));
    setSelectedIds(new Set());
    flash(`Deleted ${count} record(s).`);
  };

  const handleWipeMonth = () => {
    if (selectedMonth === 'All') return;
    const count = contributions.filter(
      (c) => c.month.toLowerCase() === selectedMonth.toLowerCase() && c.year === 2026
        && (selectedType === 'All' || c.type === selectedType)
    ).length;
    if (!confirm(`This will permanently delete ALL ${count} contribution record(s) for ${selectedMonth} 2026${selectedType !== 'All' ? ` (${selectedType})` : ''}.\n\nType "yes" in the next prompt to confirm.`)) return;
    const confirmed = prompt(`Type YES to confirm wiping ${selectedMonth} 2026 records:`);
    if (confirmed?.toUpperCase() !== 'YES') return;
    const deleted = deleteContributionsByMonth(selectedMonth, 2026, selectedType !== 'All' ? selectedType as ContributionType : undefined);
    setSelectedIds(new Set());
    flash(`Wiped ${deleted} record(s) for ${selectedMonth} 2026.`);
  };

  const startEdit = (id: string, currentAmount: number) => {
    setEditingId(id);
    setEditAmount(String(currentAmount));
  };

  const commitEdit = (id: string) => {
    const parsed = parseFloat(editAmount);
    if (!isNaN(parsed) && parsed > 0) {
      updateContribution(id, { amount: parsed });
      flash('Amount updated.');
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Success Banner */}
      {successMsg && (
        <div className="flex items-center space-x-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-church-dark-900 dark:text-white">
            Manage Contributions
          </h1>
          <p className="text-xs text-slate-500">
            Add, edit, bulk-delete, or wipe an entire month&apos;s records.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-church-sky-600 hover:bg-church-sky-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isAdding ? 'Close Form' : 'Add Single Contribution'}</span>
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="bg-white dark:bg-church-dark-900 p-6 rounded-3xl border border-church-sky-200 dark:border-church-dark-800 shadow-md animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-church-dark-800 pb-3">
            <h3 className="font-bold text-sm text-church-dark-900 dark:text-white flex items-center space-x-2">
              <HeartHandshake className="w-4 h-4 text-church-sky-600" />
              <span>Record New Contribution</span>
            </h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Member</label>
              <select value={memberId} onChange={(e) => setMemberId(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800">
                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Month</label>
              <select value={month} onChange={(e) => setMonth(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800">
                {MONTHS.map((m) => <option key={m} value={m}>{m} {year}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as ContributionType)}
                className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800">
                <option value="MONTHLY">Monthly Contribution</option>
                <option value="TEA">Tea Contribution</option>
                <option value="TEA_URN">Tea Urn Support</option>
                <option value="SPECIAL">Special Project</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Amount ({settings.currency})</label>
              <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} required
                className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 font-semibold" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Date Received</label>
              <input type="date" value={dateReceived} onChange={(e) => setDateReceived(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Notes</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional..."
                className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800" />
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs text-slate-500 font-medium">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-church-sky-600 hover:bg-church-sky-700 text-white font-bold text-xs rounded-xl shadow-xs">Save Record</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters + Bulk Actions */}
      <div className="bg-white dark:bg-church-dark-900 p-4 rounded-2xl border border-slate-200 dark:border-church-dark-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member name..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800" />
          </div>

          <select value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); setSelectedIds(new Set()); }}
            className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800">
            <option value="All">All Months</option>
            {HISTORICAL_MONTHS.map((m) => <option key={m} value={m}>{m} 2026</option>)}
          </select>

          <select value={selectedType} onChange={(e) => { setSelectedType(e.target.value); setSelectedIds(new Set()); }}
            className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800">
            <option value="All">All Types</option>
            <option value="MONTHLY">Monthly</option>
            <option value="TEA">Tea</option>
            <option value="TEA_URN">Tea Urn</option>
            <option value="SPECIAL">Special</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Bulk Action Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-500 font-medium">
            Showing <strong>{filtered.length}</strong> records
            {filtered.length > 0 && (
              <span className="ml-1">
                · Subtotal: <strong>KES {filtered.reduce((s, c) => s + c.amount, 0).toLocaleString()}</strong>
              </span>
            )}
          </span>

          <div className="flex-1" />

          {someSelected && (
            <>
              <span className="text-xs text-church-sky-700 dark:text-church-sky-400 font-semibold">
                {selectedIds.size} selected · KES {selectedTotal.toLocaleString()}
              </span>
              <button
                onClick={handleBulkDelete}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-church-rose-600 hover:bg-church-rose-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedIds.size})</span>
              </button>
            </>
          )}

          {selectedMonth !== 'All' && (
            <button
              onClick={handleWipeMonth}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Wipe {selectedMonth}{selectedType !== 'All' ? ` (${selectedType})` : ''}</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-church-dark-900 rounded-3xl border border-slate-200 dark:border-church-dark-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-church-dark-950 border-b border-slate-200 dark:border-church-dark-800 text-slate-500 text-[11px] uppercase font-bold">
                <th className="py-3 px-3">
                  <button onClick={toggleSelectAll} className="flex items-center">
                    {allSelected
                      ? <CheckSquare className="w-4 h-4 text-church-sky-600" />
                      : <Square className="w-4 h-4 text-slate-400" />}
                  </button>
                </th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Month</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Date / Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-church-dark-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No contributions match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-slate-50 dark:hover:bg-church-dark-800/40 transition-colors ${selectedIds.has(c.id) ? 'bg-church-sky-50 dark:bg-church-sky-950/30' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3">
                      <button onClick={() => toggleSelect(c.id)}>
                        {selectedIds.has(c.id)
                          ? <CheckSquare className="w-4 h-4 text-church-sky-600" />
                          : <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />}
                      </button>
                    </td>

                    <td className="py-3 px-4 font-semibold text-church-dark-900 dark:text-white">
                      {c.memberName}
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {c.month} {c.year}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${TYPE_COLORS[c.type]}`}>
                        {TYPE_LABELS[c.type]}
                      </span>
                    </td>

                    {/* Inline editable amount */}
                    <td className="py-3 px-4 font-bold text-church-dark-900 dark:text-white">
                      {editingId === c.id ? (
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          onBlur={() => commitEdit(c.id)}
                          onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(c.id); if (e.key === 'Escape') setEditingId(null); }}
                          autoFocus
                          className="w-24 px-2 py-1 text-xs font-bold border border-church-sky-400 rounded-lg bg-white dark:bg-church-dark-800"
                        />
                      ) : (
                        <button
                          onClick={() => startEdit(c.id, c.amount)}
                          className="flex items-center space-x-1 hover:text-church-sky-600 group"
                          title="Click to edit amount"
                        >
                          <span>{settings.currency} {c.amount.toLocaleString()}</span>
                          <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                        </button>
                      )}
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-500">
                      {c.dateReceived}
                      {c.notes && <span className="block text-[10px] text-slate-400">{c.notes}</span>}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${c.type} record for ${c.memberName}?`)) deleteContribution(c.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-church-rose-600 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
