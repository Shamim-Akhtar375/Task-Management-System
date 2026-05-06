import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="md:hidden flex items-center justify-between p-4 border-b border-borderGlass bg-surface backdrop-blur-md">
          <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">TaskFlow</span>
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-textMuted hover:text-textPrimary">
            <Menu size={24} />
          </button>
        </div>
        
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
