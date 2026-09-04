'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTreasury } from '@/lib/store';
import {
  Users,
  Search,
  ArrowRight,
  Sparkles,
  HeartHandshake,
  Coffee,
  CheckCircle,
  Award,
} from 'lucide-react';

export default function MembersPage() {
  const { members, contributions, settings } = useTreasury();
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate statistics for each member
  const memberStats = members.map((member) => {
    const memberConts = contributions.filter((c) => c.memberId === member.id);

    const monthlyTotal = memberConts
      .filter((c) => c.type === 'MONTHLY')
      .reduce((sum, c) => sum + c.amount, 0);

    const teaTotal = memberConts
      .filter((c) => c.type === 'TEA')
      .reduce((sum, c) => sum + c.amount, 0);

    const otherTotal = memberConts
      .filter((c) => !['MONTHLY', 'TEA'].includes(c.type))
      .reduce((sum, c) => sum + c.amount, 0);

    const grandTotal = monthlyTotal + teaTotal + otherTotal;

    // Unique months contributed
    const monthsContributed = new Set(
      memberConts.filter((c) => c.amount > 0).map((c) => `${c.month}-${c.year}`)
    ).size;

    // Baseline historical months count (April, May, June, July, August = 5 months)
    const expectedMonths = 5;
    const participationRate = Math.min(100, Math.round((monthsContributed / expectedMonths) * 100));

    return {
      ...member,
      monthlyTotal,
      teaTotal,
      otherTotal,
      grandTotal,
      monthsContributed,
      participationRate,
    };
  });

  const filtered = memberStats.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-church-sky-100 dark:bg-church-sky-950 text-church-sky-700 dark:text-church-sky-300 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Praise & Worship Team Roster</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-church-dark-900 dark:text-white tracking-tight">
            Members Contribution Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Individual giving summaries, fellowship tea participation, and total contributions for all team members.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search member name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-church-sky-500"
          />
        </div>
      </div>

      {/* Grid of Member Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filtered.map((member) => (
          <Link
            key={member.id}
            href={`/members/${member.id}`}
            className="group relative overflow-hidden rounded-3xl bg-white dark:bg-church-dark-900 border border-slate-200 dark:border-church-dark-800 p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              {/* Member Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-church-dark-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-church-sky-500 to-church-sky-700 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-church-dark-900 dark:text-white group-hover:text-church-sky-600 transition-colors">
                      {member.name}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {member.monthsContributed} months active
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-church-sky-50 text-church-sky-700 dark:bg-church-sky-950 dark:text-church-sky-300">
                    {member.participationRate}%
                  </span>
                </div>
              </div>

              {/* Financial Stats */}
              <div className="py-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center space-x-1.5">
                    <HeartHandshake className="w-3.5 h-3.5 text-church-sky-600" />
                    <span>Monthly Total:</span>
                  </span>
                  <span className="font-semibold text-church-dark-900 dark:text-white">
                    {settings.currency} {member.monthlyTotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center space-x-1.5">
                    <Coffee className="w-3.5 h-3.5 text-church-gold-600" />
                    <span>Tea Total:</span>
                  </span>
                  <span className="font-semibold text-church-dark-900 dark:text-white">
                    {settings.currency} {member.teaTotal.toLocaleString()}
                  </span>
                </div>

                {member.otherTotal > 0 && (
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center space-x-1.5 text-purple-600">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Special / Urn:</span>
                    </span>
                    <span className="font-semibold text-purple-700 dark:text-purple-300">
                      {settings.currency} {member.otherTotal.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Grand Total Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-church-dark-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Grand Total Given
                </span>
                <p className="text-base font-extrabold text-church-sky-600 font-display">
                  {settings.currency} {member.grandTotal.toLocaleString()}/=
                </p>
              </div>

              <div className="flex items-center space-x-1 text-xs font-semibold text-slate-500 group-hover:text-church-sky-600">
                <span>View statement</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
