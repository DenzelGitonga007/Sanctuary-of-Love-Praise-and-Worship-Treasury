'use client';

import React from 'react';
import Link from 'next/link';
import { useTreasury } from '@/lib/store';
import {
  HeartHandshake,
  Coffee,
  Sparkles,
  Receipt,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

export default function SummaryCards() {
  const { totalMonthly, totalTea, totalOther, totalExpenses, settings } = useTreasury();

  const cards = [
    {
      title: 'Monthly Contributions',
      subtitle: 'Expected KES 100/member/mo',
      amount: totalMonthly,
      icon: HeartHandshake,
      iconColor: 'text-church-sky-600 dark:text-church-sky-400',
      bgColor: 'bg-church-sky-50 dark:bg-church-sky-950/50',
      borderColor: 'border-church-sky-200 dark:border-church-sky-900',
      badge: 'Core Giving',
      badgeColor: 'bg-church-sky-100 text-church-sky-800 dark:bg-church-sky-900/60 dark:text-church-sky-200',
      href: '/contributions?type=MONTHLY',
    },
    {
      title: 'Tea Contributions',
      subtitle: 'Overnight fellowship tea (KES 100)',
      amount: totalTea,
      icon: Coffee,
      iconColor: 'text-church-gold-600 dark:text-church-gold-400',
      bgColor: 'bg-church-gold-50/50 dark:bg-church-gold-950/30',
      borderColor: 'border-church-gold-200 dark:border-church-gold-900',
      badge: 'Overnight Fellowship',
      badgeColor: 'bg-church-gold-100 text-church-gold-800 dark:bg-church-gold-900/60 dark:text-church-gold-200',
      href: '/contributions?type=TEA',
    },
    {
      title: 'Other & Special Giving',
      subtitle: 'Tea urn drive, gifts & special tokens',
      amount: totalOther,
      icon: Sparkles,
      iconColor: 'text-church-rose-600 dark:text-church-rose-400',
      bgColor: 'bg-church-rose-50/50 dark:bg-church-rose-950/30',
      borderColor: 'border-church-rose-200 dark:border-church-rose-900',
      badge: 'Special Projects',
      badgeColor: 'bg-church-rose-100 text-church-rose-800 dark:bg-church-rose-900/60 dark:text-church-rose-200',
      href: '/contributions?type=SPECIAL',
    },
    {
      title: 'Total Expenditure',
      subtitle: 'Tea supplies, gifts & equipment',
      amount: totalExpenses,
      icon: Receipt,
      iconColor: 'text-slate-700 dark:text-slate-300',
      bgColor: 'bg-slate-50 dark:bg-church-dark-900/50',
      borderColor: 'border-slate-200 dark:border-church-dark-800',
      badge: 'Disbursements',
      badgeColor: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
      href: '/expenses',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.title}
            href={card.href}
            className={`group relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-white dark:bg-church-dark-900 border ${card.borderColor} shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>

              <h3 className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                {card.title}
              </h3>
              <p className="text-xl sm:text-2xl font-extrabold text-church-dark-900 dark:text-white mt-1 font-display tracking-tight">
                {settings.currency} {card.amount.toLocaleString()}/=
              </p>
              <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                {card.subtitle}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-church-dark-800 flex items-center justify-between text-xs font-semibold text-church-sky-600 group-hover:text-church-sky-700">
              <span>View details</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
