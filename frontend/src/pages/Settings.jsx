import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: async () => (await api.get('/users/me')).data });

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio || ''); 
    }
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: async (data) => await api.put('/users/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['me']);
      toast.success('Profile updated successfully');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update profile')
  });

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const updatePassword = useMutation({
    mutationFn: async (data) => await api.put('/users/me/password', { currentPassword: data.current, newPassword: data.new }),
    onSuccess: () => {
      setPasswords({ current: '', new: '', confirm: '' });
      toast.success('Password updated successfully');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update password')
  });

  const handleProfileSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required');
    updateProfile.mutate({ name, bio });
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return toast.error('Passwords do not match');
    if (passwords.new.length < 6) return toast.error('Password must be at least 6 characters');
    updatePassword.mutate(passwords);
  };

  const tabs = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'security', label: '🔒 Security' },
    { id: 'notifications', label: '🔔 Notifications' },
    { id: 'appearance', label: '🎨 Appearance' },
  ];

  return (
    <div className="page flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-64 shrink-0 space-y-1">
        <h2 className="text-xl font-bold mb-6 px-4">Settings</h2>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full text-left px-4 py-2.5 rounded-xl transition-colors ${
              activeTab === tab.id ? 'bg-primary/20 text-primary font-medium' : 'text-textMuted hover:bg-surface hover:text-textPrimary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 max-w-2xl">
        {activeTab === 'profile' && (
          <div className="card">
            <h3 className="text-xl font-bold mb-6">Profile Settings</h3>
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-borderGlass">
              <Avatar user={user} size="xl" />
              <button className="btn-outline text-sm">Upload Photo</button>
            </div>
            
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input type="email" className="input-field opacity-50 cursor-not-allowed" value={user?.email || ''} disabled />
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea 
                  className="input-field min-h-[100px] resize-y" 
                  value={bio} 
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="pt-4">
                <button type="submit" className="btn-primary" disabled={updateProfile.isLoading}>
                  {updateProfile.isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-xl font-bold mb-6">Change Password</h3>
              <form onSubmit={handlePasswordSave} className="space-y-4">
                <div>
                  <label className="label">Current Password</label>
                  <input type="password" className="input-field" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} required />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input type="password" className="input-field" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} required minLength={6} />
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input type="password" className="input-field" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} required minLength={6} />
                </div>
                <div className="pt-4">
                  <button type="submit" className="btn-primary" disabled={updatePassword.isLoading}>
                    Update Password
                  </button>
                </div>
              </form>
            </div>

            <div className="card border-danger/30 bg-danger/5">
              <h3 className="text-xl font-bold mb-2 text-danger">Danger Zone</h3>
              <p className="text-textMuted mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <button className="btn-outline border-danger text-danger hover:bg-danger hover:text-white" onClick={() => toast.error('Account deletion not implemented in this demo')}>
                Delete Account
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Notifications</h3>
              <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Coming Soon</span>
            </div>
            <div className="space-y-4 opacity-50 pointer-events-none">
              {['Email notifications for task assignment', 'Email notifications for comments', 'Due date reminders', 'Weekly digest'].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-surface rounded-xl">
                  <span className="font-medium">{item}</span>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${i < 3 ? 'bg-primary' : 'bg-slate-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${i < 3 ? 'translate-x-6' : ''}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="card">
            <h3 className="text-xl font-bold mb-6">Appearance</h3>
            
            <div className="mb-8">
              <label className="label mb-3">Theme</label>
              <div className="flex gap-4">
                {['Dark', 'Light', 'System'].map((theme, i) => (
                  <div key={theme} className={`px-4 py-3 rounded-xl border ${i === 0 ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-borderGlass text-textMuted opacity-50'}`}>
                    {theme} {i !== 0 && <span className="text-[10px] uppercase ml-1">(Soon)</span>}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="label mb-3">Accent Color</label>
              <div className="flex gap-4">
                {['#7c3aed', '#06b6d4', '#10b981', '#e11d48', '#d97706', '#4f46e5'].map(color => (
                  <button 
                    key={color} 
                    className="w-10 h-10 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-white"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      document.documentElement.style.setProperty('--color-primary', color);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
