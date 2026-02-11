

import React, { useState, useMemo } from 'react';
import { User, UserRole } from '../types';
import { Search, Shield, CheckCircle, XCircle, Trash2, AlertTriangle, User as UserIcon, Lock } from 'lucide-react';

interface AdminUserTableProps {
  users: User[];
  currentUser: User;
  onToggleVerify: (id: string) => void;
  onDelete: (id: string) => void;
}

const AdminUserTable: React.FC<AdminUserTableProps> = ({ users, currentUser, onToggleVerify, onDelete }) => {
  const [search, setSearch] = useState('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Deduplicate users based on email to ensure unique entries
  const uniqueUsers = useMemo(() => {
    const map = new Map<string, User>();
    users.forEach(user => {
      const emailKey = user.email.toLowerCase().trim();
      if (!map.has(emailKey)) {
        map.set(emailKey, user);
      }
    });
    return Array.from(map.values());
  }, [users]);

  const filteredUsers = uniqueUsers.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      onDelete(userToDelete.id);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-white shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight pl-2">User Directory</h2>
        
        <div className="relative w-full md:w-72 group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search name or email..." 
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
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">User Profile</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Role Assignment</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Verification</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-sky-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 text-blue-600 flex items-center justify-center shadow-sm border border-white ring-2 ring-transparent group-hover:ring-sky-100 transition-all">
                        <span className="font-bold text-sm">{user.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 flex items-center text-sm">
                          {user.name}
                          {user.id === currentUser.id && <span className="ml-2 text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-bold border border-sky-200">YOU</span>}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <div className="flex items-center space-x-2">
                        <span className={`text-xs px-3 py-1.5 rounded-lg font-bold border shadow-sm flex items-center ${
                             user.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-700 border-purple-100' :
                             user.role === UserRole.FACULTY ? 'bg-amber-50 text-amber-700 border-amber-100' :
                             user.role === UserRole.STAFF ? 'bg-orange-50 text-orange-700 border-orange-100' :
                             'bg-sky-50 text-sky-700 border-sky-100'
                        }`}>
                           {user.role}
                        </span>
                        <div className="group/tooltip relative">
                           <Lock size={14} className="text-slate-300" />
                           <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              Role cannot be changed
                           </span>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-5">
                    <button 
                      onClick={() => onToggleVerify(user.id)}
                      disabled={user.id === currentUser.id}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border transition-all shadow-sm ${
                        user.isVerified 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                        : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                      } ${user.id !== currentUser.id ? 'cursor-pointer' : 'opacity-70 cursor-not-allowed'}`}
                    >
                      {user.isVerified ? (
                        <>
                          <CheckCircle size={14} className="mr-1.5" /> Verified
                        </>
                      ) : (
                        <>
                          <XCircle size={14} className="mr-1.5" /> Unverified
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-5 text-right">
                    {user.id !== currentUser.id && (
                      <button 
                        onClick={() => handleDeleteClick(user)}
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                       <UserIcon size={32} className="text-slate-300 mb-2" />
                       <p>No users found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100 border border-white/60">
             <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mb-4 border border-rose-50">
                   <AlertTriangle className="text-rose-600" size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete User?</h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">
                  Are you sure you want to delete <span className="font-bold text-slate-800">{userToDelete.name}</span>? 
                  This action cannot be undone.
                </p>
                <div className="flex items-center space-x-3 w-full">
                  <button 
                    onClick={() => setUserToDelete(null)}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
                  >
                    Delete User
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserTable;
