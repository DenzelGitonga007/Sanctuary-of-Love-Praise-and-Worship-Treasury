'use client';

import React, { useState } from 'react';
import { useTreasury } from '@/lib/store';
import { ExpenseCategory } from '@/types';
import {
  Receipt,
  PlusCircle,
  Trash2,
  Coffee,
  Gift,
  Wrench,
  CreditCard,
  X,
  Search,
} from 'lucide-react';

export default function AdminExpensesPage() {
  const { expenses, addExpense, deleteExpense, settings } = useTreasury();
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Tea');
  const [amount, setAmount] = useState<number>(1000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    addExpense({
      description: description.trim(),
      category,
      amount: Number(amount),
      date,
      reference: reference.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setIsAdding(false);
    setDescription('');
    setReference('');
    setNotes('');
  };

  const filtered = expenses.filter((e) =>
    e.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-church-dark-900 dark:text-white">
            Manage Expenditures
          </h1>
          <p className="text-xs text-slate-500">
            Record church praise & worship supplies, fellowship tea, tokens, and instrument expenses.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-church-rose-600 hover:bg-church-rose-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isAdding ? 'Close Form' : 'Record New Expense'}</span>
        </button>
      </div>

      {/* Expense Form */}
      {isAdding && (
        <div className="bg-white dark:bg-church-dark-900 p-6 rounded-3xl border border-church-rose-200 dark:border-church-dark-800 shadow-md animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-church-dark-800 pb-3">
            <h3 className="font-bold text-sm text-church-dark-900 dark:text-white">
              Record Ministry Expenditure
            </h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Tea leaves, sugar, milk and snacks for overnight"
                className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800"
              >
                <option value="Tea">Tea & Snacks</option>
                <option value="Gift">Gift / Celebration</option>
                <option value="Equipment">Equipment / Instruments</option>
                <option value="Transaction Cost">Transaction Fee</option>
                <option value="Transport">Transport</option>
                <option value="Event">Event</option>
                <option value="Other">Other</option>
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
                className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                M-Pesa / Receipt Ref
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. MPESA-TX-09"
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
                className="px-5 py-2 bg-church-rose-600 hover:bg-church-rose-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Save Expense
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-church-dark-900 rounded-3xl border border-slate-200 dark:border-church-dark-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-church-dark-950 border-b border-slate-200 dark:border-church-dark-800 text-slate-500 text-[11px] uppercase font-bold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Ref</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-church-dark-800/60 font-sans">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-church-dark-800/40">
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">{e.date}</td>
                  <td className="py-3 px-4 font-semibold text-church-dark-900 dark:text-white">
                    {e.description}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-church-dark-800">
                      {e.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-church-rose-600">
                    {settings.currency} {e.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-xs text-slate-500 font-mono">
                    {e.reference || '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete expense "${e.description}"?`)) {
                          deleteExpense(e.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-church-rose-600 rounded"
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
