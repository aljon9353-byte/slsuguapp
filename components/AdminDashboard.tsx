import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ServiceRequest, RequestStatus } from '../types';
import { Star, TrendingUp, Clock, CheckCircle, AlertCircle, Activity, Zap } from 'lucide-react';

interface AdminDashboardProps {
  requests: ServiceRequest[];
}

// Fresher, brighter colors for the 'maaliwalas' look
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const CHART_BAR_GRADIENT_START = '#0ea5e9'; // Sky 500
const CHART_BAR_GRADIENT_END = '#3b82f6';   // Blue 500

const AdminDashboard: React.FC<AdminDashboardProps> = ({ requests }) => {
  
  // Stats Calculation
  const total = requests.length;
  const pending = requests.filter(r => r.status === RequestStatus.PENDING).length;
  const inProgress = requests.filter(r => r.status === RequestStatus.IN_PROGRESS).length;
  const completed = requests.filter(r => r.status === RequestStatus.COMPLETED).length;

  // Rating Stats
  const ratedRequests = requests.filter(r => r.rating && r.rating > 0);
  const avgRating = ratedRequests.length > 0 
    ? (ratedRequests.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedRequests.length).toFixed(1)
    : '0.0';

  // Data for Charts
  const statusData = [
    { name: 'Pending', value: pending },
    { name: 'In Progress', value: inProgress },
    { name: 'Completed', value: completed },
  ];

  const categoryCount = requests.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.keys(categoryCount).map(key => ({
    name: key,
    value: categoryCount[key]
  }));

  const StatCard = ({ title, value, colorClass, iconClass, subtext, icon: Icon }: { title: string, value: string | number, colorClass: string, iconClass: string, subtext: string, icon: any }) => (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-lg hover:shadow-sky-100 transition-all duration-300 hover:-translate-y-1">
      {/* Soft decorative background glow */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 transition-transform group-hover:scale-110 ${colorClass}`}></div>
      
      <div className="flex justify-between items-start z-10 mb-5">
        <div className={`p-3.5 rounded-2xl ${iconClass} shadow-sm group-hover:rotate-6 transition-transform`}>
           <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>
      <div className="z-10 mt-auto">
        <div className="text-3xl font-extrabold text-slate-800 mb-1 tracking-tight">{value}</div>
        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wide opacity-80">{title}</h3>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center">
         <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></div>
         <p className="text-xs text-slate-400 font-medium">{subtext}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-sm">
         <div className="flex items-center space-x-4">
           <div className="p-3 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl text-white shadow-md shadow-sky-200">
              <Zap size={24} fill="currentColor" className="text-sky-100" />
           </div>
           <div>
             <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Dashboard Overview</h1>
             <p className="text-slate-500 font-medium">Welcome to your daily operational insights.</p>
           </div>
         </div>
         <div className="mt-4 md:mt-0 text-right">
            <div className="inline-flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
               <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
               <span className="text-slate-600 font-bold text-sm">System Active</span>
            </div>
         </div>
      </div>

      {/* Stats Grid - Fresher Colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
           title="Total Requests" 
           value={total} 
           colorClass="bg-blue-400" 
           iconClass="bg-blue-50 text-blue-600" 
           subtext="All time volume" 
           icon={Activity} 
        />
        <StatCard 
           title="Pending" 
           value={pending} 
           colorClass="bg-amber-400" 
           iconClass="bg-amber-50 text-amber-600" 
           subtext="Awaiting action" 
           icon={AlertCircle} 
        />
        <StatCard 
           title="In Progress" 
           value={inProgress} 
           colorClass="bg-sky-400" 
           iconClass="bg-sky-50 text-sky-600" 
           subtext="Currently active" 
           icon={Clock} 
        />
        <StatCard 
           title="Completed" 
           value={completed} 
           colorClass="bg-emerald-400" 
           iconClass="bg-emerald-50 text-emerald-600" 
           subtext="Successfully resolved" 
           icon={CheckCircle} 
        />
        <StatCard 
           title="Avg Rating" 
           value={avgRating} 
           colorClass="bg-violet-400" 
           iconClass="bg-violet-50 text-violet-600" 
           subtext={`${ratedRequests.length} user reviews`} 
           icon={Star} 
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/60 shadow-sm h-[420px] flex flex-col hover:shadow-lg hover:shadow-sky-100/50 transition-shadow">
          <div className="flex items-center justify-between mb-8">
            <div>
               <h3 className="text-lg font-bold text-slate-800">Requests by Category</h3>
               <p className="text-xs text-slate-400 font-medium mt-1">Distribution of issue types</p>
            </div>
            <div className="p-2 bg-sky-50 rounded-xl text-sky-600"><TrendingUp size={20}/></div>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', 
                    padding: '16px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    fontFamily: 'sans-serif'
                  }} 
                />
                <Bar dataKey="value" fill="url(#colorGradient)" radius={[0, 8, 8, 0]} barSize={28} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor={CHART_BAR_GRADIENT_START} stopOpacity={0.9}/>
                    <stop offset="95%" stopColor={CHART_BAR_GRADIENT_END} stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/60 shadow-sm h-[420px] flex flex-col hover:shadow-lg hover:shadow-sky-100/50 transition-shadow">
          <div className="flex items-center justify-between mb-8">
            <div>
               <h3 className="text-lg font-bold text-slate-800">Completion Status</h3>
               <p className="text-xs text-slate-400 font-medium mt-1">Overall progress tracking</p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><Activity size={20}/></div>
          </div>
          <div className="flex-1 w-full min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={85}
                  outerRadius={110}
                  paddingAngle={6}
                  dataKey="value"
                  cornerRadius={8}
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.98)'
                    }} 
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
               <span className="text-4xl font-black text-slate-800">{total}</span>
               <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Total</span>
            </div>
          </div>
          <div className="flex justify-center mt-6 gap-6 flex-wrap">
             {statusData.map((entry, index) => (
               <div key={entry.name} className="flex items-center text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                  <span className="w-2.5 h-2.5 rounded-full mr-2 shadow-sm" style={{backgroundColor: COLORS[index % COLORS.length]}}></span>
                  {entry.name}
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Recent Feedback Section */}
      {ratedRequests.length > 0 && (
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/60 shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-lg font-bold text-slate-800">Recent User Feedback</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Comments from completed requests</p>
             </div>
             <button className="text-sky-600 text-sm font-bold hover:text-sky-700 hover:underline">View All</button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             {ratedRequests.slice(0, 3).map(req => (
               <div key={req.id} className="p-6 bg-gradient-to-br from-white to-sky-50/50 rounded-2xl border border-slate-100/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-amber-400/5 rounded-bl-[40px] -mr-0 -mt-0 transition-transform group-hover:scale-110"></div>
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex space-x-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < (req.rating || 0) ? "#fbbf24" : "#f1f5f9"} stroke={i < (req.rating || 0) ? "#fbbf24" : "#cbd5e1"} />
                        ))}
                     </div>
                     <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-100 shadow-sm">
                       {new Date(req.updatedAt).toLocaleDateString()}
                     </span>
                  </div>
                  <p className="text-sm text-slate-600 font-medium italic mb-6 leading-relaxed relative z-10">"{req.feedback || "No comment provided."}"</p>
                  <div className="flex items-center mt-auto pt-4 border-t border-slate-100/80">
                     <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs mr-3 ring-2 ring-white">
                        {req.userName.charAt(0)}
                     </div>
                     <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-800 truncate">{req.userName}</p>
                        <p className="text-[10px] text-sky-500 truncate font-semibold">Re: {req.title}</p>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;