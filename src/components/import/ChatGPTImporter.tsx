'use client';

import React, { useState } from 'react';
import { useTreasury } from '@/lib/store';
import { parseContributionList } from '@/lib/parser';
import { ContributionType, ParsedItem } from '@/types';
import { HISTORICAL_MONTHS } from '@/lib/constants';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ClipboardPaste,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
  UserPlus,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  Layers,
} from 'lucide-react';

const SAMPLE_CHATGPT_LIST = `*PRAISE AND WORSHIP TEAM MONTHLY CONTRIBUTION*
*Month: September 2026*

1. Min Enos Masasi - 100
2. Min Ann Musyoka - 
3. Pst Priscah Enos - 100
4. Purity Murugi - 
5. Denzel Gitonga - 100
6. Margerete Waithera - 100
7. Pst Lucas Omondi - 100
8. Ev Elijah Kariuki - 100
9. Quinter Adhiambo - 
10. Huldah Mweni - 100
11. Pst Levies - 100
12. Pst Josephine Robert - 
13. Cornel Otin - 100
14. Mary Cornel - 100
15. Nicholus Munyoki - 100
16. Derrington Okwomi - 100
17. Elizabeth Nyambura - 
18. Janet Omondi - 100
19. Juliana Wayua - 
20. Mwendwa - 100
21. Agnes Wambui - 100`;

