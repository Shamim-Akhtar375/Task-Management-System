import React from 'react';

export default function PriorityBadge({ priority }) {
  const colors = {
    CRITICAL: 'bg-danger/20 text-danger border-danger/30',
    HIGH: 'bg-warning/20 text-warning border-warning/30',
    MEDIUM: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    LOW: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] uppercase font-bold tracking-wider ${colors[priority] || colors.MEDIUM}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {priority}
    </span>
  );
}
