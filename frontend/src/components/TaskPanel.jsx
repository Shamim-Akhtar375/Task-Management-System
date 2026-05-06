import React from 'react';
import { X } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import StatusChip from './StatusChip';
import Avatar from './Avatar';

export default function TaskPanel({ task, isOpen, onClose }) {
  if (!isOpen || !task) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-surface border-l border-borderGlass shadow-2xl z-50 p-6 flex flex-col backdrop-blur-2xl transition-transform">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <StatusChip status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-textMuted hover:text-textPrimary">
            <X size={20} />
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-4">{task.title}</h2>
        <div className="space-y-6 flex-1 overflow-y-auto">
          <div>
            <h4 className="text-sm font-medium text-textMuted mb-2">Description</h4>
            <p className="text-slate-300">{task.description || 'No description provided.'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-textMuted mb-2">Assignee</h4>
              <div className="flex items-center gap-2">
                <Avatar user={task.assignee} size="sm" />
                <span className="text-sm">{task.assignee?.name || 'Unassigned'}</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-textMuted mb-2">Project</h4>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: task.project?.color || '#7c3aed' }} />
                <span className="text-sm">{task.project?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