export default function ChatGPTImporter() {
  const {
    members,
    contributions,
    batchImportContributions,
    addMember,
    settings,
  } = useTreasury();

  const [rawText, setRawText] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('September');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedType, setSelectedType] = useState<ContributionType>('MONTHLY');
  const [duplicateGlobalAction, setDuplicateGlobalAction] = useState<'REPLACE' | 'SKIP' | 'ADD'>('REPLACE');

  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [hasParsed, setHasParsed] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Run parser
  const handleParse = (textToParse: string = rawText) => {
    if (!textToParse.trim()) return;

    const result = parseContributionList(
      textToParse,
      members,
      contributions,
      selectedMonth,
      selectedYear,
      selectedType
    );

    setSelectedMonth(result.detectedMonth);
    setSelectedYear(result.detectedYear);
    setSelectedType(result.detectedType);
    setParsedItems(result.items);
    setHasParsed(true);
    setSuccessMessage(null);
  };

  const handlePasteSample = () => {
    setRawText(SAMPLE_CHATGPT_LIST);
    handleParse(SAMPLE_CHATGPT_LIST);
  };

  const handleClear = () => {
    setRawText('');
    setParsedItems([]);
    setHasParsed(false);
    setSuccessMessage(null);
  };

  // Change amount of an individual parsed item
  const handleAmountChange = (id: string, newAmountStr: string) => {
    setParsedItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const amt = newAmountStr === '' ? null : parseFloat(newAmountStr);
        let status = item.status;
        if (amt === null || isNaN(amt)) {
          status = 'BLANK';
        } else if (item.matchedMemberId) {
          status = item.duplicateWarning ? 'DUPLICATE' : 'VALID';
        }
        return {
          ...item,
          amount: isNaN(amt as number) ? null : amt,
          status,
        };
      })
    );
  };

  // Remap member
  const handleMemberChange = (id: string, newMemberId: string) => {
    const member = members.find((m) => m.id === newMemberId);
    if (!member) return;

    setParsedItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          matchedMemberId: member.id,
          matchedMemberName: member.name,
          isNewMember: false,
          status: item.amount === null ? 'BLANK' : 'VALID',
        };
      })
    );
  };

  // Quick create new member
  const handleQuickCreateMember = (item: ParsedItem) => {
    const created = addMember(item.rawName);
    setParsedItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
            ...i,
            matchedMemberId: created.id,
            matchedMemberName: created.name,
            isNewMember: false,
            status: i.amount === null ? 'BLANK' : 'VALID',
          }
          : i
      )
    );
  };

  // Commit batch import
  const handleCommitImport = () => {
    const validItems = parsedItems
      .filter((i) => i.matchedMemberId && i.amount !== null && i.amount > 0)
      .map((i) => ({
        memberId: i.matchedMemberId!,
        memberName: i.matchedMemberName,
        month: selectedMonth,
        year: selectedYear,
        type: selectedType,
        amount: i.amount!,
        notes: `Imported`,
      }));

    if (validItems.length === 0) {
      alert('No valid contributions with amounts were found to import.');
      return;
    }

    const { importedCount, replacedCount } = batchImportContributions(
      validItems,
      duplicateGlobalAction
    );

    // Trigger confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch { }

    setSuccessMessage(
      `Successfully saved ${validItems.length} records for ${selectedMonth} ${selectedYear} (${importedCount} new, ${replacedCount} updated).`
    );
    setHasParsed(false);
    setParsedItems([]);
    setRawText('');
  };

  const validEntries = parsedItems.filter((i) => i.amount !== null && i.amount > 0);
  const blankEntries = parsedItems.filter((i) => i.amount === null);
  const totalImportAmount = validEntries.reduce((sum, i) => sum + (i.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Success alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input Step Card */}
      <div className="bg-white dark:bg-church-dark-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-church-dark-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-church-dark-800 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-church-dark-900 dark:text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-church-sky-600" />
              <span>Paste ChatGPT or WhatsApp Contribution List</span>
            </h2>
            <p className="text-xs text-slate-500">
              Blank rows (no amount) are shown as <strong>⏳ Not Yet Contributed</strong> and will <strong>not</strong> be saved — only members with amounts are recorded.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePasteSample}
              className="px-3.5 py-1.5 bg-church-sky-50 dark:bg-church-sky-950 hover:bg-church-sky-100 text-church-sky-700 dark:text-church-sky-300 text-xs font-semibold rounded-xl transition-colors border border-church-sky-200 dark:border-church-sky-800 flex items-center space-x-1.5"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Load Sample List</span>
            </button>
            {rawText && (
              <button
                onClick={handleClear}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-church-rose-600 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Text Area */}
        <div>
          <textarea
            rows={8}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`Paste your list here, for example:\n1. Min Enos Masasi - 100\n2. Min Ann Musyoka -\n3. Pst Priscah Enos - KES 100/=\n4. Denzel Gitonga - 100`}
            className="w-full p-4 rounded-2xl border border-slate-300 dark:border-church-dark-700 bg-slate-50 dark:bg-church-dark-950 text-slate-800 dark:text-slate-100 font-mono text-xs sm:text-sm focus:ring-2 focus:ring-church-sky-500 focus:bg-white dark:focus:bg-church-dark-900 transition-all resize-y"
          />
        </div>

        {/* Configuration Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-church-sky-500"
            >
              {HISTORICAL_MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m} 2026
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Contribution Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ContributionType)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-church-sky-500"
            >
              <option value="MONTHLY">Monthly Contribution (Default KES 100)</option>
              <option value="TEA">Overnight Tea Contribution (Default KES 100)</option>
              <option value="TEA_URN">Special Tea Urn Drive</option>
              <option value="SPECIAL">Special Gift / Fundraising</option>
              <option value="OTHER">Other Contribution</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              If Record Already Exists
            </label>
            <select
              value={duplicateGlobalAction}
              onChange={(e) => setDuplicateGlobalAction(e.target.value as any)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-church-sky-500"
            >
              <option value="REPLACE">Overwrite / Update with new amount</option>
              <option value="SKIP">Skip (Keep existing record)</option>
              <option value="ADD">Add as additional separate record</option>
            </select>
          </div>
        </div>

        {/* Parse button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => handleParse()}
            disabled={!rawText.trim()}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-church-sky-600 to-church-sky-500 hover:from-church-sky-500 hover:to-church-sky-400 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-98"
          >
            <Sparkles className="w-4 h-4" />
            <span>Parse & Preview Records</span>
          </button>
        </div>
      </div>

      {/* Review & Validation Table */}
      {hasParsed && (
        <div className="bg-white dark:bg-church-dark-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-church-dark-800 shadow-sm space-y-6 animate-fade-in">
          {/* Summary metrics header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-church-dark-800 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-church-dark-900 dark:text-white flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Import Preview ({selectedMonth} {selectedYear} • {selectedType})</span>
              </h3>
              <p className="text-xs text-slate-500">
                Review and make corrections before saving to the live treasury.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 bg-slate-100 dark:bg-church-dark-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium">
                Total parsed: <strong>{parsedItems.length}</strong>
              </span>
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg font-semibold">
                Valid: <strong>{validEntries.length}</strong>
              </span>
              <span className="px-3 py-1 bg-slate-100 dark:bg-church-dark-800 text-slate-500 rounded-lg font-medium">
                Blank: <strong>{blankEntries.length}</strong>
              </span>
              <span className="px-3 py-1 bg-church-gold-50 dark:bg-church-gold-950/40 text-church-gold-800 dark:text-church-gold-300 rounded-lg font-bold">
                Total: <strong>{settings.currency} {totalImportAmount.toLocaleString()}</strong>
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 dark:border-church-dark-800 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-church-dark-950 border-b border-slate-200 dark:border-church-dark-800 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Detected Name / Member</th>
                  <th className="py-3 px-4">Amount ({settings.currency})</th>
                  <th className="py-3 px-4">Validation Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-church-dark-800/60 font-sans">
                {parsedItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-church-dark-800/40 transition-colors ${item.status === 'UNKNOWN_MEMBER' ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                      }`}
                  >
                    <td className="py-3 px-4 font-mono text-slate-400 text-xs">{idx + 1}</td>

                    {/* Member Selection / Remapping */}
                    <td className="py-3 px-4">
                      {item.matchedMemberId ? (
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-church-dark-900 dark:text-white">
                            {item.matchedMemberName}
                          </span>
                          {item.rawName.toLowerCase() !== item.matchedMemberName.toLowerCase() && (
                            <span className="text-[10px] text-slate-400 italic">
                              (matched from &quot;{item.rawName}&quot;)
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-amber-700 dark:text-amber-400">
                            {item.rawName} (Unknown)
                          </span>
                          <select
                            onChange={(e) => handleMemberChange(item.id, e.target.value)}
                            defaultValue=""
                            className="text-xs p-1 rounded border border-amber-300 dark:border-amber-700 bg-white dark:bg-church-dark-800"
                          >
                            <option value="" disabled>
                              Link to existing...
                            </option>
                            {members.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </td>

                    {/* Editable Amount */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          value={item.amount === null ? '' : item.amount}
                          onChange={(e) => handleAmountChange(item.id, e.target.value)}
                          placeholder="—"
                          className="w-24 px-2 py-1 text-xs font-semibold rounded border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-church-dark-900 dark:text-white focus:ring-1 focus:ring-church-sky-500"
                        />
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {item.status === 'VALID' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Valid</span>
                        </span>
                      )}
                      {item.status === 'BLANK' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-[11px] font-semibold" title="This member has not contributed yet. This row will NOT be saved.">
                          <span>⏳ Not Yet Contributed — skipped</span>
                        </span>
                      )}
                      {item.status === 'UNKNOWN_MEMBER' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[11px] font-semibold">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>New / Unrecognized</span>
                        </span>
                      )}
                      {item.status === 'DUPLICATE' && (
                        <span
                          title={item.duplicateWarning}
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[11px] font-semibold"
                        >
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          <span>Existing record ({duplicateGlobalAction})</span>
                        </span>
                      )}
                    </td>

                    {/* Quick Action */}
                    <td className="py-3 px-4 text-right">
                      {item.isNewMember && (
                        <button
                          onClick={() => handleQuickCreateMember(item)}
                          className="text-xs text-church-sky-600 hover:text-church-sky-700 font-semibold flex items-center space-x-1 ml-auto"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>Add to Roster</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-slate-100 dark:border-church-dark-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => setHasParsed(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-church-dark-800 rounded-xl"
            >
              Cancel & Adjust Text
            </button>

            <button
              onClick={handleCommitImport}
              disabled={validEntries.length === 0}
              className="flex flex-col items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
            >
              <span className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-church-gold-300" />
                <span>Save {validEntries.length} Contributions to Treasury</span>
              </span>
              {blankEntries.length > 0 && (
                <span className="text-[10px] opacity-80 font-normal mt-0.5">{blankEntries.length} blank rows skipped (not saved)</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
