import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Header: React.FC = () => {
  const { logout } = useAuth();

  return (
    <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-4 sm:px-8 py-4 sm:py-6 shadow-lg shadow-slate-200/20 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-transparent to-indigo-50/50"></div>
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 w-full">
          <div className="mb-2 sm:mb-0">
            <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">Welcome back to your laboratory dashboard</p>
          </div>
          
          <div className="relative group mt-3 sm:mt-0 flex-1 max-w-full sm:max-w-[400px]">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
            <Input
              placeholder="Search patients, orders, reports..."
              className="pl-12 w-full h-10 sm:h-12 bg-slate-50/70 border-slate-200/60 focus:bg-white focus:border-blue-300 transition-all duration-300 rounded-2xl shadow-sm hover:shadow-md focus:shadow-lg text-sm sm:text-base"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
          <Button variant="ghost" size="sm" className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-2xl hover:bg-blue-50 transition-all duration-200 group">
            <Bell className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            </span>
          </Button>
          
          <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={logout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200 h-10 sm:h-12 px-4 sm:px-6 rounded-2xl font-semibold shadow-sm hover:shadow-md text-xs sm:text-base"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
