import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { LayoutDashboard, ClipboardList, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  navigate: (page: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, navigate, mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      visible: true
    },
    {
      id: 'history',
      label: 'Work History',
      icon: <ClipboardList size={20} />,
      visible: user?.role === Role.EMPLOYEE
    },
    {
      id: 'admin',
      label: 'Admin Panel',
      icon: <ShieldCheck size={20} />,
      visible: user?.role === Role.ADMIN
    }
  ];

  const handleNav = (id: string) => {
    navigate(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center font-bold text-slate-900">
              L
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">LION SMART</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Enterprise Management</p>
        </div>

        <div className="flex-1 py-6 px-3 space-y-1">
          {menuItems.filter(item => item.visible).map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activePage === item.id 
                  ? 'bg-accent-500 text-slate-900 font-medium' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-900">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
              <UserIcon size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.department || 'General'}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 p-2 text-sm text-red-300 hover:bg-red-900/30 hover:text-red-200 rounded-md transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};