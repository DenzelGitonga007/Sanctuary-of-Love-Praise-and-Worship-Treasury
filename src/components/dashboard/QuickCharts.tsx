'use client';

import React, { useState } from 'react';
import { useTreasury } from '@/lib/store';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, DollarSign } from 'lucide-react';

export default function QuickCharts() {
  const { monthlyStats, members, contributions, expenses, settings } = useTreasury();
  const [activeTab, setActiveTab] = useState<'trends' | 'categories'>('trends');

  // Chart 1 & 3: Monthly Inflows vs Expenses
  const barData = monthlyStats.map((stat) => ({
    name: stat.month.slice(0, 3),
    Monthly: stat.monthlyTotal,
    Tea: stat.teaTotal,
    Expenses: stat.expensesTotal,
    TotalInflow: stat.monthlyTotal + stat.teaTotal + stat.otherTotal,
  }));

  // Category breakdown for expenses
  const expenseCategories = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(expenseCategories).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#0284c7', '#e11d48', '#ca8a04', '#0f766e', '#7c3aed', '#64748b'];

  return (
    <div className="bg-white dark:bg-church-dark-900 rounded-3xl p-5 sm:p-8 border border-slate-200 dark:border-church-dark-800 shadow-sm space-y-6">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-church-dark-800 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-church-dark-900 dark:text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-church-sky-600" />
            <span>Financial Analytics & Trends</span>
          </h3>
          <p className="text-xs text-slate-500">
            Visualizing team income, tea fund growth, and expenditure patterns
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-church-dark-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'trends'
                ? 'bg-white dark:bg-church-dark-700 text-church-sky-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-church-sky-600'
            }`}
          >
            Monthly Income vs Expenses
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'categories'
                ? 'bg-white dark:bg-church-dark-700 text-church-sky-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-church-sky-600'
            }`}
          >
            Expense Categories
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      {activeTab === 'trends' ? (
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip
                formatter={(value: any) => [`${settings.currency} ${Number(value).toLocaleString()}`, '']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Monthly" fill="#0284c7" name="Monthly Inflow" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Tea" fill="#ca8a04" name="Tea Inflow" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#e11d48" name="Expenses" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 pt-2">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${settings.currency} ${Number(value).toLocaleString()}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Disbursement Distribution
            </h4>
            <div className="space-y-2">
              {pieData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-bold text-church-dark-900 dark:text-white">
                    {settings.currency} {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
