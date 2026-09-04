'use client';

import React, { useState } from 'react';
import { useTreasury } from '@/lib/store';
import {
  Rocket,
  PlusCircle,
  CheckCircle2,
  Clock,
  Trash2,
  X,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react';

export default function AdminProjectsPage() {
  const { specialProjects, contributions, addSpecialProject, toggleProjectStatus, deleteSpecialProject, settings } = useTreasury();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState(2000);
  const [startedAt, setStartedAt] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addSpecialProject({
      name: name.trim(),
      description: description.trim() || undefined,
      targetAmount: Number(targetAmount),
      status: 'ACTIVE',
      startedAt: new Date(startedAt).toISOString(),
      notes: notes.trim() || undefined,
    });
    setIsAdding(false);
    setName('');
    setDescription('');
    setNotes('');
    setTargetAmount(2000);
  };

  // For each project, calculate how much has been raised from TEA_URN / SPECIAL contributions with notes containing the project ID
  const getProjectRaised = (projectId: string): number => {
    return contributions
      .filter(
        (c) =>
          (c.type === 'TEA_URN' || c.type === 'SPECIAL') &&
          c.notes?.includes(projectId)
      )
      .reduce((s, c) => s + c.amount, 0);
  };

  const active = specialProjects.filter((p) => p.status === 'ACTIVE');
  const completed = specialProjects.filter((p) => p.status === 'COMPLETED');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-church-dark-900 dark:text-white">
            Special Projects
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track fundraising drives like the Tea Urn Drive, Microphone Fund, Uniform Fund, etc.
            All contributions count toward the general treasury balance.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isAdding ? 'Close Form' : 'New Special Project'}</span>
        </button>
      </div>

      {/* Add Project Form */}
      {isAdding && (
        <div className="bg-white dark:bg-church-dark-900 p-6 rounded-3xl border border-purple-200 dark:border-church-dark-800 shadow-md animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-church-dark-800 pb-3">
            <h3 className="font-bold text-sm text-church-dark-900 dark:text-white flex items-center space-x-2">
              <Rocket className="w-4 h-4 text-purple-600" />
              <span>Create New Fundraising Drive</span>
            </h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Project Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Microphone Stand Fund, Uniform Drive..."
                required
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this project for? (optional)"
                rows={2}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Target Amount ({settings.currency}) *
              </label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                required
                min={1}
                className="w-full p-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startedAt}
                onChange={(e) => setStartedAt(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional details..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-church-dark-700 bg-white dark:bg-church-dark-800"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs text-slate-500 font-medium">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs">
                Create Project
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Projects */}
      {active.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-church-dark-900 dark:text-white mb-3 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <span>Active Projects ({active.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.map((p) => {
              const raised = getProjectRaised(p.id);
              const pct = Math.min(100, Math.round((raised / p.targetAmount) * 100));
              return (
                <ProjectCard
                  key={p.id}
                  project={p}
                  raised={raised}
                  pct={pct}
                  currency={settings.currency}
                  onToggle={() => toggleProjectStatus(p.id)}
                  onDelete={() => {
                    if (confirm(`Delete project "${p.name}"?`)) deleteSpecialProject(p.id);
                  }}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Completed Projects */}
      {completed.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-church-dark-900 dark:text-white mb-3 flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-church-gold-500" />
            <span>Completed Projects ({completed.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completed.map((p) => {
              const raised = getProjectRaised(p.id);
              const pct = Math.min(100, Math.round((raised / p.targetAmount) * 100));
              return (
                <ProjectCard
                  key={p.id}
                  project={p}
                  raised={raised}
                  pct={pct}
                  currency={settings.currency}
                  onToggle={() => toggleProjectStatus(p.id)}
                  onDelete={() => {
                    if (confirm(`Delete project "${p.name}"?`)) deleteSpecialProject(p.id);
                  }}
                />
              );
            })}
          </div>
        </section>
      )}

      {active.length === 0 && completed.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Rocket className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No special projects yet.</p>
          <p className="text-xs mt-1">Click &quot;New Special Project&quot; to start a fundraising drive.</p>
        </div>
      )}

      {/* Guide */}
      <div className="bg-slate-50 dark:bg-church-dark-950 rounded-2xl p-5 border border-slate-200 dark:border-church-dark-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
        <p className="font-bold text-slate-700 dark:text-slate-300">💡 How to record contributions to a project</p>
        <p>1. Go to <strong>Import List</strong> or <strong>Add Single Contribution</strong>.</p>
        <p>2. Set the contribution type to <strong>Special Project</strong>.</p>
        <p>3. In the <strong>Notes</strong> field, include the project ID shown on the card (e.g. <code className="bg-slate-200 dark:bg-church-dark-800 px-1 rounded">proj-1</code>).</p>
        <p>4. The project progress bar will automatically update. All amounts count toward the general balance.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Project Card Sub-Component
// ─────────────────────────────────────────────
function ProjectCard({
  project,
  raised,
  pct,
  currency,
  onToggle,
  onDelete,
}: {
  project: { id: string; name: string; description?: string; targetAmount: number; status: 'ACTIVE' | 'COMPLETED'; startedAt: string; completedAt?: string; notes?: string };
  raised: number;
  pct: number;
  currency: string;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const isCompleted = project.status === 'COMPLETED';

  return (
    <div className={`bg-white dark:bg-church-dark-900 rounded-2xl border shadow-sm p-5 space-y-4 transition-all ${
      isCompleted
        ? 'border-church-gold-200 dark:border-church-gold-900/40'
        : 'border-purple-200 dark:border-purple-900/40'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-sm text-church-dark-900 dark:text-white truncate">
              {project.name}
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
              isCompleted
                ? 'bg-church-gold-100 dark:bg-church-gold-900/30 text-church-gold-700 dark:text-church-gold-400'
                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
            }`}>
              {isCompleted ? '✓ Completed' : '⚡ Active'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            ID: <code className="bg-slate-100 dark:bg-church-dark-800 px-1 rounded">{project.id}</code>
            {' · '}Started: {new Date(project.startedAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
            {project.completedAt && (
              <span> · Completed: {new Date(project.completedAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            )}
          </p>
          {project.description && (
            <p className="text-xs text-slate-500 mt-1">{project.description}</p>
          )}
        </div>
        <button onClick={onDelete} className="text-slate-300 hover:text-church-rose-500 transition-colors shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center space-x-1 text-slate-500">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Raised: <strong className="text-church-dark-900 dark:text-white">{currency} {raised.toLocaleString()}</strong></span>
          </span>
          <span className="flex items-center space-x-1 text-slate-500">
            <Target className="w-3.5 h-3.5" />
            <span>Goal: <strong className="text-church-dark-900 dark:text-white">{currency} {project.targetAmount.toLocaleString()}</strong></span>
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-church-dark-800 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all ${
              isCompleted
                ? 'bg-gradient-to-r from-church-gold-400 to-church-gold-600'
                : pct >= 80
                ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                : 'bg-gradient-to-r from-purple-400 to-purple-600'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 text-right">{pct}% funded</p>
      </div>

      {project.notes && (
        <p className="text-[11px] text-slate-500 italic border-t border-slate-100 dark:border-church-dark-800 pt-3">{project.notes}</p>
      )}

      {/* Toggle Status Button */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-semibold transition-all ${
          isCompleted
            ? 'bg-slate-100 dark:bg-church-dark-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400'
            : 'bg-church-gold-50 dark:bg-church-gold-900/20 hover:bg-church-gold-100 text-church-gold-700 dark:text-church-gold-400 border border-church-gold-200 dark:border-church-gold-800'
        }`}
      >
        {isCompleted ? (
          <><Clock className="w-3.5 h-3.5" /><span>Re-open as Active</span></>
        ) : (
          <><CheckCircle2 className="w-3.5 h-3.5" /><span>Mark as Completed 🎉</span></>
        )}
      </button>
    </div>
  );
}
