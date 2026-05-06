import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line } from 'recharts';
import { format, isAfter, formatDistanceToNow } from 'date-fns';
import { CheckCircle, Clock, AlertTriangle, ListTodo, Activity, PieChart as PieChartIcon } from 'lucide-react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import StatusChip from '../components/StatusChip';
import PriorityBadge from '../components/PriorityBadge';
import TaskPanel from '../components/TaskPanel';
import EmptyState from '../components/EmptyState';

const STATUS_COLORS = {
  TODO: '#64748b',
  IN_PROGRESS: '#06b6d4',
  IN_REVIEW: '#f59e0b',
  DONE: '#10b981'
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data;
    }
  });

  const { data: activity } = useQuery({
    queryKey: ['activity'],
    queryFn: async () => {
      const res = await api.get('/dashboard/activity');
      return res.data;
    }
  });

  const { data: myTasks } = useQuery({
    queryKey: ['myTasksTop5'],
    queryFn: async () => {
      const res = await api.get('/tasks/my-tasks');
      return res.data;
    }
  });

  if (isLoading) return <div className="page flex justify-center"><div className="skeleton h-64 w-full"></div></div>;

  const total = data?.totalTasks || 0;
  const completed = data?.completedTasks || 0;
  const overdue = data?.overdueTasks || 0;

  const pieData = [
    { name: 'To Do', value: data?.statusGroups?.find(g => g.status === 'TODO')?._count || 0, color: STATUS_COLORS.TODO },
    { name: 'In Progress', value: data?.statusGroups?.find(g => g.status === 'IN_PROGRESS')?._count || 0, color: STATUS_COLORS.IN_PROGRESS },
    { name: 'In Review', value: data?.statusGroups?.find(g => g.status === 'IN_REVIEW')?._count || 0, color: STATUS_COLORS.IN_REVIEW },
    { name: 'Done', value: completed, color: STATUS_COLORS.DONE },
  ];
  
  const hasTasks = total > 0;

  return (
    <div className="page space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">Welcome back, here's what's happening.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card flex items-center gap-4 relative overflow-hidden">
          <div className="p-4 rounded-xl bg-primary/10 text-primary"><ListTodo size={24} /></div>
          <div>
            <p className="text-textMuted text-sm font-medium">Total Tasks</p>
            <h3 className="text-3xl font-bold mt-1">{total}</h3>
          </div>
          <div className="absolute bottom-2 right-4 h-10 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[{v:2},{v:5},{v:3},{v:8},{v:6},{v:4},{v: total}]}>
                <Line type="monotone" dataKey="v" stroke="#7c3aed" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="p-4 rounded-xl bg-success/10 text-success"><CheckCircle size={24} /></div>
          <div>
            <p className="text-textMuted text-sm font-medium">Completed</p>
            <h3 className="text-3xl font-bold mt-1">{completed}</h3>
            <p className="text-sm text-slate-400 mt-1">
              {total > 0 ? Math.round((completed/total)*100) : 0}% of total
            </p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="p-4 rounded-xl bg-secondary/10 text-secondary"><Clock size={24} /></div>
          <div>
            <p className="text-textMuted text-sm font-medium">In Progress</p>
            <h3 className="text-3xl font-bold mt-1">{data?.inProgressTasks || 0}</h3>
          </div>
        </div>

        <div className="card flex items-center gap-4 relative">
          <div className="p-4 rounded-xl bg-danger/10 text-danger"><AlertTriangle size={24} /></div>
          <div>
            <p className="text-textMuted text-sm font-medium">Overdue</p>
            <h3 className="text-3xl font-bold mt-1">{overdue}</h3>
          </div>
          {overdue > 0 && (
            <span className="absolute top-4 right-4 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h2 className="text-xl font-bold mb-6">Task Status Distribution</h2>
          {!hasTasks ? (
            <EmptyState icon={PieChartIcon} title="No tasks yet" subtitle="Create your first task to see distribution" />
          ) : (
            <>
              <div className="flex h-3 w-full rounded-full overflow-hidden mb-6 gap-0.5">
                {pieData.map(d => d.value > 0 && (
                  <div key={d.name} style={{ width: `${(d.value/total)*100}%`, background: d.color }} />
                ))}
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e1b4b', border: 'none', borderRadius: 8 }} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>

        <div className="card overflow-hidden flex flex-col">
          <h2 className="text-xl font-bold mb-6">Upcoming Deadlines</h2>
          <div className="space-y-4 overflow-y-auto flex-1">
            {data?.upcomingTasks?.length === 0 ? (
              <p className="text-textMuted text-center py-4">No upcoming deadlines.</p>
            ) : (
              data?.upcomingTasks?.map(task => (
                <div key={task.id} onClick={() => setSelectedTask(task)} className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-white/5 cursor-pointer transition-colors">
                  <Avatar user={task.assignee} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{task.title}</p>
                    <p className={`text-xs ${isAfter(new Date(), new Date(task.dueDate)) ? 'text-danger' : 'text-warning'}`}>
                      Due: {format(new Date(task.dueDate), 'MMM d')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-primary" size={24} />
            <h2 className="text-xl font-bold">Recent Activity</h2>
          </div>
          <div className="space-y-1">
            {activity?.length === 0 ? (
              <p className="text-center text-textMuted py-8">No recent activity yet</p>
            ) : (
              activity?.slice(0, 10).map((act, i) => (
                <div key={i} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
                  <Avatar user={act.user} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-300">
                      <span className="text-white font-medium mr-1">{act.user?.name}</span>
                      {act.action}
                      <span className="text-violet-400 ml-1">{act.taskTitle}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatDistanceToNow(new Date(act.createdAt))} ago</p>
                  </div>
                  <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    act.type === 'CREATE' ? 'bg-emerald-500/20 text-emerald-400' :
                    act.type === 'UPDATE' ? 'bg-cyan-500/20 text-cyan-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {act.type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">My Tasks</h2>
            <Link to="/my-tasks" className="text-sm text-primary hover:text-primary/80">View All &rarr;</Link>
          </div>
          <div className="overflow-x-auto">
            {myTasks?.length === 0 ? (
              <p className="text-center text-textMuted py-8">No tasks assigned to you yet</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-slate-500 text-xs uppercase border-b border-white/5">
                    <th className="pb-3 font-medium">Task</th>
                    <th className="pb-3 font-medium">Project</th>
                    <th className="pb-3 font-medium">Priority</th>
                    <th className="pb-3 font-medium">Due Date</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myTasks?.slice(0, 5).map(task => {
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
                    return (
                      <tr key={task.id} onClick={() => setSelectedTask(task)} className="border-b border-white/5 last:border-0 hover:bg-white/5 cursor-pointer transition-colors">
                        <td className="py-3 font-medium text-slate-200">{task.title}</td>
                        <td className="py-3">
                          <span className="flex items-center gap-1.5 whitespace-nowrap">
                            <div className="w-2 h-2 rounded-full" style={{background: task.project.color}} />
                            {task.project.name}
                          </span>
                        </td>
                        <td className="py-3"><PriorityBadge priority={task.priority} /></td>
                        <td className={`py-3 whitespace-nowrap ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
                          {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : '—'}
                        </td>
                        <td className="py-3"><StatusChip status={task.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <TaskPanel task={selectedTask} isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} />
    </div>
  );
}
