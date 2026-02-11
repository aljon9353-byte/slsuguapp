

import React, { useState } from 'react';
import { ServiceRequest, RequestStatus, UserRole, RequestCategory } from '../types';
import { ChevronDown, ChevronUp, Star, MapPin, Calendar, Image as ImageIcon, MessageSquare, Send, User, Zap, Monitor, AlertTriangle, Trash2, FileText, LayoutGrid } from 'lucide-react';

interface RequestListProps {
  requests: ServiceRequest[];
  onRate: (id: string, rating: number, feedback: string) => void;
  onAddComment: (requestId: string, text: string) => void;
  onReact: (requestId: string, targetId: string, emoji: string) => void;
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

// Lighter, fresher background colors for the icons
const getCategoryDetails = (category: RequestCategory) => {
  switch(category) {
    case RequestCategory.FACILITIES:
      return { color: 'bg-orange-50 text-orange-600', icon: LayoutGrid, accent: 'border-orange-200' };
    case RequestCategory.SANITATION:
      return { color: 'bg-teal-50 text-teal-600', icon: Trash2, accent: 'border-teal-200' };
    case RequestCategory.ACADEMIC:
      return { color: 'bg-violet-50 text-violet-600', icon: FileText, accent: 'border-violet-200' };
    default:
      return { color: 'bg-slate-50 text-slate-600', icon: Zap, accent: 'border-slate-200' };
  }
};

const RequestList: React.FC<RequestListProps> = ({ requests, onRate, onAddComment, onReact }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [ratingInput, setRatingInput] = useState<{id: string, value: number, text: string} | null>(null);
  const [messageInput, setMessageInput] = useState<{id: string, text: string}>({ id: '', text: '' });
  const [activeReactionId, setActiveReactionId] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusStep = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING: return 1;
      case RequestStatus.IN_PROGRESS: return 2;
      case RequestStatus.COMPLETED: return 3;
      case RequestStatus.REJECTED: return 0;
      default: return 1;
    }
  };

  const handleMessageLongPress = (e: React.MouseEvent | React.TouchEvent, targetId: string) => {
    e.preventDefault();
    setActiveReactionId(activeReactionId === targetId ? null : targetId);
  };

  const StatusTracker = ({ status }: { status: RequestStatus }) => {
    const step = getStatusStep(status);
    if (status === RequestStatus.REJECTED) return <div className="text-red-600 font-bold bg-red-50 p-4 rounded-xl text-center border border-red-100 shadow-sm mt-4">🚫 Request Rejected</div>;
    return (
      <div className="flex items-center w-full space-x-2 mt-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        {[{ label: 'Received', step: 1 }, { label: 'In Progress', step: 2 }, { label: 'Completed', step: 3 }].map((s, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center relative z-10">
            <div className={`w-8 h-8 rounded-full mb-2 flex items-center justify-center transition-all duration-300 ${
                step >= s.step 
                ? 'bg-sky-500 text-white shadow-md shadow-sky-200 scale-105' 
                : 'bg-slate-100 text-slate-300'
            }`}>
                {step >= s.step && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${step >= s.step ? 'text-sky-600' : 'text-slate-400'}`}>{s.label}</span>
            {idx < 2 && (
               <div className="absolute top-4 left-1/2 w-full h-0.5 -z-10 bg-slate-100">
                  <div className={`h-full bg-sky-500 transition-all duration-500 ${step > s.step ? 'w-full' : 'w-0'}`}></div>
               </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const handleRatingSubmit = (id: string) => {
    if (ratingInput && ratingInput.id === id) {
      onRate(id, ratingInput.value, ratingInput.text);
      setRatingInput(null);
    }
  };

  const handleSendMessage = (e: React.FormEvent, requestId: string) => {
    e.preventDefault();
    if (messageInput.id === requestId && messageInput.text.trim()) {
      onAddComment(requestId, messageInput.text);
      setMessageInput({ id: '', text: '' });
    }
  };

  return (
    <div className="space-y-6 pb-20" onClick={() => setActiveReactionId(null)}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white shadow-sm">
         <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Requests</h1>
            <p className="text-slate-500 mt-1 font-medium">Track and manage your campus service reports.</p>
         </div>
         <div className="mt-4 md:mt-0 bg-white px-5 py-2.5 rounded-full border border-slate-100 shadow-sm text-sm font-bold text-sky-600 flex items-center w-fit">
           <span className="w-2 h-2 rounded-full bg-sky-500 mr-2 animate-pulse"></span>
           {requests.length} Total Requests
         </div>
      </div>

      <div className="grid gap-5">
        {requests.map((req) => {
          const { color, icon: Icon, accent } = getCategoryDetails(req.category);
          const isCompleted = req.status === RequestStatus.COMPLETED;
          const comments = req.comments || [];
          const reactions = req.reactions || [];
          
          // Helper to get images array, fallback to legacy imageUrl if needed
          const displayImages = req.images && req.images.length > 0 
                                ? req.images 
                                : (req.imageUrl ? [req.imageUrl] : []);
          
          return (
            <div key={req.id} className={`bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 shadow-sm overflow-hidden transition-all hover:shadow-lg hover:shadow-sky-100/50 hover:-translate-y-0.5 group ${expandedId === req.id ? 'ring-2 ring-sky-500/10' : ''}`}>
              
              {/* Card Header / Summary */}
              <div 
                className="p-5 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer relative"
                onClick={() => toggleExpand(req.id)}
              >
                 <div className="flex items-center flex-1 gap-4">
                   {/* Category Icon */}
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 ${color}`}>
                     <Icon size={24} strokeWidth={2.5} />
                   </div>
                   
                   <div className="min-w-0 flex-1">
                     <h3 className="text-lg font-bold text-slate-800 group-hover:text-sky-600 transition-colors leading-tight truncate">{req.title}</h3>
                     <div className="flex items-center text-xs text-slate-500 mt-2 space-x-3 flex-wrap">
                       <span className="flex items-center bg-slate-50 px-3 py-1 rounded-full border border-slate-100 text-slate-600 font-semibold mb-1">
                          <Calendar size={12} className="mr-1.5 text-slate-400"/> 
                          {new Date(req.createdAt).toLocaleDateString()}
                       </span>
                       <span className="flex items-center bg-slate-50 px-3 py-1 rounded-full border border-slate-100 text-slate-600 font-semibold mb-1">
                          <MapPin size={12} className="mr-1.5 text-slate-400"/> 
                          {req.location}
                       </span>
                     </div>
                   </div>

                   {/* Image Thumbnail in Collapsed View - Show first image */}
                   {displayImages.length > 0 && (
                      <div className="hidden sm:block w-14 h-14 rounded-xl border border-slate-200 overflow-hidden shadow-sm flex-shrink-0 bg-slate-50 relative">
                         <img src={displayImages[0]} alt="Request" className="w-full h-full object-cover" />
                         {displayImages.length > 1 && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold">
                               +{displayImages.length - 1}
                            </div>
                         )}
                      </div>
                   )}
                 </div>

                 {/* Status & Toggle Arrow */}
                 <div className="flex items-center justify-between md:justify-end gap-3 pl-0 md:pl-0 mt-2 md:mt-0">
                     {/* Status Badge */}
                     <span className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center shadow-sm ${
                        req.status === RequestStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        req.status === RequestStatus.IN_PROGRESS ? 'bg-sky-50 text-sky-600 border-sky-100' :
                        req.status === RequestStatus.REJECTED ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                     }`}>
                       <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          req.status === RequestStatus.COMPLETED ? 'bg-emerald-500' :
                          req.status === RequestStatus.IN_PROGRESS ? 'bg-sky-500' :
                          req.status === RequestStatus.REJECTED ? 'bg-rose-500' :
                          'bg-amber-500'
                       }`}></span>
                       {req.status}
                     </span>

                     {comments.length > 0 && (
                       <div className="flex items-center text-sky-600 text-xs font-bold bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100">
                          <MessageSquare size={14} className="mr-1.5" />
                          {comments.length}
                       </div>
                     )}
                    
                    <div className={`p-2 rounded-full transition-transform duration-300 ${expandedId === req.id ? 'bg-slate-100 rotate-180 text-sky-600' : 'text-slate-400 hover:bg-slate-50'}`}>
                      <ChevronDown size={20}/> 
                    </div>
                 </div>
              </div>

              {/* Expanded Content */}
              {expandedId === req.id && (
                <div className="p-4 md:p-6 bg-slate-50/50 border-t border-slate-100 animate-fadeIn">
                   <div className="flex flex-col xl:flex-row gap-6 md:gap-8">
                      <div className="flex-1 space-y-6">
                        
                        {/* Main Description */}
                        <div className="bg-white p-6 rounded-3xl border border-white shadow-sm relative">
                          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                             <span className="w-1.5 h-1.5 bg-sky-400 rounded-full mr-2"></span>
                             {req.category === 'Academic Docs' ? 'My Message' : 'Description'}
                          </h4>
                          
                          <div 
                             className="text-sm text-slate-700 leading-relaxed relative cursor-pointer select-none font-medium"
                             onDoubleClick={(e) => handleMessageLongPress(e, req.id)}
                             onContextMenu={(e) => handleMessageLongPress(e, req.id)}
                          >
                              {req.description}
                              
                               {/* Reactions */}
                               {reactions.length > 0 && (
                                  <div className="mt-4 flex flex-wrap gap-2">
                                     {Array.from(new Set(reactions.map(r => r.emoji))).map(emoji => (
                                       <span key={emoji} className="bg-white border border-slate-200 px-2 py-1 rounded-full text-xs flex items-center shadow-sm">
                                         <span className="mr-1">{emoji}</span>
                                         <span className="font-bold text-slate-600">{reactions.filter(r => r.emoji === emoji).length}</span>
                                       </span>
                                     ))}
                                  </div>
                               )}

                               {/* Reaction Picker */}
                               {activeReactionId === req.id && (
                                 <div className="absolute -top-14 left-0 bg-white p-2 rounded-full shadow-xl border border-slate-100 flex space-x-2 animate-fadeIn z-20">
                                   {EMOJIS.map(emoji => (
                                     <button key={emoji} onClick={(e) => { e.stopPropagation(); onReact(req.id, req.id, emoji); setActiveReactionId(null); }} className="hover:scale-125 transition-transform text-2xl">
                                       {emoji}
                                     </button>
                                   ))}
                                 </div>
                               )}
                          </div>
                        </div>

                        {/* Chat Section */}
                        <div className="bg-white border border-white rounded-3xl overflow-hidden shadow-sm flex flex-col h-[500px]">
                          <div className="bg-white/80 backdrop-blur px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
                             <div className="flex items-center">
                                <div className="p-2 bg-sky-50 rounded-xl border border-sky-100 mr-3 text-sky-600">
                                  <MessageSquare size={18} />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-slate-800">Discussion</h4>
                                  <span className="text-xs text-slate-400 font-medium block">Direct line to admin</span>
                                </div>
                             </div>
                             <span className="text-xs font-bold bg-sky-100 text-sky-700 px-2.5 py-1 rounded-full">{comments.length}</span>
                          </div>
                          
                          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50 custom-scrollbar">
                             {comments.length === 0 ? (
                               <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <MessageSquare size={24} className="text-slate-300" />
                                  </div>
                                  <p className="text-sm font-medium text-slate-600">No messages yet.</p>
                                  <p className="text-xs">Start the conversation below.</p>
                               </div>
                             ) : (
                               comments.map((comment, i) => {
                                 const isAdmin = comment.role === UserRole.ADMIN;
                                 const isReactionOpen = activeReactionId === comment.id;
                                 const commentReactions = comment.reactions || [];
                                 return (
                                   <div key={i} className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'} relative group`}>
                                      <div className={`flex items-end max-w-[85%] ${isAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
                                         <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mb-1 shadow-sm border-2 border-white ${isAdmin ? 'bg-gradient-to-br from-sky-400 to-blue-500 text-white mr-2' : 'bg-slate-200 text-slate-500 ml-2'}`}>
                                           <User size={14} />
                                         </div>
                                         
                                         <div 
                                            className={`p-4 rounded-2xl text-sm relative cursor-pointer select-none shadow-sm transition-all hover:shadow-md ${
                                              isAdmin 
                                                ? 'bg-white text-slate-700 border border-slate-100 rounded-bl-none' 
                                                : 'bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-br-none shadow-sky-100'
                                            }`}
                                            onDoubleClick={(e) => handleMessageLongPress(e, comment.id)}
                                            onContextMenu={(e) => handleMessageLongPress(e, comment.id)}
                                         >
                                            <div className="flex justify-between items-center mb-1 opacity-80 text-[10px] font-bold uppercase tracking-wider">
                                              <span>{isAdmin ? 'Admin Support' : 'You'}</span>
                                            </div>
                                            
                                            {comment.imageUrl && (
                                              <div className="mb-3 rounded-lg overflow-hidden bg-black/5 border border-black/5" onClick={(e) => { e.stopPropagation(); setViewImage(comment.imageUrl!); }}>
                                                 <img src={comment.imageUrl} className="w-full h-auto max-h-48 object-cover hover:scale-105 transition-transform" />
                                              </div>
                                            )}

                                            <p className="leading-relaxed font-medium">{comment.text}</p>

                                            {/* Reactions Display */}
                                            {commentReactions.length > 0 && (
                                              <div className={`absolute -bottom-3 ${isAdmin ? '-right-2' : '-left-2'} bg-white border border-slate-200 shadow-sm rounded-full px-1.5 py-0.5 flex items-center space-x-0.5 z-10 scale-90`}>
                                                {Array.from(new Set(commentReactions.map(r => r.emoji))).map(e => <span key={e} className="text-xs">{e}</span>)}
                                                <span className="text-[10px] text-slate-500 font-bold ml-1">{commentReactions.length}</span>
                                              </div>
                                            )}

                                            {/* Reaction Picker */}
                                            {isReactionOpen && (
                                              <div className={`absolute -top-14 ${isAdmin ? 'left-0' : 'right-0'} bg-white shadow-xl rounded-full p-2.5 flex space-x-2 border border-slate-100 animate-fadeIn z-20`}>
                                                {EMOJIS.map(emoji => (
                                                  <button key={emoji} onClick={(e) => { e.stopPropagation(); onReact(req.id, comment.id, emoji); setActiveReactionId(null); }} className="hover:scale-125 transition-transform text-2xl">{emoji}</button>
                                                ))}
                                              </div>
                                            )}
                                         </div>
                                      </div>
                                      <span className="text-[10px] text-slate-400 mt-2 mx-11 font-semibold">
                                        {new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </span>
                                   </div>
                                 );
                               })
                             )}
                          </div>

                          <div className="p-4 bg-white border-t border-slate-100">
                            <form onSubmit={(e) => handleSendMessage(e, req.id)} className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:ring-4 focus-within:ring-sky-500/10 focus-within:border-sky-500 transition-all">
                               <input 
                                 type="text" 
                                 className="flex-1 px-4 py-2 bg-transparent focus:outline-none text-sm text-slate-700 placeholder:text-slate-400 font-medium" 
                                 placeholder="Type your message..." 
                                 value={messageInput.id === req.id ? messageInput.text : ''} 
                                 onChange={(e) => setMessageInput({ id: req.id, text: e.target.value })} 
                               />
                               <button 
                                 type="submit" 
                                 disabled={messageInput.id === req.id && !messageInput.text.trim()} 
                                 className="p-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-50 disabled:bg-slate-300 transition-all shadow-sm"
                               >
                                 <Send size={16} />
                               </button>
                            </form>
                          </div>
                        </div>
                        
                        {req.aiAnalysis && (
                          <div className="p-6 bg-gradient-to-r from-sky-50 to-blue-50 rounded-3xl border border-sky-100 flex items-start space-x-4 shadow-sm relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100/50 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                             <div className="p-2.5 bg-white rounded-xl shadow-sm text-sky-600 relative z-10"><Star size={20} fill="currentColor" className="text-sky-200" stroke="currentColor"/></div>
                             <div className="relative z-10">
                                <h4 className="text-xs font-extrabold text-sky-800 uppercase tracking-wide mb-1">AI Smart Summary</h4>
                                <p className="text-sm text-sky-900 leading-relaxed font-medium">{req.aiAnalysis}</p>
                             </div>
                          </div>
                        )}
                        
                        <div className="bg-white p-6 rounded-3xl border border-white shadow-sm">
                          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                            Request Timeline
                          </h4>
                          <StatusTracker status={req.status} />
                        </div>
                      </div>

                      <div className="w-full xl:w-80 flex flex-col space-y-6">
                         {displayImages.length > 0 && (
                           <div className="bg-white p-4 rounded-3xl border border-white shadow-sm">
                             <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3 pl-2">
                                Attachments ({displayImages.length})
                             </h4>
                             <div className="grid grid-cols-2 gap-2">
                                {displayImages.map((img, idx) => (
                                   <div 
                                      key={idx} 
                                      className="rounded-xl overflow-hidden border border-slate-100 cursor-pointer group relative shadow-inner bg-slate-50 aspect-square" 
                                      onClick={() => setViewImage(img)}
                                   >
                                      <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                         <ImageIcon size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                                      </div>
                                   </div>
                                ))}
                             </div>
                           </div>
                         )}

                         {/* Rating UI */}
                         {isCompleted && !req.rating && (
                           <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-3xl border border-amber-100 shadow-sm relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400"></div>
                              <div className="text-center mb-5">
                                 <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md text-amber-500 border-4 border-amber-50">
                                   <Star fill="currentColor" size={26} />
                                 </div>
                                 <h4 className="text-lg font-bold text-slate-800">Rate Service</h4>
                                 <p className="text-xs text-slate-500 font-medium">How was your experience?</p>
                              </div>
                              
                              <div className="flex justify-center space-x-2 mb-5">
                                 {[1, 2, 3, 4, 5].map((star) => (
                                   <button 
                                     key={star} 
                                     onClick={() => setRatingInput({id: req.id, value: star, text: ratingInput?.text || ''})} 
                                     className={`transition-all hover:scale-110 p-1 ${ratingInput?.id === req.id && ratingInput.value >= star ? 'text-amber-500 drop-shadow-sm' : 'text-slate-300'}`}
                                   >
                                      <Star fill="currentColor" size={28} />
                                   </button>
                                 ))}
                              </div>
                              
                              <textarea 
                                placeholder="Share your experience (optional)..." 
                                className="w-full text-sm p-3 rounded-xl border border-amber-200 mb-4 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white/80 placeholder:text-amber-300/80 text-amber-900" 
                                rows={3} 
                                onChange={(e) => setRatingInput(prev => prev ? {...prev, text: e.target.value} : null)} 
                              />
                              
                              <button 
                                onClick={() => handleRatingSubmit(req.id)} 
                                disabled={!ratingInput || ratingInput.id !== req.id} 
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-amber-200 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                              >
                                Submit Review
                              </button>
                           </div>
                         )}

                         {req.rating && (
                           <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-3xl border border-emerald-100 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
                              <div className="absolute -right-6 -top-6 w-20 h-20 bg-emerald-100 rounded-full blur-xl"></div>
                              <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider mb-3 z-10">You Rated This</h4>
                              <div className="flex text-emerald-500 mb-3 z-10 bg-white px-3 py-1.5 rounded-full shadow-sm">
                                 {[...Array(5)].map((_, i) => <Star key={i} size={18} fill={i < (req.rating || 0) ? "currentColor" : "none"} stroke="currentColor" />)}
                              </div>
                              <span className="text-3xl font-black text-emerald-700 z-10">{req.rating}.0</span>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
              )}
            </div>
          );
        })}
        
        {requests.length === 0 && (
           <div className="text-center py-24 bg-white/50 backdrop-blur-md rounded-3xl border border-dashed border-slate-300">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-white">
                <Calendar size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No requests yet</h3>
              <p className="text-slate-500 max-w-xs mx-auto mb-8 font-medium">Create a new service request to get started with campus assistance.</p>
              
              {/* Decorative faint elements */}
              <div className="inline-block w-20 h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent rounded-full"></div>
           </div>
        )}
      </div>
      
      {/* Full Image Viewer */}
      {viewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-fadeIn" onClick={() => setViewImage(null)}>
           <img src={viewImage} className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain ring-1 ring-white/10" onClick={(e) => e.stopPropagation()} />
           <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-full"><Trash2 className="hidden" /> <span className="text-2xl leading-none px-2">&times;</span></button>
        </div>
      )}
    </div>
  );
};

export default RequestList;