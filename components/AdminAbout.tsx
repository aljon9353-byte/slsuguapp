
import React from 'react';
import { Shield, Code, Heart, Smartphone, Globe, GraduationCap } from 'lucide-react';

const AdminAbout: React.FC = () => {
  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn pb-20">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-sm flex flex-col items-center text-center relative overflow-hidden group hover:shadow-sky-100 transition-all duration-500">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500"></div>
        
        {/* Decorative background blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-sky-200/30 rounded-full blur-3xl group-hover:bg-sky-300/30 transition-colors"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl group-hover:bg-indigo-300/30 transition-colors"></div>

        <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-sky-200 mb-6 transform rotate-3 group-hover:rotate-6 transition-transform duration-500">
          <span className="text-white font-black text-4xl tracking-tighter">SL</span>
        </div>
        
        <h1 className="relative z-10 text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-3">SLSU Gu App</h1>
        <p className="relative z-10 text-slate-500 font-medium max-w-lg mx-auto text-lg leading-relaxed">
           The official Facility Management & Service Request System tailored for the Southern Luzon State University community.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* About the App - Main Feature */}
        <div className="md:col-span-2 bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/60 shadow-sm transition-all hover:shadow-md">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600 mr-3 shadow-sm">
                <Smartphone size={20} />
              </div>
              About SLSU Gu App
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium text-base">
              The SLSU Gu App is a dedicated platform designed to modernize the General Services Office (GSO) operations at Southern Luzon State University. It streamlines the process of reporting facility maintenance issues, sanitation requests, and academic document processing. By providing a centralized, digital interface, the app enhances communication between the administration and the student body, ensuring a more efficient and responsive campus environment.
            </p>
        </div>

        {/* Publisher Info */}
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/60 shadow-sm flex flex-col items-center text-center hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
           <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4 shadow-inner">
              <Code size={24} />
           </div>
           <h2 className="text-lg font-bold text-slate-800">Published By</h2>
           <p className="text-xs text-slate-400 font-medium mt-1 mb-6">Developer & Maintainer</p>
           
           <div className="p-6 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 w-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-200/20 rounded-full -mr-10 -mt-10 blur-xl"></div>
              <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 relative z-10">Aljon V. Carandang</p>
              
              <div className="flex flex-col items-center mt-3 space-y-1 relative z-10">
                 <div className="flex items-center space-x-2 text-indigo-800 font-bold text-sm bg-indigo-100/50 px-3 py-1 rounded-full border border-indigo-100">
                    <GraduationCap size={14} />
                    <span>BIT-CPT</span>
                 </div>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Major in Computer Tech</span>
              </div>
           </div>
        </div>

        {/* System Info */}
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/60 shadow-sm flex flex-col items-center text-center hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
           <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-4 shadow-inner">
              <Shield size={24} />
           </div>
           <h2 className="text-lg font-bold text-slate-800">System Information</h2>
           <p className="text-xs text-slate-400 font-medium mt-1 mb-6">Current Build Status</p>
           
           <div className="space-y-3 w-full text-left px-2">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 text-sm font-bold flex items-center"><Smartphone size={14} className="mr-2"/> Version</span>
                <span className="text-slate-800 font-bold bg-white px-2 py-0.5 rounded shadow-sm text-xs">v1.2.0 (Stable)</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                 <span className="text-slate-500 text-sm font-bold flex items-center"><Globe size={14} className="mr-2"/> Channel</span>
                 <span className="text-emerald-600 font-bold text-xs flex items-center"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>Active</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                 <span className="text-slate-500 text-sm font-bold flex items-center"><Shield size={14} className="mr-2"/> License</span>
                 <span className="text-slate-700 font-bold text-xs">SLSU Proprietary</span>
              </div>
           </div>
        </div>
      </div>
      
       <div className="text-center text-slate-400 text-xs font-medium pt-8 opacity-70">
          <p className="flex items-center justify-center gap-1.5">
             Designed & Developed with <Heart size={12} className="text-rose-400 fill-rose-400 animate-pulse" /> for the SLSU Community
          </p>
          <p className="mt-1">© 2025 All Rights Reserved</p>
       </div>
    </div>
  );
};

export default AdminAbout;
