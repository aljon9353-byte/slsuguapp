

import React, { useState, useEffect, useRef } from 'react';
import { ServiceRequest, RequestStatus, UserRole, Comment } from '../types';
import { Search, MapPin, Clock, Loader2, CheckCircle, Trash2, AlertTriangle, MessageSquare, Send, User, X, Image as ImageIcon, Plus, Star, Filter, Briefcase, GraduationCap, ChevronRight, ChevronLeft } from 'lucide-react';

interface AdminRequestTableProps {
  requests: ServiceRequest[];
  onUpdateStatus: (id: string, status: RequestStatus) => void;
  onDelete: (id: string) => void;
  onAddComment: (requestId: string, text: string, imageUrl?: string) => void;
  onReact: (requestId: string, targetId: string, emoji: string) => void;
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

const AdminRequestTable: React.FC<AdminRequestTableProps> = ({ requests, onUpdateStatus, onDelete, onAddComment, onReact }) => {
  const [filter, setFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [requestToDelete, setRequestToDelete] = useState<ServiceRequest | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [activeReactionId, setActiveReactionId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter out archived requests from active view
  const activeRequests = requests.filter(r => !r.isArchived);

  const filteredRequests = activeRequests.filter(r => {
    const matchesFilter = filter === 'ALL' || r.status === filter;
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                          r.description.toLowerCase().includes(search.toLowerCase()) ||
                          r.userName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDeleteClick = (req: ServiceRequest) => {
    setRequestToDelete(req);
  };

  const confirmDelete = () => {
    if (requestToDelete) {
      onDelete(requestToDelete.id);
      setRequestToDelete(null);
    }
  };

  const handleOpenChat = (req: ServiceRequest) => {
    setSelectedRequest(req);
    setReplyText('');
    setReplyImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) return;
      setIsProcessingImage(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 800;
          if (width > height) {
            if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
          } else {
            if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            setReplyImage(canvas.toDataURL('image/jpeg', 0.6));
          }
          setIsProcessingImage(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || (!replyText.trim() && !replyImage)) return;
    
    onAddComment(selectedRequest.id, replyText, replyImage || undefined);
    setReplyText('');
    setReplyImage(null);
  };

  const handleMessageLongPress = (e: React.MouseEvent | React.TouchEvent, targetId: string) => {
    e.preventDefault();
    setActiveReactionId(activeReactionId === targetId ? null : targetId);
  };

  const activeRequest = selectedRequest ? requests.find(r => r.id === selectedRequest.id) : null;
  const activeComments = activeRequest?.comments || [];

  useEffect(() => {
    if (activeRequest && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeComments.length, activeRequest]);

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-white shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight pl-2">Request Management</h2>
        
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 w-full md:w-auto">
          <div className="relative w-full md:w-64 group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search title, user..." 
              className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 w-full bg-white transition-all font-medium text-slate-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative w-full md:w-auto">
             <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
             <select 
               className="pl-10 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 w-full font-medium text-slate-700 appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
               value={filter}
               onChange={(e) => setFilter(e.target.value as RequestStatus | 'ALL')}
             >
               <option value="ALL">All Status</option>
               {Object.values(RequestStatus).map(s => <option key={s} value={s}>{s}</option>)}
             </select>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Request Details</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Chat</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRequests.map((req) => {
                const comments = req.comments || [];
                const displayImages = req.images && req.images.length > 0 
                                      ? req.images 
                                      : (req.imageUrl ? [req.imageUrl] : []);
                
                return (
                <tr key={req.id} className="hover:bg-sky-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-start space-x-4">
                      {displayImages.length > 0 ? (
                        <button 
                          onClick={() => setViewImage(displayImages[0])}
                          className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 cursor-zoom-in relative group/img shadow-sm"
                        >
                          <img src={displayImages[0]} alt="Attachment" className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors" />
                          {displayImages.length > 1 && (
                             <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1 font-bold rounded-tl-lg">
                                +{displayImages.length - 1}
                             </div>
                          )}
                        </button>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 flex-shrink-0 shadow-inner">
                           <ImageIcon size={22} />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate pr-4 text-sm mb-0.5">{req.title}</p>
                        <p className="text-xs text-slate-500 truncate max-w-xs mb-2 font-medium">{req.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                          <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-bold border border-slate-200">{req.category}</span>
                          <span className="flex items-center font-semibold"><MapPin size={10} className="mr-1" />{req.location}</span>
                          
                          <div className="flex items-center space-x-2 border-l border-slate-200 pl-2 ml-1">
                             <span className="flex items-center font-bold text-slate-600"><User size={10} className="mr-1" />{req.userName}</span>
                             {(req.userCourse || req.userStaffPosition) && (
                               <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-bold flex items-center border border-indigo-100">
                                 {req.userRole === UserRole.STUDENT ? <GraduationCap size={10} className="mr-1"/> : <Briefcase size={10} className="mr-1"/>}
                                 {req.userCourse || req.userStaffPosition}
                               </span>
                             )}
                          </div>
                        </div>

                        {/* RATING DISPLAY */}
                        {req.rating && (
                          <div className="mt-2 flex items-center p-1 bg-amber-50 rounded-lg border border-amber-100 w-fit">
                             <div className="flex space-x-0.5">
                               {[...Array(5)].map((_, i) => (
                                 <Star key={i} size={10} fill={i < (req.rating || 0) ? "#f59e0b" : "none"} stroke={i < (req.rating || 0) ? "#f59e0b" : "#cbd5e1"} />
                               ))}
                             </div>
                             {req.feedback && (
                               <span className="text-[10px] text-slate-500 border-l border-amber-200 ml-2 pl-2 italic truncate max-w-[150px]">
                                 "{req.feedback}"
                               </span>
                             )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center bg-white rounded-xl p-1 w-max shadow-sm border border-slate-100">
                      <button onClick={() => onUpdateStatus(req.id, RequestStatus.PENDING)} className={`p-1.5 rounded-lg transition-all ${req.status === RequestStatus.PENDING ? 'bg-amber-100 text-amber-600 shadow-sm' : 'text-slate-300 hover:text-slate-500'}`} title="Pending"><Clock size={18} /></button>
                      <button onClick={() => onUpdateStatus(req.id, RequestStatus.IN_PROGRESS)} className={`p-1.5 rounded-lg transition-all ${req.status === RequestStatus.IN_PROGRESS ? 'bg-sky-100 text-sky-600 shadow-sm' : 'text-slate-300 hover:text-slate-500'}`} title="In Progress"><Loader2 size={18} /></button>
                      <button onClick={() => onUpdateStatus(req.id, RequestStatus.COMPLETED)} className={`p-1.5 rounded-lg transition-all ${req.status === RequestStatus.COMPLETED ? 'bg-emerald-100 text-emerald-600 shadow-sm' : 'text-slate-300 hover:text-slate-500'}`} title="Completed"><CheckCircle size={18} /></button>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button onClick={() => handleOpenChat(req)} className={`p-2.5 rounded-xl relative transition-all ${comments.some(c => c.role === UserRole.STUDENT) ? 'text-sky-600 bg-sky-50 hover:bg-sky-100' : 'text-slate-400 hover:text-sky-600 hover:bg-slate-50'}`}>
                      <MessageSquare size={20} />
                      {comments.length > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{comments.length}</span>}
                    </button>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button onClick={() => handleDeleteClick(req)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Delete">
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        {filteredRequests.length === 0 && (
          <div className="p-12 text-center text-slate-400">
             No active requests found.
          </div>
        )}
      </div>

      {viewImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm" onClick={() => setViewImage(null)}>
           <button className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"><X size={24} /></button>
           <img src={viewImage} alt="Full size" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {requestToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center border border-white/60">
             <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-rose-600" size={28} />
             </div>
             <h3 className="text-lg font-bold mb-2 text-slate-800">Delete Request?</h3>
             <p className="text-slate-500 text-sm mb-6">This request will be moved to the <b>History</b> archive.</p>
             <div className="flex gap-3">
                <button onClick={() => setRequestToDelete(null)} className="flex-1 px-4 py-3 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 px-4 py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 shadow-lg shadow-rose-200 transition-colors">Delete</button>
             </div>
          </div>
        </div>
      )}

      {activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setActiveReactionId(null)}>
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[650px] border border-white/60" onClick={e => e.stopPropagation()}>
              <div className="p-5 border-b border-slate-100 bg-white/50 backdrop-blur flex items-center justify-between z-10">
                 <div>
                    <h3 className="font-bold text-slate-800 truncate max-w-[200px] text-sm">{activeRequest.title}</h3>
                    <div className="flex items-center text-xs text-slate-500 font-medium space-x-1">
                      <span>{activeRequest.userName}</span>
                      {(activeRequest.userCourse || activeRequest.userStaffPosition) && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-600 font-bold">{activeRequest.userCourse || activeRequest.userStaffPosition}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{activeRequest.category}</span>
                    </div>
                 </div>
                 <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600 p-2 bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
              </div>
              
              <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-slate-50/50" onClick={() => setActiveReactionId(null)}>
                 {/* Original Request Message - NOW REACTABLE */}
                 <div className="flex flex-col space-y-1 items-start relative group">
                     <div className="flex items-end max-w-[90%] flex-row">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 mb-1 mr-2 shadow-sm border border-white"><User size={14} /></div>
                        
                        <div 
                           className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm w-full relative cursor-pointer select-none transition-transform active:scale-[0.99]"
                           onDoubleClick={(e) => handleMessageLongPress(e, activeRequest.id)}
                           onContextMenu={(e) => handleMessageLongPress(e, activeRequest.id)}
                        >
                           <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">{activeRequest.userName}</p>
                           
                           {/* Multiple Image Display in Chat Context */}
                           {(activeRequest.images && activeRequest.images.length > 0) ? (
                              <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                                {activeRequest.images.map((img, idx) => (
                                  <div key={idx} onClick={(e) => { e.stopPropagation(); setViewImage(img); }} className="aspect-square relative cursor-zoom-in">
                                      <img src={img} className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                           ) : activeRequest.imageUrl && (
                              <button onClick={(e) => { e.stopPropagation(); setViewImage(activeRequest.imageUrl!); }} className="mb-3 block w-full rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                                  <img src={activeRequest.imageUrl} className="w-full h-auto max-h-48 object-cover" />
                              </button>
                           )}

                           <p className="text-sm text-slate-800 whitespace-pre-wrap font-medium leading-relaxed">{activeRequest.description}</p>
                           
                           {/* Reactions on Main Request */}
                           {activeRequest.reactions && activeRequest.reactions.length > 0 && (
                                   <div className={`absolute -bottom-3 -right-2 bg-white border border-slate-200 shadow-sm rounded-full px-1.5 py-0.5 flex items-center space-x-0.5 z-10`}>
                                     {Array.from(new Set(activeRequest.reactions.map(r => r.emoji))).map(e => <span key={e} className="text-xs">{e}</span>)}
                                     <span className="text-[10px] text-slate-500 font-bold ml-1">{activeRequest.reactions.length}</span>
                                   </div>
                            )}

                           {/* Reaction Picker for Main Request */}
                            {activeReactionId === activeRequest.id && (
                                   <div className={`absolute -top-14 left-0 bg-white shadow-xl rounded-full p-2.5 flex space-x-2 border border-slate-100 animate-fadeIn z-20`}>
                                     {EMOJIS.map(emoji => (
                                       <button 
                                         key={emoji} 
                                         onClick={(e) => { e.stopPropagation(); onReact(activeRequest.id, activeRequest.id, emoji); setActiveReactionId(null); }}
                                         className="hover:scale-125 transition-transform text-2xl"
                                       >
                                         {emoji}
                                       </button>
                                     ))}
                                   </div>
                            )}
                        </div>
                    </div>
                    <span className="text-[10px] text-slate-400 ml-11 font-medium">{new Date(activeRequest.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                 </div>

                 {/* Comments */}
                 {activeComments.map((comment, idx) => {
                    const isAdmin = comment.role === UserRole.ADMIN;
                    const isReactionOpen = activeReactionId === comment.id;
                    const commentReactions = comment.reactions || [];
                    return (
                      <div key={idx} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} relative group`}>
                          <div className={`flex items-end max-w-[85%] ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mb-1 shadow-sm border border-white ${isAdmin ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white ml-2' : 'bg-slate-200 text-slate-500 mr-2'}`}><User size={14} /></div>
                             
                             <div 
                                className={`p-4 rounded-2xl text-sm shadow-sm relative cursor-pointer select-none transition-transform active:scale-95 ${isAdmin ? 'bg-white text-slate-800 border border-slate-100 rounded-tr-none' : 'bg-white border border-slate-100 rounded-tl-none'}`}
                                onDoubleClick={(e) => handleMessageLongPress(e, comment.id)}
                                onContextMenu={(e) => handleMessageLongPress(e, comment.id)}
                             >
                                 <p className={`text-[10px] font-bold mb-1 uppercase tracking-wider ${isAdmin ? 'text-sky-600' : 'text-slate-400'}`}>{isAdmin ? 'Admin Support' : 'User'}</p>
                                 {comment.imageUrl && (
                                   <div className="mb-2 rounded-xl overflow-hidden bg-slate-50 border border-slate-100" onClick={(e) => { e.stopPropagation(); setViewImage(comment.imageUrl!); }}>
                                     <img src={comment.imageUrl} className="w-full h-auto max-h-48 object-cover" />
                                   </div>
                                 )}
                                 <p className="whitespace-pre-wrap font-medium leading-relaxed">{comment.text}</p>

                                 {/* Reactions Display */}
                                 {commentReactions.length > 0 && (
                                   <div className={`absolute -bottom-3 ${isAdmin ? '-left-2' : '-right-2'} bg-white border border-slate-200 shadow-sm rounded-full px-1.5 py-0.5 flex items-center space-x-0.5 z-10`}>
                                     {Array.from(new Set(commentReactions.map(r => r.emoji))).map(e => <span key={e} className="text-xs">{e}</span>)}
                                     <span className="text-[10px] text-slate-500 font-bold ml-1">{commentReactions.length}</span>
                                   </div>
                                 )}

                                 {/* Reaction Picker Popover */}
                                 {isReactionOpen && (
                                   <div className={`absolute -top-14 ${isAdmin ? 'right-0' : 'left-0'} bg-white shadow-xl rounded-full p-2.5 flex space-x-2 border border-slate-100 animate-fadeIn z-20`}>
                                     {EMOJIS.map(emoji => (
                                       <button 
                                         key={emoji} 
                                         onClick={(e) => { e.stopPropagation(); onReact(activeRequest.id, comment.id, emoji); setActiveReactionId(null); }}
                                         className="hover:scale-125 transition-transform text-2xl"
                                       >
                                         {emoji}
                                       </button>
                                     ))}
                                   </div>
                                 )}
                             </div>
                          </div>
                          <span className={`text-[10px] text-slate-400 mt-2 mx-11 font-medium`}>
                             {new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                      </div>
                    );
                 })}
                 <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-slate-100">
                 {replyImage && (
                   <div className="mb-3 relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 group shadow-sm">
                      <img src={replyImage} className="w-full h-full object-cover" />
                      <button onClick={() => setReplyImage(null)} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"><X size={20}/></button>
                   </div>
                 )}
                 <div className="relative flex items-center gap-3">
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors border border-transparent hover:border-sky-100"
                      title="Attach Image"
                    >
                       <ImageIcon size={22} />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isProcessingImage} />
                    
                    <input
                       type="text"
                       className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:outline-none transition-all font-medium text-slate-700"
                       placeholder="Type your reply..."
                       value={replyText}
                       onChange={(e) => setReplyText(e.target.value)}
                    />
                    <button 
                       type="submit"
                       disabled={(!replyText.trim() && !replyImage) || isProcessingImage}
                       className="p-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-50 transition-all shadow-lg shadow-sky-200"
                    >
                       {isProcessingImage ? <Loader2 size={20} className="animate-spin"/> : <Send size={20} />}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequestTable;