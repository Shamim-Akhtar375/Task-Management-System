import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function CreateTaskModal({ isOpen, onClose, projectId, initialStatus = 'TODO' }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: initialStatus,
    priority: 'MEDIUM',
    dueDate: '',
    assigneeId: ''
  });

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}`);
      return res.data;
    }
  });

  const createTask = useMutation({
    mutationFn: async (data) => {
      const res = await api.post(`/tasks/project/${projectId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', projectId]);
      toast.success('Task created successfully');
      setFormData({ title: '', description: '', status: initialStatus, priority: 'MEDIUM', dueDate: '', assigneeId: '' });
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to create task');
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('Task Title is required');
    
    const submitData = {
      ...formData,
      assigneeId: formData.assigneeId === "" ? null : formData.assigneeId,
      dueDate: formData.dueDate === "" ? null : new Date(formData.dueDate)
    };
    
    createTask.mutate(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-surface border border-borderGlass rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">New Task</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-textMuted hover:text-textPrimary">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2">
          <div>
            <label className="label">Task Title</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea 
              className="input-field min-h-[100px] resize-none" 
              placeholder="Add more details..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select 
                className="input-field"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select 
                className="input-field"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Due Date</label>
              <input 
                type="date" 
                className="input-field" 
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
            <div>
              <label className="label">Assignee</label>
              <select 
                className="input-field"
                value={formData.assigneeId}
                onChange={e => setFormData({...formData, assigneeId: e.target.value})}
              >
                <option value="">Unassigned</option>
                {project?.members?.map(m => (
                  <option key={m.userId} value={m.userId}>{m.user?.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
            <button type="submit" className="btn-primary" disabled={createTask.isLoading}>
              {createTask.isLoading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
