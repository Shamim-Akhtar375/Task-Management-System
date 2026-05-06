import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Folder, Calendar, Trash2 } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import api from '../api/axios';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function Projects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data;
    }
  });

  const createProject = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/projects', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      reset();
      toast.success('Project created successfully');
    }
  });

  const deleteProject = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/projects/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to delete project. Admins only.');
    }
  });

  if (isLoading) return <div className="p-8"><div className="skeleton h-64 w-full"></div></div>;

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-textMuted mt-1">Manage and track your team projects.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span>New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map((project) => {
          const tasks = project.tasks || [];
          const doneTasks = tasks.filter(t => t.status === 'DONE').length;
          const progress = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;
          const daysLeft = project.deadline ? differenceInDays(new Date(project.deadline), new Date()) : null;
          
          return (
            <div key={project.id} className="glass-card overflow-hidden flex flex-col group relative">
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: project.color }} />
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-surface" style={{ color: project.color }}>
                    <Folder size={24} />
                  </div>
                  {project.deadline && (
                    <div className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${
                      daysLeft < 0 ? 'bg-danger/10 border-danger/20 text-danger' : 
                      daysLeft <= 3 ? 'bg-warning/10 border-warning/20 text-warning' : 
                      'bg-surface border-borderGlass text-textMuted'
                    }`}>
                      <Calendar size={12} />
                      {daysLeft < 0 ? 'Overdue' : `${daysLeft} days left`}
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                <p className="text-sm text-textMuted line-clamp-2 mb-4">{project.description || 'No description provided.'}</p>
                
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-textMuted">Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: project.color }} />
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-borderGlass">
                  <div className="flex -space-x-2">
                    {project.members?.slice(0, 3).map(m => (
                      <div key={m.userId} className="w-8 h-8 rounded-full bg-surface border-2 border-[#0f0f1a] flex items-center justify-center text-xs font-medium" title={m.user?.name}>
                        {m.user?.avatar ? <img src={m.user.avatar} className="w-full h-full rounded-full" /> : m.user?.name?.charAt(0) || 'U'}
                      </div>
                    ))}
                    {project.members?.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-surface border-2 border-[#0f0f1a] flex items-center justify-center text-xs font-medium text-textMuted">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this project? All tasks and data will be lost.')) {
                          deleteProject.mutate(project.id);
                        }
                      }}
                      className="p-1.5 hover:bg-danger/10 text-textMuted hover:text-danger rounded-lg transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 size={16} />
                    </button>
                    <Link to={`/projects/${project.id}`} className="text-sm font-medium hover:underline" style={{ color: project.color }}>
                      Open Project
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleSubmit((data) => createProject.mutate(data))} className="space-y-4">
              <div>
                <label className="label">Project Name</label>
                <input {...register('name')} className="input-field" required />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea {...register('description')} className="input-field resize-none h-24" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Color</label>
                  <input type="color" {...register('color')} defaultValue="#7c3aed" className="w-full h-10 rounded cursor-pointer bg-transparent border-0" />
                </div>
                <div>
                  <label className="label">Deadline</label>
                  <input type="date" {...register('deadline')} className="input-field" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={createProject.isPending} className="btn-primary flex-1">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
