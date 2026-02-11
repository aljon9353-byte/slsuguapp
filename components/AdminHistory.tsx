
import React, { useState } from 'react';
import { ServiceRequest, RequestStatus } from '../types';
import { Search, Archive, Trash2, RotateCcw, AlertTriangle, Calendar, MapPin, User } from 'lucide-react';

interface AdminHistoryProps {
  requests: ServiceRequest[];
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

const AdminHistory: React.FC<AdminHistoryProps> = ({ requests, onRestore, onPermanentDelete }) => {
  const [search, setSearch] = useState('');
  const [itemToDelete, setItemToDelete] = useState<ServiceRequest | null>(null);

  // Filter only archived requests
  const archivedRequests = requests.filter(r => r.isArchived);

  const filteredRequests = archivedRequests.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.userName.toLowerCase().includes(search.toLowerCase()) ||
    r.id.includes(search)
  );

  const handleDeleteClick = (req: ServiceRequest) => {
    setItemToDelete(req);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      onPermanentDelete(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-white shadow-sm">
        <div className="flex items-center space-x-3">
           <div className="p-3 bg-slate-100 rounded-2xl text-slate-500">
             <Archive size={24} />
           </div>
           <div>
             <h2 className="text-xl font-bold text-slate-800 tracking-tight">History Archive</h2>
             <p className="text-slate-500 text-xs font-medium">Deleted requests can be restored or permanently removed.</p>
           </div>
        </div>
        
        <div className="relative w-full md:w-72 group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search archive..." 
            className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 w-full bg-white transition-all font-medium text-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Archived Item</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Original Date</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                     <div>
                        <p className="font-bold text-slate-700 text-sm mb-1">{req.title}</p>
                        <div className="flex items-center text-xs text-slate-500 space-x-3">
                           <span className="flex items-center"><User size={12} className="mr-1"/> {req.userName}</span>
                           <span className="flex items-center"><MapPin size={12} className="mr-1"/> {req.location}</span>
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              req.status === RequestStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                           }`}>
                             {req.status}
                           </span>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-500">
                     <div className="flex items-center">
                        <Calendar size={14} className="mr-2 text-slate-400"/>
                        {new Date(req.createdAt).toLocaleDateString()}
                     </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                     <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => onRestore(req.id)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center"
                        >
                           <RotateCcw size={14} className="mr-1.5"/> Restore
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(req)}
                          className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors flex items-center"
                        >
                           <Trash2 size={14} className="mr-1.5"/> Delete Forever
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                   <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center">
                         <Archive size={32} className="text-slate-300 mb-2" />
                         <p>No archived requests found.</p>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center border border-white/60">
             <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-rose-600" size={28} />
             </div>
             <h3 className="text-lg font-bold mb-2 text-slate-800">Permanently Delete?</h3>
             <p className="text-slate-500 text-sm mb-6">You are about to permanently delete <b>"{itemToDelete.title}"</b>. This cannot be undone.</p>
             <div className="flex gap-3">
                <button onClick={() => setItemToDelete(null)} className="flex-1 px-4 py-3 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 px-4 py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 shadow-lg shadow-rose-200 transition-colors">Delete Forever</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHistory;
