'use client';

import React, { useState } from 'react';
import { useTreasury } from '@/lib/store';
import { generateWhatsAppMonthlySummary } from '@/lib/export';
import { X, Copy, Check, MessageSquare, Sparkles } from 'lucide-react';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMonth?: string;
}

export default function WhatsAppModal({ isOpen, onClose, defaultMonth = 'September' }: WhatsAppModalProps) {
  const { members, contributions, monthlyStats, currentBalance, activePeriods } = useTreasury();
  const defaultPeriod = activePeriods[activePeriods.length - 1] || { month: defaultMonth, year: new Date().getFullYear() };
  const [selectedMonth, setSelectedMonth] = useState(defaultPeriod.month);
  const [selectedYear, setSelectedYear] = useState(defaultPeriod.year);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const stat = monthlyStats.find(
    (s) => s.month.toLowerCase() === selectedMonth.toLowerCase() && s.year === selectedYear
  ) || {
    monthlyTotal: 0,
    teaTotal: 0,
    otherTotal: 0,
    expensesTotal: 0,
  };

  const messageText = generateWhatsAppMonthlySummary(
    selectedMonth,
    selectedYear,
    stat.monthlyTotal,
    stat.teaTotal,
    stat.otherTotal,
    stat.expensesTotal,
    currentBalance,
    members,
    contributions
  );

  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-church-dark-900 rounded-2xl shadow-2xl max-w-xl w-full border border-church-sky-200 dark:border-church-dark-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <MessageSquare className="w-5 h-5 text-church-gold-300" />
            <div>
              <h3 className="font-bold text-base">WhatsApp Group Summary Generator</h3>
              <p className="text-xs text-emerald-100">Ready to post into Sanctuary of Love WhatsApp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Month Selector */}
        <div className="p-4 bg-slate-50 dark:bg-church-dark-950 border-b border-slate-200 dark:border-church-dark-800 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Select Month:
          </span>
          <select
            value={`${selectedMonth}|${selectedYear}`}
            onChange={(e) => {
              const [m, y] = e.target.value.split('|');
              setSelectedMonth(m);
              setSelectedYear(Number(y));
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500"
          >
            {activePeriods.map((p) => (
              <option key={`${p.month}-${p.year}`} value={`${p.month}|${p.year}`}>
                {p.month} {p.year}
              </option>
            ))}
          </select>
        </div>

        {/* Message Preview */}
        <div className="p-5 overflow-y-auto flex-1 font-mono text-xs leading-relaxed bg-slate-900 text-slate-200 whitespace-pre-wrap select-all rounded-lg m-4 border border-slate-700">
          {messageText}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-church-dark-800 bg-white dark:bg-church-dark-900 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-church-dark-800 rounded-xl"
          >
            Close
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy WhatsApp Message'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
