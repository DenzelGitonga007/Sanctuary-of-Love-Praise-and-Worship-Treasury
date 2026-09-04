'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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

  // Calculated metrics
  currentBalance: number;
  totalMonthly: number;
  totalTea: number;
  totalOther: number;
  totalExpenses: number;
  monthlyStats: MonthlyStat[];

  // Actions — Members
  loginAsAdmin: (passcode?: string) => boolean;
  logout: () => void;
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

  // Load from LocalStorage on mount
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
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save changes to LocalStorage
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

      // Match expenses for this month by their date — using locale long month name
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
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Treasurer',
        action: 'CREATE',
        details: `Added new member "${newMember.name}"`,
      },
      ...prev,
    ]);
    return newMember;
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m))
    );
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Treasurer',
        action: 'UPDATE',
        details: `Updated member information for ID: ${id}`,
      },
      ...prev,
    ]);
  };

  const toggleMemberActive = (id: string) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;
    const newStatus = !member.active;
    updateMember(id, { active: newStatus });
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Treasurer',
        action: 'UPDATE',
        details: `${newStatus ? 'Reactivated' : 'Deactivated'} member "${member.name}"`,
      },
      ...prev,
    ]);
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
    setContributions((prev) => [...prev, newContribution]);
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Treasurer',
        action: 'CREATE',
        details: `Recorded ${newContribution.type} contribution for ${newContribution.memberName} – KES ${newContribution.amount} (${newContribution.month} ${newContribution.year})`,
      },
      ...prev,
    ]);
    return newContribution;
  };

  const updateContribution = (id: string, updates: Partial<Contribution>) => {
    setContributions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Treasurer',
        action: 'UPDATE',
        details: `Modified contribution record ID: ${id}`,
      },
      ...prev,
    ]);
  };

  const deleteContribution = (id: string) => {
    const target = contributions.find((c) => c.id === id);
    if (!target) return;
    setContributions((prev) => prev.filter((c) => c.id !== id));
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Treasurer',
        action: 'DELETE',
        details: `Deleted ${target.type} contribution for ${target.memberName} – KES ${target.amount} (${target.month} ${target.year})`,
      },
      ...prev,
    ]);
  };

  /** Delete all contributions for a specific month/year (optionally filtered by type). Returns count deleted. */
  const deleteContributionsByMonth = (month: string, year: number, type?: ContributionType): number => {
    let count = 0;
    setContributions((prev) => {
      const remaining = prev.filter((c) => {
        const matchMonth = c.month.toLowerCase() === month.toLowerCase() && c.year === year;
        const matchType = type ? c.type === type : true;
        if (matchMonth && matchType) { count++; return false; }
        return true;
      });
      return remaining;
    });
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Treasurer',
        action: 'DELETE',
        details: `Wiped ${count} contribution record(s) for ${month} ${year}${type ? ` (${type})` : ''}.`,
      },
      ...prev,
    ]);
    return count;
  };

  /** Delete a list of contributions by ID. Returns count deleted. */
  const bulkDeleteContributions = (ids: string[]): number => {
    const idSet = new Set(ids);
    const targets = contributions.filter((c) => idSet.has(c.id));
    setContributions((prev) => prev.filter((c) => !idSet.has(c.id)));
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Treasurer',
        action: 'DELETE',
        details: `Bulk deleted ${targets.length} contribution record(s).`,
      },
      ...prev,
    ]);
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
  ) => {
    let importedCount = 0;
    let replacedCount = 0;

    setContributions((prev) => {
      const working = [...prev];

      items.forEach((item) => {
        if (!item.amount || item.amount <= 0) return; // BLANK = skip, do NOT save

        const existingIdx = working.findIndex(
          (c) =>
            c.memberId === item.memberId &&
            c.month.toLowerCase() === item.month.toLowerCase() &&
            c.year === item.year &&
            c.type === item.type
        );

        if (existingIdx !== -1) {
          if (actionIfDuplicate === 'REPLACE') {
            working[existingIdx] = {
              ...working[existingIdx],
              amount: item.amount,
              notes: item.notes || working[existingIdx].notes,
              dateReceived: new Date().toISOString().split('T')[0],
            };
            replacedCount++;
          } else if (actionIfDuplicate === 'ADD') {
            working.push({
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
            });
            importedCount++;
          }
          // SKIP: do nothing
        } else {
          working.push({
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
          });
          importedCount++;
        }
      });

      return working;
    });

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Treasurer',
        action: 'IMPORT',
        details: `Batch imported ${importedCount} new + ${replacedCount} updated contribution records.`,
      },
      ...prev,
    ]);

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
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Treasurer',
        action: 'CREATE',
        details: `Recorded expense: "${newExpense.description}" – KES ${newExpense.amount} [${newExpense.category}]`,
      },
      ...prev,
    ]);
    return newExpense;
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Treasurer',
        action: 'UPDATE',
        details: `Updated expense record ID: ${id}`,
      },
      ...prev,
    ]);
  };

  const deleteExpense = (id: string) => {
    const target = expenses.find((e) => e.id === id);
    if (!target) return;
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Treasurer',
        action: 'DELETE',
        details: `Deleted expense "${target.description}" – KES ${target.amount}`,
      },
      ...prev,
    ]);
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
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Treasurer',
        action: 'CREATE',
        details: `Created special project: "${newProject.name}" (target KES ${newProject.targetAmount})`,
      },
      ...prev,
    ]);
    return newProject;
  };

  const updateSpecialProject = (id: string, updates: Partial<SpecialProject>) => {
    setSpecialProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteSpecialProject = (id: string) => {
    const target = specialProjects.find((p) => p.id === id);
    if (!target) return;
    setSpecialProjects((prev) => prev.filter((p) => p.id !== id));
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Treasurer',
        action: 'DELETE',
        details: `Deleted special project: "${target.name}"`,
      },
      ...prev,
    ]);
  };

  const toggleProjectStatus = (id: string) => {
    const project = specialProjects.find((p) => p.id === id);
    if (!project) return;
    const newStatus = project.status === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE';
    updateSpecialProject(id, {
      status: newStatus,
      completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : undefined,
    });
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Treasurer',
        action: 'UPDATE',
        details: `Special project "${project.name}" marked as ${newStatus}.`,
      },
      ...prev,
    ]);
  };

  // ────────────────────────────────────────────────────────
  // Settings & Reset
  // ────────────────────────────────────────────────────────
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Treasurer',
        action: 'SETTINGS_CHANGE',
        details: `Updated system treasury settings.`,
      },
      ...prev,
    ]);
  };

  const resetToInitialData = () => {
    setMembers(INITIAL_MEMBERS);
    setContributions(INITIAL_CONTRIBUTIONS);
    setExpenses(INITIAL_EXPENSES);
    setSettings(DEFAULT_SETTINGS);
    setSpecialProjects(INITIAL_SPECIAL_PROJECTS);
    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'System',
        action: 'IMPORT',
        details: 'Reset treasury records to initial seed data.',
      },
    ]);
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
