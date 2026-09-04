'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTreasury } from '@/lib/store';
import { ShieldCheck, Lock, ArrowRight, HeartHandshake, Key } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginAsAdmin } = useTreasury();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAsAdmin(passcode);
    if (success) {
      router.push('/admin');
    } else {
      setError(true);
    }
  };

  const handleDemoLogin = () => {
    loginAsAdmin('treasurer2026');
    router.push('/admin');
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-fade-in">
      <div className="bg-white dark:bg-church-dark-900 rounded-3xl p-8 border border-slate-200 dark:border-church-dark-800 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-church-sky-600 to-church-sky-400 mx-auto flex items-center justify-center text-white shadow-lg shadow-church-sky-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-church-dark-900 dark:text-white">
            Treasurer Administration
          </h2>
          <p className="text-xs text-slate-500">
            Secure access to upload records, record expenses, and manage members.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Treasurer Access Passcode
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError(false);
                }}
                placeholder="Enter passcode (e.g., treasurer2026)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-church-dark-700 bg-slate-50 dark:bg-church-dark-950 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-church-sky-500"
              />
            </div>
            {error && (
              <p className="text-xs text-church-rose-600 font-semibold mt-1.5">
                Incorrect passcode. (Demo passcode: <code>treasurer2026</code>)
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-church-sky-600 to-church-sky-500 hover:from-church-sky-500 hover:to-church-sky-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-98"
          >
            <span>Log In to Admin</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access */}
        <div className="pt-4 border-t border-slate-100 dark:border-church-dark-800 text-center">
          <p className="text-[11px] text-slate-400 mb-2">
            Default Treasurer Passcode: <code>treasurer2026</code>
          </p>
          <button
            onClick={handleDemoLogin}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-church-sky-600 hover:text-church-sky-700"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Click to One-Click Demo Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}
