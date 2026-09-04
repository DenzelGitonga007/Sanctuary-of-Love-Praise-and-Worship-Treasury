import { Member, Contribution, Expense } from '@/types';

/**
 * Generate CSV for Contributions
 */
export function exportContributionsToCSV(contributions: Contribution[]): string {
  const headers = ['ID', 'Member Name', 'Month', 'Year', 'Contribution Type', 'Amount (KES)', 'Date Received', 'Notes'];
  const rows = contributions.map((c) => [
    `"${c.id}"`,
    `"${c.memberName}"`,
    `"${c.month}"`,
    c.year,
    `"${c.type}"`,
    c.amount,
    `"${c.dateReceived || ''}"`,
    `"${c.notes || ''}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Generate CSV for Expenses
 */
export function exportExpensesToCSV(expenses: Expense[]): string {
  const headers = ['ID', 'Date', 'Description', 'Category', 'Amount (KES)', 'Reference', 'Notes'];
  const rows = expenses.map((e) => [
    `"${e.id}"`,
    `"${e.date}"`,
    `"${e.description.replace(/"/g, '""')}"`,
    `"${e.category}"`,
    e.amount,
    `"${e.reference || ''}"`,
    `"${e.notes || ''}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Trigger file download in browser
 */
export function downloadFile(content: string, fileName: string, contentType: string = 'text/csv;charset=utf-8;') {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate WhatsApp Ready Message for Monthly Summary
 */
export function generateWhatsAppMonthlySummary(
  month: string,
  year: number,
  monthlyTotal: number,
  teaTotal: number,
  otherTotal: number,
  expensesTotal: number,
  currentBalance: number,
  members: Member[],
  contributions: Contribution[]
): string {
  const monthConts = contributions.filter((c) => c.month.toLowerCase() === month.toLowerCase() && c.year === year);
  
  let msg = `*SANCTUARY OF LOVE WORSHIP CENTER*\n`;
  msg += `*PRAISE & WORSHIP TREASURY REPORT*\n`;
  msg += `*Period: ${month} ${year}*\n\n`;

  msg += `💰 *FINANCIAL SUMMARY:*\n`;
  msg += `• Monthly Inflow: KES ${monthlyTotal.toLocaleString()}\n`;
  msg += `• Tea Inflow: KES ${teaTotal.toLocaleString()}\n`;
  if (otherTotal > 0) {
    msg += `• Special Inflow: KES ${otherTotal.toLocaleString()}\n`;
  }
  msg += `• Expenses: KES ${expensesTotal.toLocaleString()}\n`;
  msg += `• *Current Treasury Balance: KES ${currentBalance.toLocaleString()}*\n\n`;

  msg += `📋 *CONTRIBUTIONS BREAKDOWN:*\n`;

  // Sort active members
  const activeMembers = [...members].filter((m) => m.active);
  activeMembers.forEach((m, idx) => {
    const monthlyC = monthConts.find((c) => c.memberId === m.id && c.type === 'MONTHLY');
    const teaC = monthConts.find((c) => c.memberId === m.id && c.type === 'TEA');

    const mText = monthlyC ? `${monthlyC.amount}/=` : '—';
    const tText = teaC ? `${teaC.amount}/=` : '—';

    msg += `${idx + 1}. ${m.name} | M: ${mText} | T: ${tText}\n`;
  });

  msg += `\n🔗 *View Live Transparency Portal:*\nhttps://sol-praise-worship.vercel.app\n`;
  msg += `_“God is not unjust; he will not forget your work and the love you have shown him.” (Heb 6:10)_`;

  return msg;
}

/**
 * Generate Member's Personal WhatsApp Statement
 */
export function generateMemberWhatsAppStatement(
  member: Member,
  contributions: Contribution[],
  currency: string = 'KES'
): string {
  const memberConts = contributions.filter((c) => c.memberId === member.id);
  const totalMonthly = memberConts.filter((c) => c.type === 'MONTHLY').reduce((sum, c) => sum + c.amount, 0);
  const totalTea = memberConts.filter((c) => c.type === 'TEA').reduce((sum, c) => sum + c.amount, 0);
  const totalOther = memberConts.filter((c) => !['MONTHLY', 'TEA'].includes(c.type)).reduce((sum, c) => sum + c.amount, 0);
  const grandTotal = totalMonthly + totalTea + totalOther;

  let msg = `*SANCTUARY OF LOVE WORSHIP CENTER*\n`;
  msg += `*Praise & Worship Member Statement*\n\n`;
  msg += `👤 *Member:* ${member.name}\n`;
  msg += `💵 *Total Monthly:* ${currency} ${totalMonthly.toLocaleString()}\n`;
  msg += `☕ *Total Tea:* ${currency} ${totalTea.toLocaleString()}\n`;
  if (totalOther > 0) {
    msg += `✨ *Total Other:* ${currency} ${totalOther.toLocaleString()}\n`;
  }
  msg += `🌟 *Grand Total Given:* ${currency} ${grandTotal.toLocaleString()}\n\n`;

  msg += `*Contribution History:*\n`;
  memberConts.forEach((c) => {
    msg += `• ${c.month} ${c.year} [${c.type}]: ${currency} ${c.amount.toLocaleString()}\n`;
  });

  msg += `\n_Thank you for your faithful support to the Praise & Worship Ministry!_ 🙏`;
  return msg;
}
