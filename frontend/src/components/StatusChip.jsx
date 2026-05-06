import React from 'react';

export default function StatusChip({ status }) {
  const colors = {
    TODO: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    IN_PROGRESS: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    IN_REVIEW: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    DONE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  };
  const labels = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    IN_REVIEW: 'In Review',
    DONE: 'Done'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status] || colors.TODO}`}>
      {labels[status] || status}
    </span>
  );
}
