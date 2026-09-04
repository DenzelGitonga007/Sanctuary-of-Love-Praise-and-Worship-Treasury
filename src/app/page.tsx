'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTreasury } from '@/lib/store';
import BalanceHero from '@/components/dashboard/BalanceHero';
import SummaryCards from '@/components/dashboard/SummaryCards';
import MonthlyTimeline from '@/components/dashboard/MonthlyTimeline';
import QuickCharts from '@/components/dashboard/QuickCharts';
import WhatsAppModal from '@/components/ui/WhatsAppModal';
import QRCodeModal from '@/components/ui/QRCodeModal';
import {
  Search,
  Users,
  Receipt,
  BookOpen,
  MessageSquare,
  QrCode,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function HomePage() {
  const { members, contributions, expenses, settings, isAdmin } = useTreasury();
  const [searchTerm, setSearchTerm] = useState('');
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Filter members for quick search
  const filteredMembers = searchTerm.trim()
    ? members.filter((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* 1. Hero Balance */}
      <BalanceHero onOpenShareModal={() => setWhatsappModalOpen(true)} />

      {/* 2. Key Action Banner for WhatsApp Sharing & Noticeboard QR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-church-dark-900 border border-church-sky-100 dark:border-church-dark-800 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-church-dark-900 dark:text-white">
              Share Sanctuary of Love Treasury Reports
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Generate formatted WhatsApp summaries or print noticeboard QR codes.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setWhatsappModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Text</span>
          </button>
          <button
            onClick={() => setQrModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-church-dark-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-church-sky-600" />
            <span>Church QR</span>
          </button>
        </div>
      </div>

      {/* 3. Summary Cards */}
      <SummaryCards />

      {/* 4. Quick Member Contribution Lookup */}
      <div className="bg-gradient-to-r from-church-sky-50/70 to-church-gold-50/40 dark:from-church-dark-900 dark:to-church-dark-900 rounded-3xl p-6 sm:p-8 border border-church-sky-200/80 dark:border-church-dark-800 shadow-sm space-y-4">
        <div className="max-w-xl">
          <h3 className="text-base sm:text-lg font-bold text-church-dark-900 dark:text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-church-sky-600" />
            <span>Check Member Contribution Record</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Type your name to view your full personal giving statement across all months.
          </p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by your name (e.g., Denzel, Enos, Ann, Lucas)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-church-sky-200 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-xs sm:text-sm text-church-dark-900 dark:text-white focus:ring-2 focus:ring-church-sky-500 shadow-inner"
          />
        </div>

        {/* Search Results Dropdown */}
        {searchTerm.trim() && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => {
                const memberTotal = contributions
                  .filter((c) => c.memberId === member.id)
                  .reduce((sum, c) => sum + c.amount, 0);

                return (
                  <Link
                    key={member.id}
                    href={`/members/${member.id}`}
                    className="p-3.5 bg-white dark:bg-church-dark-800 rounded-xl border border-slate-200 dark:border-church-dark-700 hover:border-church-sky-400 hover:shadow-md transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-church-dark-900 dark:text-white group-hover:text-church-sky-600 transition-colors">
                        {member.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Total Given: <strong>{settings.currency} {memberTotal.toLocaleString()}</strong>
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-church-sky-600 group-hover:translate-x-1 transition-transform" />
                  </Link>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 col-span-full py-2 italic">
                No member found matching &ldquo;{searchTerm}&rdquo;. Try another name.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 5. Month by Month Timeline */}
      <MonthlyTimeline />

      {/* 6. Charts & Analytics */}
      <QuickCharts />

      {/* Modals */}
      <WhatsAppModal isOpen={whatsappModalOpen} onClose={() => setWhatsappModalOpen(false)} />
      <QRCodeModal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} />
    </div>
  );
}
