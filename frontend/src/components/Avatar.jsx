import React from 'react';

export default function Avatar({ user, size = 'md' }) {
  const sizes = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl'
  };
  
  const colors = ['bg-violet-600', 'bg-cyan-600', 'bg-emerald-600', 'bg-rose-600', 'bg-amber-600', 'bg-indigo-600'];
  const name = user?.name || 'Unknown';
  const charCode = name.charCodeAt(0) || 0;
  const color = colors[charCode % colors.length];

  return (
    <div className={`flex items-center justify-center rounded-full text-white font-bold shrink-0 ${sizes[size]} ${color}`}>
      {user?.avatar ? (
        <img src={user.avatar} alt={name} className="w-full h-full rounded-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  );
}
