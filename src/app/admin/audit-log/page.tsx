'use client';

import React from 'react';
import { useTreasury } from '@/lib/store';
import { History, ShieldCheck, Clock } from 'lucide-react';

export default function AdminAuditLogPage() {
  const { auditLogs } = useTreasury();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-church-dark-900 dark:text-white flex items-center space-x-2">
          <History className="w-6 h-6 text-church-sky-600" />
          <span>Treasurer Action Audit Log</span>
        </h1>
        <p className="text-xs text-slate-500">
          Chronological record of imports, manual edits, expense entries, and member roster changes.
        </p>
      </div>

      {/* Audit Log Timeline Table */}
      <div className="bg-white dark:bg-church-dark-900 rounded-3xl border border-slate-200 dark:border-church-dark-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-church-dark-950 border-b border-slate-200 dark:border-church-dark-800 text-slate-500 text-[11px] uppercase font-bold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-church-dark-800/60 font-sans">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-church-dark-800/40">
                  <td className="py-3.5 px-4 font-mono text-slate-500 text-xs whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-church-dark-900 dark:text-white">
                    {log.actor}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action === 'CREATE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : log.action === 'IMPORT'
                          ? 'bg-church-sky-50 text-church-sky-700'
                          : log.action === 'DELETE'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                    {log.details}
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
