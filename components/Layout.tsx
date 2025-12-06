import React from 'react';
import { UserRole, User } from '../types';
import { LayoutDashboard, PlusCircle, List, User as UserIcon, LogOut, Users, Settings, Database } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, currentView, onNavigate, onLogout }) => {
  
  const isAdmin = user.role === UserRole.ADMIN;

  const NavItem = ({ view, icon: Icon, label }: { view: string, icon: any, label: string }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => onNavigate(view)}
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
        
        {/* Active Pulse Dot */}
        {isActive && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse z-10" />
        )}
      </button>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 relative selection:bg-sky-100 selection:text-sky-700 font-sans">
      
      {/* 
          GLOBAL BACKGROUND (Refreshed 'Maaliwalas' Palette)
      */}
      <div className="fixed inset-0 z-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-100/40 via-slate-50 to-cyan-100/30 pointer-events-none" />
      
      {/* Decorative Ambient Blobs */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-cyan-200/20 rounded-full blur-[100px] pointer-events-none opacity-50" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px] pointer-events-none opacity-50" />

      {/* 
          WATERMARK BACKGROUND
          - Increased opacity and removed multiply blend mode for better visibility on all screens
      */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
         <img 
           src="/slsu_gumaca_seal.png" 
           onError={(e) => {
             e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/en/3/36/Southern_Luzon_State_University_seal.svg";
           }}
           alt="SLSU Gumaca Watermark" 
           className="w-[85%] md:w-[50%] max-w-[650px] object-contain opacity-[0.15] grayscale-[0%]"
         />
      </div>

      {/* Sidebar */}
      <aside className="w-72 bg-white/60 backdrop-blur-xl border-r border-white/60 flex flex-col hidden md:flex z-20 shadow-[0_0_40px_-10px_rgba(0,0,0,0.05)] relative">
        <div className="p-6">
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

           <nav className="space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-4 flex items-center">
              <span className="w-8 h-[1px] bg-slate-200 mr-2"></span>
              Main Menu
            </div>
            
            {isAdmin ? (
              <>
                <NavItem view="admin-dashboard" icon={LayoutDashboard} label="Dashboard" />
                <NavItem view="admin-requests" icon={List} label="Manage Requests" />
                <NavItem view="admin-users" icon={Users} label="User Directory" />
              </>
            ) : (
              <>
                <NavItem view="user-home" icon={List} label="My Activity" />
                <NavItem view="user-create" icon={PlusCircle} label="New Request" />
              </>
            )}

            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-4 mt-8 flex items-center">
               <span className="w-8 h-[1px] bg-slate-200 mr-2"></span>
               System
            </div>
            <button onClick={onLogout} className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all hover:shadow-sm group">
              <div className="p-1.5 rounded-xl group-hover:bg-red-100 transition-colors">
                 <LogOut size={20} className="text-slate-400 group-hover:text-red-500" />
              </div>
              <span className="font-medium group-hover:translate-x-1 transition-transform">Sign Out</span>
            </button>
           </nav>
        </div>

        {/* User Profile Footer */}
        <div className="mt-auto p-6 bg-gradient-to-t from-white/50 to-transparent space-y-3">
           {/* Storage Indicator */}
           <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-400 font-medium bg-slate-100/50 py-1.5 rounded-lg border border-slate-200/50">
              <Database size={10} />
              <span>Running in Local Mode</span>
           </div>

           <div className="flex items-center space-x-3 p-3 rounded-2xl bg-white/70 border border-white shadow-sm backdrop-blur-md hover:shadow-md transition-all cursor-default group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-100 to-blue-100 flex items-center justify-center text-blue-600 ring-4 ring-white shadow-sm group-hover:scale-105 transition-transform">
                <UserIcon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                  {user.name}
                </p>
                <div className="flex items-center mt-0.5">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
                   <p className="text-xs text-slate-500 truncate font-medium">{user.role}</p>
                </div>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Mobile Header */}
        <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-slate-200/60 p-4 flex items-center justify-between z-30 sticky top-0 shadow-sm">
           <div className="flex items-center space-x-2">
             <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                 <span className="text-white font-bold text-xs">SL</span>
             </div>
             <span className="font-bold text-slate-800 text-lg">SLSU Gu</span>
           </div>
           <button onClick={onLogout} className="text-xs bg-slate-100 px-3 py-1.5 rounded-full text-slate-600 font-medium active:scale-95 transition-transform hover:bg-slate-200">
             Logout
           </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
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