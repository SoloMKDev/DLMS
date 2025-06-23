import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  TestTube, 
  Settings, 
  UserCheck, 
  ClipboardList,
  BarChart3,
  Stethoscope,
  Menu,
  X
} from 'lucide-react';
import { UserRole } from '@/types';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
  roles: UserRole[];
}

const navigationItems: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: Home,
    roles: ['ADMIN', 'LAB_TECH', 'PATHOLOGIST', 'RECEPTIONIST', 'DOCTOR'],
  },
  {
    path: '/patients',
    label: 'Patients',
    icon: Users,
    roles: ['ADMIN', 'LAB_TECH', 'RECEPTIONIST'],
  },
  {
    path: '/orders',
    label: 'Test Orders',
    icon: ClipboardList,
    roles: ['ADMIN', 'LAB_TECH', 'PATHOLOGIST', 'RECEPTIONIST'],
  },
  {
    path: '/samples',
    label: 'Sample Tracking',
    icon: TestTube,
    roles: ['ADMIN', 'LAB_TECH', 'PATHOLOGIST'],
  },
  {
    path: '/reports',
    label: 'Lab Reports',
    icon: FileText,
    roles: ['ADMIN', 'LAB_TECH', 'PATHOLOGIST', 'DOCTOR'],
  },
  {
    path: '/doctors',
    label: 'Doctors',
    icon: Stethoscope,
    roles: ['ADMIN', 'RECEPTIONIST'],
  },
  {
    path: '/staff',
    label: 'Staff Management',
    icon: UserCheck,
    roles: ['ADMIN'],
  },
  {
    path: '/tests',
    label: 'Tests Management',
    icon: TestTube,
    roles: ['ADMIN'],
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: BarChart3,
    roles: ['ADMIN', 'PATHOLOGIST'],
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings,
    roles: ['ADMIN'],
  },
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const filteredNavItems = navigationItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  // Responsive sidebar: show as drawer on mobile
  return (
    <>
      {/* Hamburger for mobile */}
      <button
        className="fixed top-4 left-4 z-40 bg-white/90 rounded-xl shadow-lg p-2 sm:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="w-6 h-6 text-blue-700" />
      </button>

      {/* Overlay for mobile drawer */}
      <div
        className={`fixed inset-0 bg-black/30 z-30 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} sm:hidden`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-72 sm:w-80 z-40 bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-200/30 border-r border-slate-200/50 flex flex-col relative overflow-hidden
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          sm:static sm:translate-x-0 sm:flex
        `}
      >
        {/* Close button for mobile */}
        <button
          className="absolute top-4 right-4 z-50 sm:hidden bg-white/80 rounded-xl p-2"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="w-6 h-6 text-blue-700" />
        </button>

        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-transparent to-indigo-50/20 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-2xl"></div>
        
        {/* Logo Section */}
        <div className="p-6 sm:p-8 border-b border-slate-200/50 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <TestTube className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                DLMS
              </h1>
              <p className="text-xs text-slate-500 font-semibold tracking-wide">DIAGNOSTIC LAB SYSTEM</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 sm:p-6 relative z-10">
          <ul className="space-y-2 sm:space-y-3">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`group relative flex items-center px-4 py-3 sm:px-5 sm:py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-500/30'
                        : 'text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-slate-900 hover:shadow-lg hover:shadow-slate-200/30'
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl"></div>
                    )}
                    <Icon className={`w-5 h-5 mr-3 sm:mr-4 transition-all duration-300 relative z-10 ${
                      isActive ? 'text-white' : 'group-hover:scale-110 group-hover:text-blue-600'
                    }`} />
                    <span className="font-semibold relative z-10 text-sm sm:text-base">{item.label}</span>
                    {!isActive && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* User Profile */}
        {user && (
          <div className="p-4 sm:p-6 border-t border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-blue-50/30 relative z-10">
            <div className="flex items-center p-3 sm:p-4 rounded-2xl bg-white/60 backdrop-blur-sm shadow-lg shadow-slate-200/20 border border-slate-200/30">
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center text-white text-sm font-bold shadow-xl shadow-blue-500/25 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <span className="relative z-10">{user.firstName[0]}{user.lastName[0]}</span>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-slate-500 capitalize font-semibold tracking-wide">
                  {user.role.replace('_', ' ').toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;