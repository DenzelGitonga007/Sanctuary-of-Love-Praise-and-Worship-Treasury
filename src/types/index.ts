export type ContributionType = 'MONTHLY' | 'TEA' | 'TEA_URN' | 'SPECIAL' | 'OTHER';

export type ExpenseCategory = 
  | 'Tea' 
  | 'Gift' 
  | 'Equipment' 
  | 'Transaction Cost' 
  | 'Transport' 
  | 'Event' 
  | 'Other';

export interface Member {
  id: string;
  name: string;
  phone?: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Contribution {
  id: string;
  memberId: string;
  memberName: string;
  month: string; // e.g. "April", "May", "September"
  year: number; // e.g. 2026
  type: ContributionType;
  amount: number; // e.g. 100
  dateReceived: string; // ISO date string e.g. "2026-09-04"
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  amount: number;
  category: string;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface SystemSettings {
  organizationName: string;
  location: string;
  teamName: string;
  currency: string;
  expectedMonthlyContribution: number;
  expectedTeaContribution: number;
  expectedTeaUrnContribution: number;
  openingBalance: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT' | 'SETTINGS_CHANGE';
  details: string;
}

export interface ParsedItem {
  id: string;
  originalText: string;
  rawName: string;
  matchedMemberId: string | null;
  matchedMemberName: string;
  isNewMember: boolean;
  amount: number | null; // null if blank
  status: 'VALID' | 'BLANK' | 'UNKNOWN_MEMBER' | 'DUPLICATE';
  duplicateWarning?: string;
  duplicateAction: 'SKIP' | 'REPLACE' | 'ADD';
}

export interface ParseResult {
  detectedMonth: string;
  detectedYear: number;
  detectedType: ContributionType;
  totalParsed: number;
  validCount: number;
  blankCount: number;
  totalAmount: number;
  items: ParsedItem[];
}
