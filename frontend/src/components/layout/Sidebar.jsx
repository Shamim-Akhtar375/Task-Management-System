import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Folder, Users, Settings, LogOut, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { useState } from 'react';
import { clsx } from 'clsx';

export default function Sidebar({ isOpen, setIsOpen }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/users/me');
      return data;
    }
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects');
      return data;
    }
  });

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/my-tasks', icon: CheckSquare, label: 'My Tasks' },
    { to: '/projects', icon: Folder, label: 'Projects' },
    { to: '/team', icon: Users, label: 'Team' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />
      )}
      
      <div className={clsx(
        "fixed md:static inset-y-0 left-0 z-50 flex flex-col bg-surface border-r border-borderGlass backdrop-blur-2xl transition-all duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        collapsed ? "w-20" : "w-64"
      )}>
        <div className="flex items-center justify-between p-4 h-16 border-b border-borderGlass shrink-0">
          {!collapsed && <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">TaskFlow</span>}
          {collapsed && <span className="font-bold text-2xl text-primary mx-auto">TF</span>}
          
          <button className="md:hidden p-1 text-textMuted hover:text-textPrimary" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                isActive ? "nav-active text-white" : "text-textMuted hover:text-textPrimary hover:bg-surface"
              )}
            >
              <item.icon size={20} className="group-hover:scale-110 transition-transform shrink-0" />
              {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            </NavLink>
          ))}

          {!collapsed && (
            <div className="mt-8 mb-2 px-4 text-xs font-semibold text-textMuted uppercase tracking-wider">
              Active Projects
            </div>
          )}
          
          {projects?.slice(0, 5).map(project => (
            <NavLink
              key={project.id}
              to={`/projects/${project.id}`}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-3 py-2 rounded-xl transition-all",
                isActive ? "bg-surface text-textPrimary" : "text-textMuted hover:text-textPrimary hover:bg-surface"
              )}
            >
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: project.color || '#7c3aed' }} />
              {!collapsed && <span className="truncate flex-1">{project.name}</span>}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-borderGlass shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              {!collapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium text-textPrimary truncate">{user?.name}</span>
                  <span className="text-xs text-textMuted truncate">{user?.email}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 py-2 text-danger hover:bg-danger/10 rounded-xl transition-colors" title="Logout">
              <LogOut size={18} />
              {!collapsed && <span>Logout</span>}
            </button>
            <button onClick={() => setCollapsed(!collapsed)} className="hidden md:flex p-2 bg-surface hover:bg-borderGlass rounded-xl text-textMuted transition-colors items-center justify-center">
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
