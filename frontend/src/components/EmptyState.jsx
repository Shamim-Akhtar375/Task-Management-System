import React from 'react';

export default function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-20 h-20 rounded-full bg-surface border border-borderGlass flex items-center justify-center mb-6 text-textMuted shadow-lg">
        <Icon size={40} className="opacity-50" />
      </div>
      <h3 className="text-xl font-bold text-textPrimary mb-2">{title}</h3>
      {subtitle && <p className="text-textMuted max-w-sm">{subtitle}</p>}
    </div>
  );
}
