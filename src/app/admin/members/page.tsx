'use client';

import React, { useState } from 'react';
import { useTreasury } from '@/lib/store';
import {
  Users,
  UserPlus,
  Edit2,
  CheckCircle,
  XCircle,
  Search,
  Check,
  X,
} from 'lucide-react';

export default function AdminMembersPage() {
  const { members, addMember, updateMember, toggleMemberActive } = useTreasury();
  const [searchQuery, setSearchQuery] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    addMember(newMemberName.trim());
    setNewMemberName('');
  };

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      updateMember(id, { name: editName.trim() });
    }
    setEditingId(null);
  };

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-church-dark-900 dark:text-white">
            Manage Praise & Worship Members
          </h1>
          <p className="text-xs text-slate-500">
            Total registered members: {members.length} ({members.filter((m) => m.active).length} active)
          </p>
        </div>
      </div>

      {/* Add Member Card */}
      <div className="bg-white dark:bg-church-dark-900 p-6 rounded-3xl border border-slate-200 dark:border-church-dark-800 shadow-sm">
        <h3 className="font-bold text-sm text-church-dark-900 dark:text-white mb-3">
          Add New Team Member
        </h3>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="Enter full member name (e.g. Min Jane Doe)..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-church-sky-500"
            required
          />
          <button
            type="submit"
            className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-church-sky-600 hover:bg-church-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </form>
      </div>

      {/* Filter */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter members by name..."
          className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 text-slate-900 dark:text-white"
        />
      </div>

      {/* Members Table */}
      <div className="bg-white dark:bg-church-dark-900 rounded-3xl border border-slate-200 dark:border-church-dark-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-church-dark-950 border-b border-slate-200 dark:border-church-dark-800 text-slate-500 text-[11px] uppercase font-bold">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-church-dark-800/60 font-sans">
              {filtered.map((m, idx) => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-church-dark-800/40">
                  <td className="py-3 px-4 font-mono text-slate-400 text-xs">{idx + 1}</td>
                  <td className="py-3 px-4 font-semibold text-church-dark-900 dark:text-white">
                    {editingId === m.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-2 py-1 text-xs border rounded bg-white dark:bg-church-dark-800"
                        />
                        <button
                          onClick={() => handleSaveEdit(m.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span>{m.name}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {m.active ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                        <CheckCircle className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-medium">
                        <XCircle className="w-3 h-3" />
                        <span>Inactive</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleStartEdit(m.id, m.name)}
                      className="p-1 text-slate-400 hover:text-church-sky-600 rounded"
                      title="Edit Name"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleMemberActive(m.id)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg ${
                        m.active
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {m.active ? 'Deactivate' : 'Reactivate'}
                    </button>
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
