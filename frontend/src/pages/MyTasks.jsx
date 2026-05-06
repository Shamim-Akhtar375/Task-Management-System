import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { CheckSquare } from 'lucide-react';
import PriorityBadge from '../components/PriorityBadge';
import StatusChip from '../components/StatusChip';
import Avatar from '../components/Avatar';
import TaskPanel from '../components/TaskPanel';
import EmptyState from '../components/EmptyState';

export default function MyTasks() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '', projectId: '', search: '', sortBy: 'dueDate' });
  const [searchInput, setSearchInput] = useState('');
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['myTasks', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      Object.keys(filters).forEach(k => { if (!filters[k]) params.delete(k); });
      const res = await api.get(`/tasks/my-tasks?${params.toString()}`);
      return res.data;
    }
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data;
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await api.patch(`/tasks/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myTasks']);
    }
  });

  if (isLoading) return <div className="page"><div className="skeleton h-96 w-full rounded-2xl"></div></div>;

  const statuses = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
  
  return (
    <div className="page flex flex-col h-full">
      <div className="mb-6">
        <h1>My Tasks</h1>
        <p className="subtitle">All tasks assigned to you</p>
      </div>

      <div className="filter-bar">
        <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="DONE">Done</option>
        </select>
        
        <select value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})}>
          <option value="">All Priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select value={filters.projectId} onChange={e => setFilters({...filters, projectId: e.target.value})}>
          <option value="">All Projects</option>
          {projects?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <input 
          type="text" 
          placeholder="🔍 Search tasks..." 
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className="flex-1 min-w-[200px]"
        />

        <select value={filters.sortBy} onChange={e => setFilters({...filters, sortBy: e.target.value})} className="ml-auto">
          <option value="dueDate">Sort by: Due Date</option>
          <option value="createdAt">Sort by: Created Date</option>
        </select>
      </div>

      {tasks?.length === 0 && !filters.search && !filters.status && !filters.priority && !filters.projectId ? (
        <EmptyState 
          icon={CheckSquare} 
          title="You have no tasks assigned yet" 
          subtitle="Ask your project admin to assign tasks to you" 
        />
      ) : (
        <div className="flex-1 overflow-y-auto space-y-6 pb-12">
          {statuses.map(status => {
            const statusTasks = tasks?.filter(t => t.status === status) || [];
            if (statusTasks.length === 0) return null;
            return (
              <div key={status} className="card p-0 overflow-hidden">
                <div className="bg-surface border-b border-borderGlass p-4 flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2">
                    <StatusChip status={status} />
                    <span className="text-textMuted text-sm">({statusTasks.length})</span>
                  </h3>
                </div>
                <div className="divide-y divide-borderGlass">
                  {statusTasks.map(task => {
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
                    return (
                      <div key={task.id} className="p-4 hover:bg-white/5 flex items-center justify-between group transition-colors">
                        <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => setSelectedTask(task)}>
                          <PriorityBadge priority={task.priority} />
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-200">{task.title}</span>
                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                              <span>Assigned by: {task.creator?.name}</span>
                              {task.dueDate && (
                                <span className={isOverdue ? 'text-red-400 font-medium' : ''}>
                                  Due: {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface text-xs font-medium border border-borderGlass">
                            <div className="w-2 h-2 rounded-full" style={{background: task.project.color}} />
                            {task.project.name}
                          </span>
                          <select 
                            className="bg-surface border border-borderGlass text-xs rounded-md px-2 py-1 outline-none"
                            value={task.status}
                            onChange={(e) => updateStatus.mutate({ id: task.id, status: e.target.value })}
                          >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="IN_REVIEW">In Review</option>
                            <option value="DONE">Done</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskPanel task={selectedTask} isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} />
    </div>
  );
}
