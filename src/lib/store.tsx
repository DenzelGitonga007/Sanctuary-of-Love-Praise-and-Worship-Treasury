'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Member,
  Contribution,
  Expense,
  SystemSettings,
  AuditLog,
  ContributionType,
  SpecialProject,
} from '@/types';
import {
  INITIAL_MEMBERS,
  INITIAL_CONTRIBUTIONS,
  INITIAL_EXPENSES,
  INITIAL_SPECIAL_PROJECTS,
  DEFAULT_SETTINGS,
  MONTHS,
  HISTORICAL_MONTHS,
} from './constants';
import { supabase, isSupabaseConfigured } from './supabase';

interface MonthlyStat {
  month: string;
  year: number;
  monthlyTotal: number;
  teaTotal: number;
  otherTotal: number;
  expensesTotal: number;
  netChange: number;
  monthlyContributorsCount: number;
  teaContributorsCount: number;
  totalContributorsCount: number;
}

interface TreasuryContextType {
  members: Member[];
  contributions: Contribution[];
  expenses: Expense[];
  settings: SystemSettings;
  auditLogs: AuditLog[];
  specialProjects: SpecialProject[];
  isLoading: boolean;
  isAdmin: boolean;

  // Supabase cloud sync state
  isSupabaseLive: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  refreshFromCloud: () => Promise<void>;

  // Calculated metrics
  currentBalance: number;
  totalMonthly: number;
  totalTea: number;
  totalOther: number;
  totalExpenses: number;
  monthlyStats: MonthlyStat[];

  // Actions — Auth
  loginAsAdmin: (passcode?: string) => boolean;
  logout: () => void;

  // Actions — Members
  addMember: (name: string, phone?: string) => Member;
  updateMember: (id: string, updates: Partial<Member>) => void;
  toggleMemberActive: (id: string) => void;

  // Actions — Contributions
  addContribution: (contribution: Omit<Contribution, 'id' | 'createdAt'>) => Contribution;
  updateContribution: (id: string, updates: Partial<Contribution>) => void;
  deleteContribution: (id: string) => void;
  deleteContributionsByMonth: (month: string, year: number, type?: ContributionType) => number;
  bulkDeleteContributions: (ids: string[]) => number;
  batchImportContributions: (
    items: {
      memberId: string;
      memberName: string;
      month: string;
      year: number;
      type: ContributionType;
      amount: number;
      notes?: string;
    }[],
    actionIfDuplicate?: 'SKIP' | 'REPLACE' | 'ADD'
  ) => { importedCount: number; replacedCount: number };

  // Actions — Expenses
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Actions — Special Projects
  addSpecialProject: (project: Omit<SpecialProject, 'id'>) => SpecialProject;
  updateSpecialProject: (id: string, updates: Partial<SpecialProject>) => void;
  deleteSpecialProject: (id: string) => void;
  toggleProjectStatus: (id: string) => void;

  // Actions — Settings
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetToInitialData: () => void;
}

const TreasuryContext = createContext<TreasuryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MEMBERS: 'sol_treasury_members_v1',
  CONTRIBUTIONS: 'sol_treasury_contributions_v1',
  EXPENSES: 'sol_treasury_expenses_v1',
  SETTINGS: 'sol_treasury_settings_v1',
  AUDIT_LOGS: 'sol_treasury_audit_v1',
  AUTH: 'sol_treasury_is_admin_v1',
  SPECIAL_PROJECTS: 'sol_treasury_projects_v1',
};

