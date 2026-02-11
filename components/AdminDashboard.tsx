import React from 'react';
import * as Recharts from 'recharts';
import { ServiceRequest, RequestStatus } from '../types';
import { Star, TrendingUp, Clock, CheckCircle, AlertCircle, Activity, Zap } from 'lucide-react';

const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } = Recharts as any;

interface AdminDashboardProps {
  requests: ServiceRequest[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const CHART_BAR_GRADIENT_END = '#3b82f6';   

const AdminDashboard: React.FC<AdminDashboardProps> = ({ requests = [] }) => {
  
  const activeRequests = Array.isArray(requests) ? requests.filter(r => r && !r.isArchived) : [];

  const total = activeRequests.length;
  const pending = activeRequests.filter(r => r.status === RequestStatus.PENDING).length;
  const inProgress = activeRequests.filter(r => r.status === RequestStatus.IN_PROGRESS).length;
  const completed = activeRequests.filter(r => r.status === RequestStatus.COMPLETED).length;

  const ratedRequests = activeRequests.filter(r => r && r.rating && r.rating > 0);
  const avgRatingValue = ratedRequests.length > 0 
    ? (ratedRequests.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedRequests.length)
    : 0;
  const avgRating = avgRatingValue.toFixed(1);

  const statusData = [
    { name: 'Pending', value: pending },
    { name: 'In Progress', value: inProgress },
    { name: 'Completed', value: completed },
  ];

  const categoryCount = activeRequests.reduce((acc, curr) => {
    if (curr && curr.category) {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.keys(categoryCount).map(key => ({
    name: key,
    value: categoryCount[key]
  }));

  const StatCard = ({ title, value, colorClass, iconClass, subtext, icon: Icon }: { title: string, value: string | number, colorClass: string, iconClass: string, subtext: string, icon: any }) => (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-lg hover:shadow-sky-100 transition-all duration-300 hover:-translate-y-1">
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

  const hasCharts = !!BarChart && !!PieChart;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-sm">
         <div className="flex items-center space-x-4">
           <div className="p-3 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl text-white shadow-md shadow-sky-200">
              <Zap size={24} fill="currentColor" className="text-sky-100" />
           </div>
           <div>
             <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Dashboard Overview</h1>
             <p className="text-slate-500 font-medium">Welcome to operational insights for 2025.</p>
           </div>
         </div>
         <div className="mt-4 md:mt-0 text-right">
            <div className="inline-flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
               <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
               <span className="text-slate-600 font-bold text-sm">System Active</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Requests" value={total} colorClass="bg-blue-400" iconClass="bg-blue-50 text-blue-600" subtext="All time volume" icon={Activity} />
        <StatCard title="Pending" value={pending} colorClass="bg-amber-400" iconClass="bg-amber-50 text-amber-600" subtext="Awaiting action" icon={AlertCircle} />
        <StatCard title="In Progress" value={inProgress} colorClass="bg-sky-400" iconClass="bg-sky-50 text-sky-600" subtext="Currently active" icon={Clock} />
        <StatCard title="Completed" value={completed} colorClass="bg-emerald-400" iconClass="bg-emerald-50 text-emerald-600" subtext="Successfully resolved" icon={CheckCircle} />
        <StatCard title="Avg Rating" value={avgRating} colorClass="bg-violet-400" iconClass="bg-violet-50 text-violet-600" subtext={`${ratedRequests.length} reviews`} icon={Star} />
      </div>

      {hasCharts ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/60 shadow-sm h-[420px] flex flex-col hover:shadow-lg transition-shadow">
            <div className="mb-8"><h3 className="text-lg font-bold text-slate-800">Requests by Category</h3></div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} axisLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="value" fill={CHART_BAR_GRADIENT_END} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/60 shadow-sm h-[420px] flex flex-col hover:shadow-lg transition-shadow">
            <div className="mb-8"><h3 className="text-lg font-bold text-slate-800">Completion Status</h3></div>
            <div className="flex-1 w-full min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} innerRadius={85} outerRadius={110} paddingAngle={6} dataKey="value" cornerRadius={8} stroke="none">
                    {statusData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                 <div className="text-center">
                    <span className="block text-4xl font-black text-slate-800">{total}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reports</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
           Analytics modules loading...
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;