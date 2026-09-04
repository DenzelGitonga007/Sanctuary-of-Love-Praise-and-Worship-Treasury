'use client';

import React, { useState } from 'react';
import { useTreasury } from '@/lib/store';
import {
  Settings,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Building,
  Coins,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { settings, updateSettings, resetToInitialData } = useTreasury();
  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (
      confirm(
        'Are you sure you want to reset all records to the original seed data (April - August 2026)? Any unsaved tests will be cleared.'
      )
    ) {
      resetToInitialData();
      setFormData(settings);
      alert('Data reset to baseline initial dataset.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-church-dark-900 dark:text-white flex items-center space-x-2">
          <Settings className="w-6 h-6 text-church-sky-600" />
          <span>Treasury System Settings</span>
        </h1>
        <p className="text-xs text-slate-500">
          Configure ministry details, expected contribution targets, and currency formats.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 flex items-center space-x-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings successfully saved and applied to entire treasury!</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-church-dark-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-church-dark-800 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-church-dark-800 pb-4">
          <h3 className="font-bold text-sm text-church-dark-900 dark:text-white flex items-center space-x-2">
            <Building className="w-4 h-4 text-church-sky-600" />
            <span>Church & Ministry Profile</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Organization Name
            </label>
            <input
              type="text"
              value={formData.organizationName}
              onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
              className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Ministry / Team Name
            </label>
            <input
              type="text"
              value={formData.teamName}
              onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
              className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Currency Symbol
            </label>
            <input
              type="text"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-slate-900 dark:text-white font-bold"
            />
          </div>
        </div>

        <div className="border-b border-slate-100 dark:border-church-dark-800 pb-4 pt-2">
          <h3 className="font-bold text-sm text-church-dark-900 dark:text-white flex items-center space-x-2">
            <Coins className="w-4 h-4 text-church-gold-600" />
            <span>Contribution Benchmarks & Targets</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Monthly Expected ({formData.currency})
            </label>
            <input
              type="number"
              value={formData.expectedMonthlyContribution}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  expectedMonthlyContribution: Number(e.target.value),
                })
              }
              className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Tea Expected ({formData.currency})
            </label>
            <input
              type="number"
              value={formData.expectedTeaContribution}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  expectedTeaContribution: Number(e.target.value),
                })
              }
              className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Tea Urn Target ({formData.currency})
            </label>
            <input
              type="number"
              value={formData.expectedTeaUrnContribution}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  expectedTeaUrnContribution: Number(e.target.value),
                })
              }
              className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-slate-900 dark:text-white font-bold"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-church-dark-800 flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 bg-church-sky-600 hover:bg-church-sky-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Reset Data */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-3xl p-6 border border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-rose-900 dark:text-rose-200 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Restore Initial Seed Records</span>
          </h4>
          <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
            Reset all data back to the clean April – August 2026 historical baseline and initial 21 members.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Database</span>
        </button>
      </div>
    </div>
  );
}
