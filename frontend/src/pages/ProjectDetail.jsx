import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Layout, List, Users, Settings as SettingsIcon, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import StatusChip from '../components/StatusChip';
import PriorityBadge from '../components/PriorityBadge';
import Avatar from '../components/Avatar';
import CreateTaskModal from '../components/CreateTaskModal';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('board');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [modalInitialStatus, setModalInitialStatus] = useState('TODO');

  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await api.get(`/projects/${id}`);
      return res.data;
    }
  });

  const { data: tasks, isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const res = await api.get(`/tasks/project/${id}`);
      return res.data;
    }
  });

  const deleteProject = useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/projects/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted successfully');
      navigate('/projects');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to delete project. Admins only.');
    }
  });

  if (isProjectLoading || isTasksLoading) return <div className="p-8"><div className="skeleton h-64 w-full"></div></div>;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-surface" style={{ color: project?.color || '#7c3aed' }}>
            <Layout size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{project?.name}</h1>
            <p className="text-textMuted">{project?.description}</p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-borderGlass mb-6 overflow-x-auto shrink-0 hide-scrollbar">
        {[
          { id: 'board', label: 'Board', icon: Layout },
          { id: 'list', label: 'List', icon: List },
          { id: 'members', label: 'Members', icon: Users },
          { id: 'settings', label: 'Settings', icon: SettingsIcon },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors whitespace-nowrap",
              activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-textMuted hover:text-textPrimary"
            )}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden min-h-0">
        {activeTab === 'board' && (
          <KanbanBoard 
            tasks={tasks} 
            projectId={id} 
            onAddTask={(status) => {
              setModalInitialStatus(status);
              setIsTaskModalOpen(true);
            }} 
          />
        )}
        {activeTab === 'list' && (
          <div className="glass-card p-0 h-full overflow-auto">
            {tasks?.length === 0 ? (
              <div className="text-center text-textMuted py-12">No tasks in this project yet.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-surface/50 sticky top-0">
                  <tr className="text-textMuted border-b border-borderGlass">
                    <th className="py-4 px-6 font-medium">Title</th>
                    <th className="py-4 px-6 font-medium">Status</th>
                    <th className="py-4 px-6 font-medium">Priority</th>
                    <th className="py-4 px-6 font-medium">Assignee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderGlass">
                  {tasks?.map(task => (
                    <tr key={task.id} className="hover:bg-surface/30 transition-colors">
                      <td className="py-4 px-6 font-medium text-textPrimary">{task.title}</td>
                      <td className="py-4 px-6"><StatusChip status={task.status} /></td>
                      <td className="py-4 px-6"><PriorityBadge priority={task.priority} /></td>
                      <td className="py-4 px-6 flex items-center gap-2">
                        {task.assignee ? (
                          <>
                            <Avatar user={task.assignee} size="sm" />
                            <span>{task.assignee.name}</span>
                          </>
                        ) : (
                          <span className="text-textMuted italic">Unassigned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {activeTab === 'members' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 overflow-y-auto h-full">
            {project?.members?.map(m => (
              <div key={m.userId} className="glass-card p-4 flex items-center gap-4">
                <Avatar user={m.user} size="lg" />
                <div>
                  <p className="font-medium text-lg">{m.user?.name}</p>
                  <p className="text-xs text-primary font-bold uppercase tracking-wider">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="glass-card p-8 max-w-2xl mx-auto mt-4 overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">Project Settings</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Project Name</label>
                <input type="text" className="w-full bg-surface border border-borderGlass rounded-xl px-4 py-3 text-textPrimary focus:outline-none opacity-70 cursor-not-allowed" defaultValue={project?.name} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Description</label>
                <textarea className="w-full bg-surface border border-borderGlass rounded-xl px-4 py-3 text-textPrimary focus:outline-none min-h-[120px] opacity-70 cursor-not-allowed" defaultValue={project?.description} disabled />
              </div>
              <div className="pt-4 flex justify-end">
                <button className="bg-primary/50 text-white font-medium px-6 py-2.5 rounded-xl cursor-not-allowed opacity-50 transition-opacity hover:opacity-50">Save Changes</button>
              </div>
            </div>
            <div className="mt-10 pt-8 border-t border-danger/20">
              <h3 className="text-xl font-bold mb-2 text-danger">Danger Zone</h3>
              <p className="text-textMuted mb-6 text-sm">Deleting a project is irreversible and will delete all tasks and comments inside it.</p>
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this project? This cannot be undone.')) {
                    deleteProject.mutate();
                  }
                }}
                disabled={deleteProject.isPending}
                className="bg-danger/10 border border-danger/50 text-danger hover:bg-danger hover:text-white px-6 py-2.5 rounded-xl transition-colors font-medium disabled:opacity-50"
              >
                {deleteProject.isPending ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateTaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        projectId={id}
        initialStatus={modalInitialStatus}
      />
    </div>
  );
}

function KanbanBoard({ tasks, projectId, onAddTask }) {
  const columns = [
    { id: 'TODO', title: 'To Do', color: '#94a3b8' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: '#06b6d4' },
    { id: 'IN_REVIEW', title: 'In Review', color: '#f59e0b' },
    { id: 'DONE', title: 'Done', color: '#10b981' }
  ];

  return (
    <div className="flex gap-6 h-full overflow-x-auto pb-4 items-start px-2">
      {columns.map(col => {
        const colTasks = tasks?.filter(t => t.status === col.id) || [];
        return (
          <div key={col.id} className="min-w-[300px] w-[300px] glass-card flex flex-col max-h-full">
            <div className="p-4 border-b border-borderGlass flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: col.color }} />
                <h3 className="font-bold">{col.title}</h3>
                <span className="text-xs bg-surface px-2 py-0.5 rounded-full text-textMuted">{colTasks.length}</span>
              </div>
              <button 
                onClick={() => onAddTask(col.id)}
                className="p-1.5 hover:bg-white/5 rounded-lg text-textMuted hover:text-primary transition-colors"
                title="Add task"
              >
                <Plus size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {colTasks.map(task => (
                <div key={task.id} className="bg-surface border border-borderGlass rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className={clsx(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1",
                      task.priority === 'HIGH' || task.priority === 'CRITICAL' ? 'bg-danger/20 text-danger' :
                      task.priority === 'MEDIUM' ? 'bg-warning/20 text-warning' : 'bg-surface text-textMuted'
                    )}>
                      {task.priority}
                    </span>
                  </div>
                  <h4 className="font-medium mb-3">{task.title}</h4>
                  <div className="flex justify-between items-center mt-auto">
                    {task.assignee ? (
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary" title={task.assignee.name}>
                        {task.assignee.name.charAt(0)}
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-surface border border-borderGlass border-dashed flex items-center justify-center text-[10px] text-textMuted">
                        ?
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {colTasks.length === 0 && (
                <div className="p-4 text-center text-sm text-textMuted border border-dashed border-borderGlass rounded-xl bg-surface/30">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
