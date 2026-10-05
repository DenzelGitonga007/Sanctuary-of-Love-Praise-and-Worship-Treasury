'use client';

import React, { useState } from 'react';
import { useTreasury } from '@/lib/store';
import { MONTHS } from '@/lib/constants';
import {
  Calendar,
  PlusCircle,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  TrendingUp,
  HeartHandshake,
  Coffee,
} from 'lucide-react';

export default function ManageMonthsPage() {
  const {
    activePeriods,
    addPeriod,
    removePeriod,
    contributions,
    monthlyStats,
    settings,
  } = useTreasury();

  // Form state
  const [newMonth, setNewMonth] = useState('');
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const flash = (msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(msg);
      setSuccessMsg(null);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMonth) {
      flash('Please select a month.', 'error');
      return;
    }
    const already = activePeriods.some(
      (p) => p.month === newMonth && p.year === newYear
    );
    if (already) {
      flash(`${newMonth} ${newYear} is already an active period.`, 'error');
      return;
    }
    addPeriod(newMonth, newYear);
    flash(`✓ ${newMonth} ${newYear} has been added as a new contribution period. All dropdowns and dashboards are now updated.`);
    setNewMonth('');
  };

  const handleRemove = (month: string, year: number) => {
    const contribCount = contributions.filter(
      (c) => c.month === month && c.year === year
    ).length;

    const warning = contribCount > 0
      ? `⚠️ Warning: This period has ${contribCount} recorded contribution(s).\n\nThe contributions will NOT be deleted — only the period will be removed from active dropdowns. The data will still appear if filtered by "All Months".\n\nProceed?`
      : `Remove ${month} ${year} from active periods?\n\nThis will hide it from month dropdowns. No data will be deleted.`;

    if (!confirm(warning)) return;
    removePeriod(month, year);
    flash(`${month} ${year} removed from active periods.`);
  };

  // Available months to add (not already in activePeriods)
  const availableYears = [2025, 2026, 2027, 2028];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-church-sky-100 dark:bg-church-sky-950 text-church-sky-700 dark:text-church-sky-300 text-xs font-semibold mb-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>Contribution Period Management</span>
        </div>
        <h1 className="text-2xl font-bold text-church-dark-900 dark:text-white">
          Manage Months
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Create new contribution months to start recording member contributions for that period.
          Each active period appears in all month dropdowns across the system — contributions, imports, reports, and the timeline.
        </p>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="flex items-start space-x-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-start space-x-3 px-4 py-3 bg-church-rose-50 dark:bg-church-rose-950/40 border border-church-rose-300 dark:border-church-rose-700 rounded-2xl text-church-rose-800 dark:text-church-rose-300 text-xs font-semibold animate-fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Info Banner */}
      <div className="flex items-start space-x-3 p-4 bg-church-sky-50 dark:bg-church-sky-950/30 border border-church-sky-200 dark:border-church-sky-900 rounded-2xl">
        <Info className="w-4 h-4 text-church-sky-600 shrink-0 mt-0.5" />
        <div className="text-xs text-church-sky-800 dark:text-church-sky-300 space-y-1">
          <p><strong>How it works:</strong> Adding a new period (e.g. <em>November 2026</em>) makes it available in all month dropdowns across the system — contributions page, admin contributions, import tool, and the dashboard timeline.</p>
          <p>Once added, you can immediately start recording contributions for that month via the <strong>Import Lists</strong> or <strong>Contributions</strong> admin tools.</p>
        </div>
      </div>

      {/* Add New Period Form */}
      <div className="bg-white dark:bg-church-dark-900 rounded-3xl border border-church-sky-200 dark:border-church-dark-800 shadow-md p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-church-dark-800 pb-3">
          <PlusCircle className="w-4 h-4 text-church-sky-600" />
          <h2 className="font-bold text-sm text-church-dark-900 dark:text-white">Open New Contribution Period</h2>
        </div>

        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
              Month
            </label>
            <select
              value={newMonth}
              onChange={(e) => setNewMonth(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-church-sky-500"
            >
              <option value="">— Select month —</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
              Year
            </label>
            <select
              value={newYear}
              onChange={(e) => setNewYear(Number(e.target.value))}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-church-sky-500"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 px-5 py-2.5 bg-church-sky-600 hover:bg-church-sky-700 text-white text-sm font-bold rounded-xl shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Period</span>
            </button>
          </div>
        </form>

        <p className="text-[11px] text-slate-400">
          Tip: The selected month &amp; year will immediately appear in all contribution dropdowns across the system — contributions, import tool, admin panel, and the monthly timeline on the dashboard.
        </p>
      </div>

      {/* Active Periods List */}
      <div className="bg-white dark:bg-church-dark-900 rounded-3xl border border-slate-200 dark:border-church-dark-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-church-dark-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-church-sky-600" />
            <h2 className="font-bold text-sm text-church-dark-900 dark:text-white">
              Active Contribution Periods
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {activePeriods.length} period{activePeriods.length !== 1 ? 's' : ''} configured
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-church-dark-800/60">
          {activePeriods.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No active periods configured. Add one above.
            </div>
          ) : (
            activePeriods.map((period) => {
              const stat = monthlyStats.find(
                (s) => s.month === period.month && s.year === period.year
              );
              const hasData = (stat?.totalContributorsCount ?? 0) > 0;
              const contribCount = contributions.filter(
                (c) => c.month === period.month && c.year === period.year
              ).length;

              return (
                <div
                  key={`${period.month}-${period.year}`}
                  className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-church-dark-800/40 transition-colors"
                >
                  {/* Period info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-church-sky-50 dark:bg-church-sky-950/60 flex flex-col items-center justify-center text-church-sky-700 dark:text-church-sky-300 border border-church-sky-100 dark:border-church-sky-900">
                      <span className="text-[10px] font-bold uppercase">{period.month.slice(0, 3)}</span>
                      <span className="text-[10px] font-medium text-church-sky-500">{period.year}</span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-church-dark-900 dark:text-white">
                        {period.month} {period.year}
                      </h3>
                      {hasData ? (
                        <div className="flex items-center space-x-3 mt-0.5">
                          <span className="flex items-center space-x-1 text-[11px] text-emerald-600 font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{contribCount} contributions recorded</span>
                          </span>
                          {stat && (
                            <span className="text-[11px] text-slate-400">
                              · {settings.currency} {(stat.monthlyTotal + stat.teaTotal + stat.otherTotal).toLocaleString()} collected
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-600 font-medium flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>No contributions recorded yet</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats + Actions */}
                  <div className="flex items-center space-x-3">
                    {stat && hasData && (
                      <div className="hidden sm:flex items-center space-x-3 mr-2">
                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-[11px] text-church-sky-700 dark:text-church-sky-300">
                            <HeartHandshake className="w-3 h-3" />
                            <span className="font-semibold">{settings.currency} {stat.monthlyTotal.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-[11px] text-church-gold-700 dark:text-church-gold-400">
                            <Coffee className="w-3 h-3" />
                            <span className="font-semibold">{settings.currency} {stat.teaTotal.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-church-dark-700" />
                        <div className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${stat.netChange >= 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-church-rose-50 text-church-rose-700'}`}>
                          <TrendingUp className="w-3 h-3" />
                          <span>Net {stat.netChange >= 0 ? '+' : ''}{settings.currency} {stat.netChange.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => handleRemove(period.month, period.year)}
                      className="p-2 text-slate-400 hover:text-church-rose-600 hover:bg-church-rose-50 dark:hover:bg-church-rose-950/40 rounded-lg transition-colors"
                      title={`Remove ${period.month} ${period.year} from active periods`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Help Note */}
      <div className="p-4 bg-slate-50 dark:bg-church-dark-950 border border-slate-200 dark:border-church-dark-800 rounded-2xl text-xs text-slate-500 space-y-1.5">
        <p className="font-semibold text-slate-600 dark:text-slate-300">📌 Notes for the Treasurer</p>
        <ul className="list-disc ml-4 space-y-1">
          <li>Removing a period does <strong>not</strong> delete any contribution data — it only hides it from month selection dropdowns.</li>
          <li>If you accidentally remove a period that has contributions, the data is safe. Just re-add the period to restore it in dropdowns.</li>
          <li>Periods are sorted chronologically (oldest → newest) across the entire system.</li>
          <li>Adding a new period updates the dashboard timeline, all contribution dropdowns, and the import tool — immediately, with no code changes required.</li>
        </ul>
      </div>
    </div>
  );
}
