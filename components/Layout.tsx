
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { LayoutDashboard, PlusCircle, List, User as UserIcon, LogOut, Users, Menu, X, Archive, Info } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, currentView, onNavigate, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAdmin = user?.role === UserRole.ADMIN;

  const NavItem = ({ view, icon: Icon, label, onClick }: { view: string, icon: any, label: string, onClick?: () => void }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => {
          onNavigate(view);
          if (onClick) onClick();
        }}
        className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
          isActive 
            ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-200 scale-[1.02]' 
            : 'text-slate-600 hover:bg-white/60 hover:text-sky-600 hover:shadow-sm'
        }`}
      >
        <div className={`relative z-10 p-1.5 rounded-xl transition-colors ${isActive ? 'bg-white/20' : 'bg-transparent group-hover:bg-sky-50'}`}>
           <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-500'} />
        </div>
        <span className={`font-medium tracking-wide relative z-10 ${isActive ? '' : 'group-hover:translate-x-1 transition-transform'}`}>{label}</span>
        
        {isActive && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse z-10" />
        )}
      </button>
    );
  };

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center space-x-3 px-2 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-200 transform transition-transform hover:rotate-3 hover:scale-105">
              <span className="text-white font-black text-xl tracking-tighter">SL</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight leading-none">SLSU Gu</span>
            <span className="text-[10px] text-sky-500 font-bold tracking-widest uppercase mt-1">App Portal</span>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-4 flex items-center">
          <span className="w-8 h-[1px] bg-slate-200 mr-2"></span>
          Main Menu
        </div>
        
        {isAdmin ? (
          <>
            <NavItem view="admin-dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => mobile && setIsMobileMenuOpen(false)} />
            <NavItem view="admin-requests" icon={List} label="Manage Requests" onClick={() => mobile && setIsMobileMenuOpen(false)} />
            <NavItem view="admin-history" icon={Archive} label="History" onClick={() => mobile && setIsMobileMenuOpen(false)} />
            <NavItem view="admin-users" icon={Users} label="User Directory" onClick={() => mobile && setIsMobileMenuOpen(false)} />
            <NavItem view="admin-about" icon={Info} label="About" onClick={() => mobile && setIsMobileMenuOpen(false)} />
          </>
        ) : (
          <>
            <NavItem view="user-home" icon={List} label="My Activity" onClick={() => mobile && setIsMobileMenuOpen(false)} />
            <NavItem view="user-create" icon={PlusCircle} label="New Request" onClick={() => mobile && setIsMobileMenuOpen(false)} />
            <NavItem view="user-about" icon={Info} label="About" onClick={() => mobile && setIsMobileMenuOpen(false)} />
          </>
        )}

        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-4 mt-8 flex items-center">
            <span className="w-8 h-[1px] bg-slate-200 mr-2"></span>
            System
        </div>

        <button 
          onClick={() => { onLogout(); mobile && setIsMobileMenuOpen(false); }} 
          className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all hover:shadow-sm group"
        >
          <div className="p-1.5 rounded-xl group-hover:bg-red-100 transition-colors">
              <LogOut size={20} className="text-slate-400 group-hover:text-red-500" />
          </div>
          <span className="font-medium group-hover:translate-x-1 transition-transform">Sign Out</span>
        </button>
        </nav>

        {/* User Profile Footer */}
        <div className="mt-auto pt-6 bg-gradient-to-t from-white/50 to-transparent space-y-3">
          <div className="flex items-center space-x-3 p-3 rounded-2xl bg-white/70 border border-white shadow-sm backdrop-blur-md hover:shadow-md transition-all cursor-default group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-100 to-blue-100 flex items-center justify-center text-blue-600 ring-4 ring-white shadow-sm group-hover:scale-105 transition-transform">
                <UserIcon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                  {user?.name || 'User'}
                </p>
                <div className="flex items-center mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
                    <p className="text-xs text-slate-500 truncate font-medium">{user?.role || 'Guest'}</p>
                </div>
              </div>
          </div>
        </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 relative selection:bg-sky-100 selection:text-sky-700 font-sans">
      <div className="fixed inset-0 z-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-100/40 via-slate-50 to-cyan-100/30 pointer-events-none" />
      <aside className="w-72 bg-white/60 backdrop-blur-xl border-r border-white/60 flex flex-col hidden md:flex z-20 shadow-[0_0_40px_-10px_rgba(0,0,0,0.05)] relative p-6">
        <SidebarContent />
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="w-64 h-full bg-white/95 backdrop-blur-xl p-6 shadow-2xl relative animate-slideRight">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
            >
              <X size={24} />
            </button>
            <SidebarContent mobile={true} />
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-slate-200/60 p-4 flex items-center justify-between z-30 sticky top-0 shadow-sm">
           <div className="flex items-center space-x-3">
             <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
               <Menu size={24} />
             </button>
             <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-xs">SL</span>
                </div>
                <span className="font-bold text-slate-800 text-lg">SLSU Gu</span>
             </div>
           </div>
           <button onClick={onLogout} className="text-xs bg-slate-100 px-3 py-1.5 rounded-full text-slate-600 font-medium active:scale-95 transition-transform hover:bg-slate-200">
             Logout
           </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full p-4 md:p-8">
            <div className="animate-fadeIn pb-12">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
