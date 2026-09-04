'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTreasury } from '@/lib/store';
import { HISTORICAL_MONTHS } from '@/lib/constants';
import { generateMemberWhatsAppStatement } from '@/lib/export';
import {
  ArrowLeft,
  HeartHandshake,
  Coffee,
  Sparkles,
  Share2,
  Check,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Copy,
  Printer,
} from 'lucide-react';

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params?.id as string;
  const { members, contributions, settings } = useTreasury();
  const [copied, setCopied] = useState(false);

  const member = members.find((m) => m.id === memberId);

  if (!member) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Member Not Found</h2>
        <p className="text-sm text-slate-500">The requested member record could not be found.</p>
        <Link
          href="/members"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-church-sky-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Members</span>
        </Link>
      </div>
    );
  }

  const memberConts = contributions.filter((c) => c.memberId === member.id);

  // Build row for each historical month
  const monthRows = HISTORICAL_MONTHS.map((month) => {
    const monthlyCont = memberConts.find(
      (c) => c.month.toLowerCase() === month.toLowerCase() && c.type === 'MONTHLY'
    );
    const teaCont = memberConts.find(
      (c) => c.month.toLowerCase() === month.toLowerCase() && c.type === 'TEA'
    );
    const otherCont = memberConts.find(
      (c) => c.month.toLowerCase() === month.toLowerCase() && !['MONTHLY', 'TEA'].includes(c.type)
    );

    const mVal = monthlyCont ? monthlyCont.amount : 0;
    const tVal = teaCont ? teaCont.amount : 0;
    const oVal = otherCont ? otherCont.amount : 0;
    const total = mVal + tVal + oVal;

    return {
      month,
      year: 2026,
      monthly: mVal,
      tea: tVal,
      other: oVal,
      otherNote: otherCont ? otherCont.type : '',
      total,
      hasMonthly: Boolean(monthlyCont),
      hasTea: Boolean(teaCont),
      hasOther: Boolean(otherCont),
    };
  });

  const totalMonthly = memberConts.filter((c) => c.type === 'MONTHLY').reduce((sum, c) => sum + c.amount, 0);
  const totalTea = memberConts.filter((c) => c.type === 'TEA').reduce((sum, c) => sum + c.amount, 0);
  const totalOther = memberConts.filter((c) => !['MONTHLY', 'TEA'].includes(c.type)).reduce((sum, c) => sum + c.amount, 0);
  const grandTotal = totalMonthly + totalTea + totalOther;

  const handleCopyWhatsApp = () => {
    const text = generateMemberWhatsAppStatement(member, contributions, settings.currency);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-xl bg-white dark:bg-church-dark-900 border border-slate-200 dark:border-church-dark-800 text-slate-600 hover:text-church-sky-600 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-semibold text-church-sky-600 dark:text-church-sky-400">
              Sanctuary of Love Praise & Worship Member Statement
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-church-dark-900 dark:text-white tracking-tight">
              {member.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyWhatsApp}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Statement!' : 'Copy WhatsApp Statement'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-church-dark-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-semibold"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards for Member */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-church-dark-900 border border-slate-200 dark:border-church-dark-800 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Monthly Giving</span>
          <p className="text-lg sm:text-xl font-bold text-church-sky-600 mt-1">
            {settings.currency} {totalMonthly.toLocaleString()}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-church-dark-900 border border-slate-200 dark:border-church-dark-800 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Tea Overnight</span>
          <p className="text-lg sm:text-xl font-bold text-church-gold-600 mt-1">
            {settings.currency} {totalTea.toLocaleString()}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-church-dark-900 border border-slate-200 dark:border-church-dark-800 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Special / Urn</span>
          <p className="text-lg sm:text-xl font-bold text-purple-600 mt-1">
            {settings.currency} {totalOther.toLocaleString()}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-church-sky-600 to-church-sky-700 text-white shadow-md">
          <span className="text-xs font-semibold text-church-sky-100">Grand Total Given</span>
          <p className="text-lg sm:text-xl font-extrabold font-display mt-1">
            {settings.currency} {grandTotal.toLocaleString()}/=
          </p>
        </div>
      </div>

      {/* Month-by-Month Statement Table */}
      <div className="bg-white dark:bg-church-dark-900 rounded-3xl border border-slate-200 dark:border-church-dark-800 shadow-sm overflow-hidden space-y-4 p-6 sm:p-8">
        <h3 className="text-base sm:text-lg font-bold text-church-dark-900 dark:text-white flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-church-sky-600" />
          <span>Detailed Contribution Ledger by Month</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-church-dark-950 border-b border-slate-200 dark:border-church-dark-800 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Month</th>
                <th className="py-3 px-4 text-right">Monthly (KES 100)</th>
                <th className="py-3 px-4 text-right">Tea (KES 100)</th>
                <th className="py-3 px-4 text-right">Other / Urn</th>
                <th className="py-3 px-4 text-right">Total Given</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-church-dark-800/60 font-sans">
              {monthRows.map((row) => (
                <tr
                  key={row.month}
                  className="hover:bg-slate-50/80 dark:hover:bg-church-dark-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 font-semibold text-church-dark-900 dark:text-white">
                    {row.month} 2026
                  </td>

                  {/* Monthly */}
                  <td className="py-3.5 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                    {row.hasMonthly ? (
                      <span className="font-semibold">{row.monthly.toLocaleString()}</span>
                    ) : (
                      <span className="text-slate-400 font-normal">—</span>
                    )}
                  </td>

                  {/* Tea */}
                  <td className="py-3.5 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                    {row.hasTea ? (
                      <span className="font-semibold">{row.tea.toLocaleString()}</span>
                    ) : (
                      <span className="text-slate-400 font-normal">—</span>
                    )}
                  </td>

                  {/* Other */}
                  <td className="py-3.5 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                    {row.hasOther ? (
                      <span className="text-purple-600 font-semibold">
                        {row.other.toLocaleString()}{' '}
                        <span className="text-[10px] text-slate-400">({row.otherNote})</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">—</span>
                    )}
                  </td>

                  {/* Month Total */}
                  <td className="py-3.5 px-4 text-right font-bold text-church-dark-900 dark:text-white">
                    {row.total > 0 ? `${settings.currency} ${row.total.toLocaleString()}` : '—'}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    {row.total > 0 ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Contributed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-church-dark-800 text-slate-400 text-[11px]">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 dark:bg-church-dark-950 font-bold border-t-2 border-slate-200 dark:border-church-dark-800 text-church-dark-900 dark:text-white">
                <td className="py-3.5 px-4 uppercase text-xs">Total Accumulated</td>
                <td className="py-3.5 px-4 text-right text-church-sky-600">
                  {settings.currency} {totalMonthly.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-right text-church-gold-600">
                  {settings.currency} {totalTea.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-right text-purple-600">
                  {settings.currency} {totalOther.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-right text-church-sky-700 text-sm">
                  {settings.currency} {grandTotal.toLocaleString()}
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