export function TreasuryProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [contributions, setContributions] = useState<Contribution[]>(INITIAL_CONTRIBUTIONS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [specialProjects, setSpecialProjects] = useState<SpecialProject[]>(INITIAL_SPECIAL_PROJECTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log-seed',
      timestamp: new Date().toISOString(),
      actor: 'System',
      action: 'IMPORT',
      details: 'Historical records (April - August 2026) initialized.',
    },
  ]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(isSupabaseConfigured);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // ────────────────────────────────────────────────────────
  // Cloud Fetch from Supabase
  // ────────────────────────────────────────────────────────
  const fetchSupabaseData = useCallback(async () => {
    if (!supabase) return;
    setIsSyncing(true);
    try {
      const [mRes, cRes, eRes, pRes, sRes, aRes] = await Promise.all([
        supabase.from('members').select('*').order('name'),
        supabase.from('contributions').select('*').order('created_at', { ascending: false }),
        supabase.from('expenses').select('*').order('date', { ascending: false }),
        supabase.from('special_projects').select('*').order('started_at', { ascending: false }),
        supabase.from('settings').select('*').limit(1).maybeSingle(),
        supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(100),
      ]);

      if (mRes.data && mRes.data.length > 0) {
        setMembers(
          mRes.data.map((m) => ({
            id: m.id,
            name: m.name,
            phone: m.phone || undefined,
            active: m.active ?? true,
            createdAt: m.created_at || new Date().toISOString(),
            updatedAt: m.updated_at || undefined,
          }))
        );
      }

      if (cRes.data && cRes.data.length > 0) {
        setContributions(
          cRes.data.map((c) => ({
            id: c.id,
            memberId: c.member_id || '',
            memberName: c.member_name,
            month: c.month,
            year: c.year,
            type: c.type as ContributionType,
            amount: Number(c.amount) || 0,
            dateReceived: c.date_received || new Date().toISOString().split('T')[0],
            notes: c.notes || undefined,
            createdAt: c.created_at || new Date().toISOString(),
          }))
        );
      }

      if (eRes.data && eRes.data.length > 0) {
        setExpenses(
          eRes.data.map((e) => ({
            id: e.id,
            date: e.date,
            description: e.description,
            category: e.category,
            amount: Number(e.amount) || 0,
            reference: e.reference || undefined,
            notes: e.notes || undefined,
            createdAt: e.created_at || new Date().toISOString(),
          }))
        );
      }

      if (pRes.data && pRes.data.length > 0) {
        setSpecialProjects(
          pRes.data.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description || undefined,
            targetAmount: Number(p.target_amount) || 0,
            status: p.status,
            startedAt: p.started_at,
            completedAt: p.completed_at || undefined,
            notes: p.notes || undefined,
          }))
        );
      }

      if (sRes.data) {
        setSettings({
          organizationName: sRes.data.organization_name || DEFAULT_SETTINGS.organizationName,
          location: sRes.data.location || DEFAULT_SETTINGS.location,
          teamName: sRes.data.team_name || DEFAULT_SETTINGS.teamName,
          currency: sRes.data.currency || DEFAULT_SETTINGS.currency,
          expectedMonthlyContribution: Number(sRes.data.expected_monthly) || DEFAULT_SETTINGS.expectedMonthlyContribution,
          expectedTeaContribution: Number(sRes.data.expected_tea) || DEFAULT_SETTINGS.expectedTeaContribution,
          expectedTeaUrnContribution: Number(sRes.data.expected_tea_urn) || DEFAULT_SETTINGS.expectedTeaUrnContribution,
          openingBalance: Number(sRes.data.opening_balance) || 0,
        });
      }

      if (aRes.data && aRes.data.length > 0) {
        setAuditLogs(
          aRes.data.map((a) => ({
            id: a.id,
            actor: a.actor,
            action: a.action,
            details: a.details,
            timestamp: a.timestamp,
          }))
        );
      }

      setIsSupabaseLive(true);
      setLastSyncedAt(new Date());
    } catch (err) {
      console.warn('Supabase fetch error, fallback to local storage:', err);
      setIsSupabaseLive(false);
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, []);

  // Initial mount: load local storage first for instant render, then fetch Supabase
  useEffect(() => {
    try {
      const savedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      const savedContributions = localStorage.getItem(STORAGE_KEYS.CONTRIBUTIONS);
      const savedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const savedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
      const savedProjects = localStorage.getItem(STORAGE_KEYS.SPECIAL_PROJECTS);

      if (savedMembers) setMembers(JSON.parse(savedMembers));
      if (savedContributions) setContributions(JSON.parse(savedContributions));
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
      if (savedSettings) setSettings(JSON.parse(savedSettings));
      if (savedAudit) setAuditLogs(JSON.parse(savedAudit));
      if (savedAuth === 'true') setIsAdmin(true);
      if (savedProjects) setSpecialProjects(JSON.parse(savedProjects));
    } catch (e) {
      console.warn('Could not load stored treasury data:', e);
    }

    if (supabase) {
      fetchSupabaseData();
    } else {
      setIsLoading(false);
    }
  }, [fetchSupabaseData]);

  // Set up Supabase Realtime subscription
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('treasury-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contributions' },
        () => fetchSupabaseData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'members' },
        () => fetchSupabaseData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        () => fetchSupabaseData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'special_projects' },
        () => fetchSupabaseData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settings' },
        () => fetchSupabaseData()
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsSupabaseLive(true);
        }
      });

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [fetchSupabaseData]);

  // Save changes to LocalStorage as offline backup
  useEffect(() => {
    if (isLoading) return;
    try {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
      localStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify(contributions));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
      localStorage.setItem(STORAGE_KEYS.AUTH, isAdmin ? 'true' : 'false');
      localStorage.setItem(STORAGE_KEYS.SPECIAL_PROJECTS, JSON.stringify(specialProjects));
    } catch (e) {
      console.error('Failed to sync to local storage:', e);
    }
  }, [members, contributions, expenses, settings, auditLogs, isAdmin, isLoading, specialProjects]);

  // ────────────────────────────────────────────────────────
  // Calculations — all amounts in KES
  // ────────────────────────────────────────────────────────
  const totalMonthly = useMemo(
    () => contributions.filter((c) => c.type === 'MONTHLY').reduce((sum, c) => sum + c.amount, 0),
    [contributions]
  );

  const totalTea = useMemo(
    () => contributions.filter((c) => c.type === 'TEA').reduce((sum, c) => sum + c.amount, 0),
    [contributions]
  );

  // All non-MONTHLY, non-TEA contributions (Tea Urn, Special, Other) count toward balance
  const totalOther = useMemo(
    () => contributions.filter((c) => !['MONTHLY', 'TEA'].includes(c.type)).reduce((sum, c) => sum + c.amount, 0),
    [contributions]
  );

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  // Dynamic formula: Opening Balance + All Inflows − All Expenses
  const currentBalance = useMemo(
    () => (settings.openingBalance || 0) + totalMonthly + totalTea + totalOther - totalExpenses,
    [settings.openingBalance, totalMonthly, totalTea, totalOther, totalExpenses]
  );

  // Monthly stats per calendar month
  const monthlyStats: MonthlyStat[] = useMemo(() => {
    const allMonths = Array.from(
      new Set([...HISTORICAL_MONTHS, ...contributions.map((c) => c.month)])
    );

    return allMonths.map((m) => {
      const year = 2026;
      const monthContribs = contributions.filter(
        (c) => c.month.toLowerCase() === m.toLowerCase() && c.year === year
      );

      const mTotal = monthContribs
        .filter((c) => c.type === 'MONTHLY')
        .reduce((sum, c) => sum + c.amount, 0);

      const tTotal = monthContribs
        .filter((c) => c.type === 'TEA')
        .reduce((sum, c) => sum + c.amount, 0);

      const oTotal = monthContribs
        .filter((c) => !['MONTHLY', 'TEA'].includes(c.type))
        .reduce((sum, c) => sum + c.amount, 0);

      const monthExpenses = expenses
        .filter((e) => {
          const d = new Date(e.date);
          const expMonth = d.toLocaleString('en-US', { month: 'long' });
          return expMonth.toLowerCase() === m.toLowerCase();
        })
        .reduce((sum, e) => sum + e.amount, 0);

      const monthlyContributors = new Set(
        monthContribs.filter((c) => c.type === 'MONTHLY' && c.amount > 0).map((c) => c.memberId)
      ).size;

      const teaContributors = new Set(
        monthContribs.filter((c) => c.type === 'TEA' && c.amount > 0).map((c) => c.memberId)
      ).size;

      const totalUniqueContributors = new Set(
        monthContribs.filter((c) => c.amount > 0).map((c) => c.memberId)
      ).size;

      return {
        month: m,
        year,
        monthlyTotal: mTotal,
        teaTotal: tTotal,
        otherTotal: oTotal,
        expensesTotal: monthExpenses,
        netChange: mTotal + tTotal + oTotal - monthExpenses,
        monthlyContributorsCount: monthlyContributors,
        teaContributorsCount: teaContributors,
        totalContributorsCount: totalUniqueContributors,
      };
    });
  }, [contributions, expenses]);

  // ────────────────────────────────────────────────────────
  // Auth
  // ────────────────────────────────────────────────────────
  const loginAsAdmin = (passcode?: string) => {
    if (!passcode || passcode === 'treasurer2026' || passcode === 'admin' || passcode === 'sol2026') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsAdmin(false);

  // ────────────────────────────────────────────────────────
  // Log Audit helper
  // ────────────────────────────────────────────────────────
  const logAudit = (actor: string, action: 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT' | 'SETTINGS_CHANGE', details: string) => {
    const logItem: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      details,
    };
    setAuditLogs((prev) => [logItem, ...prev]);

    if (supabase) {
      supabase.from('audit_logs').insert([
        {
          id: logItem.id,
          actor: logItem.actor,
          action: logItem.action,
          details: logItem.details,
          timestamp: logItem.timestamp,
        },
      ]).then(({ error }) => {
        if (error) console.error('Audit log Supabase error:', error);
      });
    }
  };

  // ────────────────────────────────────────────────────────
  // Member management
  // ────────────────────────────────────────────────────────
  const addMember = (name: string, phone?: string): Member => {
    const newMember: Member = {
      id: `m-${Date.now()}`,
      name: name.trim(),
      phone: phone?.trim(),
      active: true,
      createdAt: new Date().toISOString(),
    };
    setMembers((prev) => [...prev, newMember]);
    logAudit('Treasurer', 'CREATE', `Added new member "${newMember.name}"`);

    if (supabase) {
      supabase.from('members').insert([
        {
          id: newMember.id,
          name: newMember.name,
          phone: newMember.phone || null,
          active: newMember.active,
          created_at: newMember.createdAt,
        },
      ]).then(({ error }) => {
        if (error) console.error('Failed to add member to Supabase:', error);
      });
    }

    return newMember;
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m))
    );
    logAudit('Treasurer', 'UPDATE', `Updated member information for ID: ${id}`);

    if (supabase) {
      const payload: Record<string, any> = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.active !== undefined) payload.active = updates.active;

      supabase.from('members').update(payload).eq('id', id).then(({ error }) => {
        if (error) console.error('Failed to update member in Supabase:', error);
      });
    }
  };

  const toggleMemberActive = (id: string) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;
    const newStatus = !member.active;
    updateMember(id, { active: newStatus });
    logAudit('Treasurer', 'UPDATE', `${newStatus ? 'Reactivated' : 'Deactivated'} member "${member.name}"`);
  };

  // ────────────────────────────────────────────────────────
  // Contribution actions
  // ────────────────────────────────────────────────────────
  const addContribution = (contribution: Omit<Contribution, 'id' | 'createdAt'>): Contribution => {
    const newContribution: Contribution = {
      ...contribution,
      id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    setContributions((prev) => [newContribution, ...prev]);
    logAudit(
      'Treasurer',
      'CREATE',
      `Recorded ${newContribution.type} contribution for ${newContribution.memberName} – KES ${newContribution.amount} (${newContribution.month} ${newContribution.year})`
    );

    if (supabase) {
      supabase.from('contributions').insert([
        {
          id: newContribution.id,
          member_id: newContribution.memberId || null,
          member_name: newContribution.memberName,
          month: newContribution.month,
          year: newContribution.year,
          type: newContribution.type,
          amount: newContribution.amount,
          date_received: newContribution.dateReceived,
          notes: newContribution.notes || null,
          created_at: newContribution.createdAt,
        },
      ]).then(({ error }) => {
        if (error) console.error('Failed to insert contribution to Supabase:', error);
      });
    }

    return newContribution;
  };

  const updateContribution = (id: string, updates: Partial<Contribution>) => {
    setContributions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    logAudit('Treasurer', 'UPDATE', `Modified contribution record ID: ${id}`);

    if (supabase) {
      const payload: Record<string, any> = { updated_at: new Date().toISOString() };
      if (updates.memberId !== undefined) payload.member_id = updates.memberId;
      if (updates.memberName !== undefined) payload.member_name = updates.memberName;
      if (updates.month !== undefined) payload.month = updates.month;
      if (updates.year !== undefined) payload.year = updates.year;
      if (updates.type !== undefined) payload.type = updates.type;
      if (updates.amount !== undefined) payload.amount = updates.amount;
      if (updates.dateReceived !== undefined) payload.date_received = updates.dateReceived;
      if (updates.notes !== undefined) payload.notes = updates.notes;

      supabase.from('contributions').update(payload).eq('id', id).then(({ error }) => {
        if (error) console.error('Failed to update contribution in Supabase:', error);
      });
    }
  };

  const deleteContribution = (id: string) => {
    const target = contributions.find((c) => c.id === id);
    if (!target) return;
    setContributions((prev) => prev.filter((c) => c.id !== id));
    logAudit(
      'Treasurer',
      'DELETE',
      `Deleted ${target.type} contribution for ${target.memberName} – KES ${target.amount} (${target.month} ${target.year})`
    );

    if (supabase) {
      supabase.from('contributions').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Failed to delete contribution from Supabase:', error);
      });
    }
  };

  const deleteContributionsByMonth = (month: string, year: number, type?: ContributionType): number => {
    let count = 0;
    const targetIds: string[] = [];

    setContributions((prev) => {
      const remaining = prev.filter((c) => {
        const matchMonth = c.month.toLowerCase() === month.toLowerCase() && c.year === year;
        const matchType = type ? c.type === type : true;
        if (matchMonth && matchType) {
          targetIds.push(c.id);
          count++;
          return false;
        }
        return true;
      });
      return remaining;
    });

    logAudit('Treasurer', 'DELETE', `Wiped ${count} contribution record(s) for ${month} ${year}${type ? ` (${type})` : ''}.`);

    if (supabase && targetIds.length > 0) {
      supabase.from('contributions').delete().in('id', targetIds).then(({ error }) => {
        if (error) console.error('Failed to wipe contributions from Supabase:', error);
      });
    }

    return count;
  };

  const bulkDeleteContributions = (ids: string[]): number => {
    const idSet = new Set(ids);
    const targets = contributions.filter((c) => idSet.has(c.id));
    setContributions((prev) => prev.filter((c) => !idSet.has(c.id)));
    logAudit('Treasurer', 'DELETE', `Bulk deleted ${targets.length} contribution record(s).`);

    if (supabase && ids.length > 0) {
      supabase.from('contributions').delete().in('id', ids).then(({ error }) => {
        if (error) console.error('Failed to bulk delete contributions from Supabase:', error);
      });
    }

    return targets.length;
  };

  // Batch import (only items with amount > 0 are saved — blank = not contributed)
  const batchImportContributions = (
    items: {
      memberId: string;
      memberName: string;
      month: string;
      year: number;
      type: ContributionType;
      amount: number;
      notes?: string;
    }[],
    actionIfDuplicate: 'SKIP' | 'REPLACE' | 'ADD' = 'REPLACE'
  ): { importedCount: number; replacedCount: number } => {
    let importedCount = 0;
    let replacedCount = 0;
    const dbUpserts: any[] = [];

    setContributions((prev) => {
      const working = [...prev];

      items.forEach((item) => {
        if (!item.amount || item.amount <= 0) return; // BLANK = skip

        const existingIdx = working.findIndex(
          (c) =>
            c.memberId === item.memberId &&
            c.month.toLowerCase() === item.month.toLowerCase() &&
            c.year === item.year &&
            c.type === item.type
        );

        if (existingIdx !== -1) {
          if (actionIfDuplicate === 'REPLACE') {
            const updated = {
              ...working[existingIdx],
              amount: item.amount,
              notes: item.notes || working[existingIdx].notes,
              dateReceived: new Date().toISOString().split('T')[0],
            };
            working[existingIdx] = updated;
            dbUpserts.push({
              id: updated.id,
              member_id: updated.memberId || null,
              member_name: updated.memberName,
              month: updated.month,
              year: updated.year,
              type: updated.type,
              amount: updated.amount,
              date_received: updated.dateReceived,
              notes: updated.notes || null,
              updated_at: new Date().toISOString(),
            });
            replacedCount++;
          } else if (actionIfDuplicate === 'ADD') {
            const newRecord: Contribution = {
              id: `c-import-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              memberId: item.memberId,
              memberName: item.memberName,
              month: item.month,
              year: item.year,
              type: item.type,
              amount: item.amount,
              dateReceived: new Date().toISOString().split('T')[0],
              notes: item.notes,
              createdAt: new Date().toISOString(),
            };
            working.push(newRecord);
            dbUpserts.push({
              id: newRecord.id,
              member_id: newRecord.memberId || null,
              member_name: newRecord.memberName,
              month: newRecord.month,
              year: newRecord.year,
              type: newRecord.type,
              amount: newRecord.amount,
              date_received: newRecord.dateReceived,
              notes: newRecord.notes || null,
              created_at: newRecord.createdAt,
            });
            importedCount++;
          }
        } else {
          const newRecord: Contribution = {
            id: `c-import-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            memberId: item.memberId,
            memberName: item.memberName,
            month: item.month,
            year: item.year,
            type: item.type,
            amount: item.amount,
            dateReceived: new Date().toISOString().split('T')[0],
            notes: item.notes,
            createdAt: new Date().toISOString(),
          };
          working.push(newRecord);
          dbUpserts.push({
            id: newRecord.id,
            member_id: newRecord.memberId || null,
            member_name: newRecord.memberName,
            month: newRecord.month,
            year: newRecord.year,
            type: newRecord.type,
            amount: newRecord.amount,
            date_received: newRecord.dateReceived,
            notes: newRecord.notes || null,
            created_at: newRecord.createdAt,
          });
          importedCount++;
        }
      });

      return working;
    });

    logAudit('Treasurer', 'IMPORT', `Batch imported ${importedCount} new + ${replacedCount} updated contribution records.`);

    if (supabase && dbUpserts.length > 0) {
      supabase.from('contributions').upsert(dbUpserts, { onConflict: 'id' }).then(({ error }) => {
        if (error) console.error('Failed to batch import into Supabase:', error);
      });
    }

    return { importedCount, replacedCount };
  };

  // ────────────────────────────────────────────────────────
  // Expense management
  // ────────────────────────────────────────────────────────
  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    const newExpense: Expense = {
      ...expense,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    logAudit('Treasurer', 'CREATE', `Recorded expense: "${newExpense.description}" – KES ${newExpense.amount} [${newExpense.category}]`);

    if (supabase) {
      supabase.from('expenses').insert([
        {
          id: newExpense.id,
          date: newExpense.date,
          description: newExpense.description,
          category: newExpense.category,
          amount: newExpense.amount,
          reference: newExpense.reference || null,
          notes: newExpense.notes || null,
          created_at: newExpense.createdAt,
        },
      ]).then(({ error }) => {
        if (error) console.error('Failed to insert expense into Supabase:', error);
      });
    }

    return newExpense;
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    logAudit('Treasurer', 'UPDATE', `Updated expense record ID: ${id}`);

    if (supabase) {
      const payload: Record<string, any> = { updated_at: new Date().toISOString() };
      if (updates.date !== undefined) payload.date = updates.date;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.amount !== undefined) payload.amount = updates.amount;
      if (updates.reference !== undefined) payload.reference = updates.reference;
      if (updates.notes !== undefined) payload.notes = updates.notes;

      supabase.from('expenses').update(payload).eq('id', id).then(({ error }) => {
        if (error) console.error('Failed to update expense in Supabase:', error);
      });
    }
  };

  const deleteExpense = (id: string) => {
    const target = expenses.find((e) => e.id === id);
    if (!target) return;
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    logAudit('Treasurer', 'DELETE', `Deleted expense "${target.description}" – KES ${target.amount}`);

    if (supabase) {
      supabase.from('expenses').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Failed to delete expense from Supabase:', error);
      });
    }
  };

  // ────────────────────────────────────────────────────────
  // Special Projects
  // ────────────────────────────────────────────────────────
  const addSpecialProject = (project: Omit<SpecialProject, 'id'>): SpecialProject => {
    const newProject: SpecialProject = {
      ...project,
      id: `proj-${Date.now()}`,
    };
    setSpecialProjects((prev) => [newProject, ...prev]);
    logAudit('Treasurer', 'CREATE', `Created special project: "${newProject.name}" (target KES ${newProject.targetAmount})`);

    if (supabase) {
      supabase.from('special_projects').insert([
        {
          id: newProject.id,
          name: newProject.name,
          description: newProject.description || null,
          target_amount: newProject.targetAmount,
          status: newProject.status,
          started_at: newProject.startedAt,
          completed_at: newProject.completedAt || null,
          notes: newProject.notes || null,
        },
      ]).then(({ error }) => {
        if (error) console.error('Failed to add special project to Supabase:', error);
      });
    }

    return newProject;
  };

  const updateSpecialProject = (id: string, updates: Partial<SpecialProject>) => {
    setSpecialProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    if (supabase) {
      const payload: Record<string, any> = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.targetAmount !== undefined) payload.target_amount = updates.targetAmount;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.startedAt !== undefined) payload.started_at = updates.startedAt;
      if (updates.completedAt !== undefined) payload.completed_at = updates.completedAt;
      if (updates.notes !== undefined) payload.notes = updates.notes;

      supabase.from('special_projects').update(payload).eq('id', id).then(({ error }) => {
        if (error) console.error('Failed to update special project in Supabase:', error);
      });
    }
  };

  const deleteSpecialProject = (id: string) => {
    const target = specialProjects.find((p) => p.id === id);
    if (!target) return;
    setSpecialProjects((prev) => prev.filter((p) => p.id !== id));
    logAudit('Treasurer', 'DELETE', `Deleted special project: "${target.name}"`);

    if (supabase) {
      supabase.from('special_projects').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Failed to delete special project from Supabase:', error);
      });
    }
  };

  const toggleProjectStatus = (id: string) => {
    const project = specialProjects.find((p) => p.id === id);
    if (!project) return;
    const newStatus = project.status === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE';
    updateSpecialProject(id, {
      status: newStatus,
      completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : undefined,
    });
    logAudit('Treasurer', 'UPDATE', `Special project "${project.name}" marked as ${newStatus}.`);
  };

  // ────────────────────────────────────────────────────────
  // Settings & Reset
  // ────────────────────────────────────────────────────────
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logAudit('Treasurer', 'SETTINGS_CHANGE', `Updated system treasury settings.`);

    if (supabase) {
      const payload: Record<string, any> = {
        id: 'primary_settings',
        updated_at: new Date().toISOString(),
      };
      if (newSettings.organizationName !== undefined) payload.organization_name = newSettings.organizationName;
      if (newSettings.location !== undefined) payload.location = newSettings.location;
      if (newSettings.teamName !== undefined) payload.team_name = newSettings.teamName;
      if (newSettings.currency !== undefined) payload.currency = newSettings.currency;
      if (newSettings.expectedMonthlyContribution !== undefined) payload.expected_monthly = newSettings.expectedMonthlyContribution;
      if (newSettings.expectedTeaContribution !== undefined) payload.expected_tea = newSettings.expectedTeaContribution;
      if (newSettings.expectedTeaUrnContribution !== undefined) payload.expected_tea_urn = newSettings.expectedTeaUrnContribution;
      if (newSettings.openingBalance !== undefined) payload.opening_balance = newSettings.openingBalance;

      supabase.from('settings').upsert(payload, { onConflict: 'id' }).then(({ error }) => {
        if (error) console.error('Failed to update settings in Supabase:', error);
      });
    }
  };

  const resetToInitialData = () => {
    setMembers(INITIAL_MEMBERS);
    setContributions(INITIAL_CONTRIBUTIONS);
    setExpenses(INITIAL_EXPENSES);
    setSettings(DEFAULT_SETTINGS);
    setSpecialProjects(INITIAL_SPECIAL_PROJECTS);
    logAudit('System', 'IMPORT', 'Reset treasury records to initial seed data.');
    try { localStorage.clear(); } catch {}
  };

  return (
    <TreasuryContext.Provider
      value={{
        members,
        contributions,
        expenses,
        settings,
        auditLogs,
        specialProjects,
        isLoading,
        isAdmin,
        isSupabaseLive,
        isSyncing,
        lastSyncedAt,
        refreshFromCloud: fetchSupabaseData,
        currentBalance,
        totalMonthly,
        totalTea,
        totalOther,
        totalExpenses,
        monthlyStats,
        loginAsAdmin,
        logout,
        addMember,
        updateMember,
        toggleMemberActive,
        addContribution,
        updateContribution,
        deleteContribution,
        deleteContributionsByMonth,
        bulkDeleteContributions,
        batchImportContributions,
        addExpense,
        updateExpense,
        deleteExpense,
        addSpecialProject,
        updateSpecialProject,
        deleteSpecialProject,
        toggleProjectStatus,
        updateSettings,
        resetToInitialData,
      }}
    >
      {children}
    </TreasuryContext.Provider>
  );
}

export function useTreasury() {
  const context = useContext(TreasuryContext);
  if (!context) {
    throw new Error('useTreasury must be used within a TreasuryProvider');
  }
  return context;
}
