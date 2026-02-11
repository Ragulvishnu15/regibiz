import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Briefcase, 
  FileText, 
  Calendar, 
  MessageSquare, 
  ShieldCheck, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { UserRole } from '../types';
import { canViewAdminPanel } from '../utils/helpers';

interface SidebarProps {
  userRole: UserRole;
  onLogout: () => void;
  isOpen: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole, onLogout, isOpen, onClose }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Overview', path: '/', icon: <Home size={18} /> },
    { label: 'Services', path: '/services', icon: <Briefcase size={18} /> },
    { label: 'Documents', path: '/documents', icon: <FileText size={18} /> },
    { label: 'Schedule', path: '/calendar', icon: <Calendar size={18} /> },
    { label: 'Consultation', path: '/consult', icon: <MessageSquare size={18} /> },
  ];

  if (canViewAdminPanel(userRole)) {
    navItems.push({ label: 'Admin Panel', path: '/admin', icon: <ShieldCheck size={18} /> });
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-30 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`fixed top-0 left-0 h-full w-64 glass-panel border-r border-white/5 flex flex-col z-40 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-peacock-600 flex items-center justify-center text-white font-bold mr-3 shadow-lg shadow-emerald-500/20">
            R
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            RegiBIZ
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Menu</p>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose} // Close on mobile when clicked
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive(item.path)
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
              }`}
            >
              <span className={isActive(item.path) ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {isActive(item.path) && <ChevronRight size={14} className="ml-auto opacity-50" />}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
