import React from 'react';
import Link from 'next/link';
import { HeartHandshake, Shield, Sparkles, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-church-dark-950 border-t border-slate-200 dark:border-church-dark-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Church Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-church-sky-600 flex items-center justify-center text-white shadow-sm">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="font-bold text-base text-church-dark-900 dark:text-white">
                Sanctuary of Love Worship Center
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              Praise & Worship Team Financial Transparency Portal. Maintaining trustworthy stewardship, faithful accountability, and clear records for all church members.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-church-rose-500" />
              <span>Dandora, Nairobi, Kenya</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-church-sky-700 dark:text-church-sky-400">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/contributions" className="hover:text-church-sky-600 transition-colors">
                  Monthly Contributions
                </Link>
              </li>
              <li>
                <Link href="/members" className="hover:text-church-sky-600 transition-colors">
                  Members Directory
                </Link>
              </li>
              <li>
                <Link href="/expenses" className="hover:text-church-sky-600 transition-colors">
                  Expenditure Ledger
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-church-sky-600 transition-colors">
                  Transparency Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Scripture & Integrity */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-church-gold-600 dark:text-church-gold-400">
              Scripture Principle
            </h4>
            <blockquote className="text-xs italic text-slate-600 dark:text-slate-400 border-l-2 border-church-sky-400 pl-3 py-1">
              &ldquo;For we are taking pains to do what is right, not only in the eyes of the Lord but also in the eyes of man.&rdquo;
              <span className="block mt-1 font-semibold text-[11px] not-italic text-slate-500">— 2 Corinthians 8:21</span>
            </blockquote>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-church-dark-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Praise & Worship Ministry • Sanctuary of Love Worship Center, Dandora.</p>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="hover:text-church-sky-600 flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Treasurer Access</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
