import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import Avatar from '../components/Avatar';
import { Users } from 'lucide-react';

export default function Team() {
  const { data: team, isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const res = await api.get('/team');
      return res.data;
    }
  });

  if (isLoading) return <div className="page"><div className="skeleton h-96 w-full rounded-2xl"></div></div>;

  return (
    <div className="page">
      <div className="mb-8">
        <h1>Team</h1>
        <p className="subtitle">People you collaborate with</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Project Members</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team?.map(member => (
            <div key={member.id} className="card flex flex-col items-center text-center">
              <Avatar user={member} size="lg" />
              <h3 className="font-bold text-lg mt-4">{member.name}</h3>
              <p className="text-textMuted text-sm mb-3">{member.email}</p>
              
              <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-6 ${
                member.role === 'ADMIN' ? 'bg-violet-500/20 text-violet-400' : 'bg-slate-500/20 text-slate-400'
              }`}>
                {member.role}
              </span>

              <div className="w-full border-t border-borderGlass pt-4 text-left">
                <p className="text-xs text-textMuted font-medium mb-2 uppercase tracking-wider">Shared projects:</p>
                <div className="flex flex-wrap gap-2">
                  {member.sharedProjects?.map(p => (
                    <span key={p.id} className="flex items-center gap-1.5 text-xs bg-surface border border-borderGlass px-2 py-1 rounded-md">
                      <div className="w-2 h-2 rounded-full" style={{background: p.color}} />
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {team?.length === 0 && (
            <div className="col-span-full py-12 text-center text-textMuted">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>You haven't collaborated with anyone yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
