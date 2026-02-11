
import React, { useState, useRef, useEffect } from 'react';
import { RequestCategory, ServiceRequest, RequestStatus, User, UserRole } from '../types';
import { analyzeServiceRequest } from '../services/geminiService';
import { generateId } from '../services/storageService';
import { Loader2, Sparkles, Upload, MapPin, CheckCircle, FileText, ChevronRight, ChevronDown, User as UserIcon, Shield, GraduationCap, Briefcase, X, ImageIcon } from 'lucide-react';

interface RequestFormProps {
  onSubmit: (req: ServiceRequest, updatedUser: Partial<User>) => void;
  onCancel: () => void;
  currentUser: User;
}

const RequestForm: React.FC<RequestFormProps> = ({ onSubmit, onCancel, currentUser }) => {
  // User Details State
  const [userName, setUserName] = useState(currentUser.name || '');
  const [userRole, setUserRole] = useState<UserRole>(currentUser.role || UserRole.STUDENT);
  const [userCourse, setUserCourse] = useState(currentUser.course || '');
  const [userStaffPosition, setUserStaffPosition] = useState(currentUser.staffPosition || '');

  // Category first approach
  const [category, setCategory] = useState<RequestCategory>(RequestCategory.FACILITIES);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Image State - Now supports multiple images
  const [images, setImages] = useState<string[]>([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAcademic = category === RequestCategory.ACADEMIC;
  const MAX_IMAGES = 5;

  useEffect(() => {
    // If user has default name from email split, encourage them to change it, otherwise keep it
  }, []);

  const handleAnalyze = async () => {
    if (!description.trim()) return;
    setIsAnalyzing(true);
    
    // Call Gemini
    const result = await analyzeServiceRequest(description);
    
    setIsAnalyzing(false);
    if (result) {
      setCategory(result.category);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (files.length > remainingSlots) {
      alert(`You can only upload a maximum of ${MAX_IMAGES} images. You have ${remainingSlots} slots remaining.`);
      // Continue but only take the allowed amount? Or just return. Let's return to be safe.
      return;
    }

    setIsProcessingImage(true);
    let processedCount = 0;
    const newImages: string[] = [];

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) {
        processedCount++;
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 800;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
            newImages.push(compressedDataUrl);
          }
          
          processedCount++;
          if (processedCount === files.length) {
            setImages(prev => [...prev, ...newImages]);
            setIsProcessingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
          }
        };
        img.onerror = () => {
          processedCount++;
          if (processedCount === files.length) setIsProcessingImage(false);
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
         processedCount++;
         if (processedCount === files.length) setIsProcessingImage(false);
      };
      
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessingImage) return;

    // --- COMPREHENSIVE VALIDATION ---
    const errors: string[] = [];

    // 1. User Details Validation
    if (!userName.trim()) errors.push("Full Name is required.");
    if (userRole === UserRole.STUDENT && !userCourse) errors.push("Course is required for Student role.");
    if (userRole === UserRole.STAFF && !userStaffPosition) errors.push("Staff Position is required for Staff role.");

    // 2. Request Details Validation
    if (isAcademic) {
        if (!description.trim()) errors.push("Message/Description is required for academic requests.");
    } else {
        if (!title.trim()) errors.push("Issue Title is required.");
        if (!location.trim()) errors.push("Location is required.");
        if (images.length === 0) errors.push("At least one image attachment is required.");
    }

    if (errors.length > 0) {
        alert("Unable to Submit. Please check the following:\n\n• " + errors.join("\n• "));
        return;
    }

    const finalTitle = isAcademic ? 'Academic Document Request' : title;
    const finalLocation = isAcademic ? 'Registrar/Admin Office' : location;

    const newRequest: ServiceRequest = {
      id: generateId(),
      userId: currentUser.id, 
      userName: userName,
      userRole: userRole,
      title: finalTitle,
      description: description || 'No description provided.', 
      location: finalLocation,
      category,
      status: RequestStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
    };

    // Add optional properties ONLY if they have valid values
    if (userRole === UserRole.STUDENT && userCourse) {
      newRequest.userCourse = userCourse;
    }
    if (userRole === UserRole.STAFF && userStaffPosition) {
      newRequest.userStaffPosition = userStaffPosition;
    }
    
    // Support for multiple images
    if (images.length > 0) {
      newRequest.images = images;
      newRequest.imageUrl = images[0]; // Backward compatibility for legacy code using imageUrl
    }

    if (!isAcademic && isAnalyzing) {
      newRequest.aiAnalysis = 'Pending analysis...';
    }

    // Prepare User Updates
    const updatedUser: Partial<User> = {
      name: userName,
      role: userRole,
    };
    
    if (userRole === UserRole.STUDENT) {
        if (userCourse) updatedUser.course = userCourse;
    } 
    
    if (userRole === UserRole.STAFF) {
        if (userStaffPosition) updatedUser.staffPosition = userStaffPosition;
    }

    onSubmit(newRequest, updatedUser);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 overflow-hidden relative transition-all hover:shadow-2xl hover:shadow-sky-100 mb-20">
      {/* Soft header background */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-sky-50 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="px-5 py-6 md:px-8 md:py-8 relative z-10">
        <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">New Request</h2>
              <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Submit a report or service request</p>
            </div>
            <span className="text-xs font-bold text-sky-600 px-3 py-1 bg-white rounded-full border border-sky-100 flex items-center shadow-sm">
              <span className="w-2 h-2 rounded-full bg-sky-500 mr-2 animate-pulse"></span>
              Draft
            </span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} noValidate className="px-5 pb-6 md:px-8 md:pb-8 space-y-6 md:space-y-8 relative z-10">
        
        {/* SECTION: User Details (Moved from Signup) */}
        <div className="bg-gradient-to-br from-white to-sky-50 p-5 md:p-6 rounded-2xl border border-sky-100 shadow-sm space-y-6">
           <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
             <UserIcon size={14} className="mr-2 text-sky-500" />
             Reporter Details
           </h3>
           
           {/* Full Name */}
           <div>
             <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Full Name <span className="text-rose-500">*</span></label>
             <input
               type="text"
               className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all outline-none bg-white font-medium text-slate-700"
               placeholder="Enter your full name"
               value={userName}
               onChange={(e) => setUserName(e.target.value)}
             />
           </div>

           {/* Role Selection */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Role</label>
               <div className="relative">
                 <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <select
                   value={userRole}
                   onChange={(e) => {
                     setUserRole(e.target.value as UserRole);
                     // Clear dependent fields if role changes
                     if (e.target.value !== UserRole.STUDENT) setUserCourse('');
                     if (e.target.value !== UserRole.STAFF) setUserStaffPosition('');
                   }}
                   className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none bg-white font-medium text-slate-700 appearance-none cursor-pointer"
                 >
                   <option value={UserRole.STUDENT}>Student</option>
                   <option value={UserRole.FACULTY}>Faculty</option>
                   <option value={UserRole.STAFF}>Staff</option>
                 </select>
                 <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
               </div>
             </div>

             {/* Conditional Fields based on Role */}
             {userRole === UserRole.STUDENT && (
               <div className="animate-fadeIn">
                 <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Course <span className="text-rose-500">*</span></label>
                 <div className="relative">
                   <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <select
                     value={userCourse}
                     onChange={(e) => setUserCourse(e.target.value)}
                     className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none bg-white font-medium text-slate-700 appearance-none cursor-pointer"
                   >
                     <option value="" disabled>Select Course</option>
                     <option value="BIT-CPT">BIT-CPT</option>
                     <option value="BSN">BSN</option>
                     <option value="BSED-SS">BSED-SS</option>
                     <option value="BSED-MATH">BSED-MATH</option>
                     <option value="BSBA-HRM">BSBA-HRM</option>
                   </select>
                   <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                 </div>
               </div>
             )}

             {userRole === UserRole.STAFF && (
               <div className="animate-fadeIn">
                 <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Staff Position <span className="text-rose-500">*</span></label>
                 <div className="relative">
                   <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <select
                     value={userStaffPosition}
                     onChange={(e) => setUserStaffPosition(e.target.value)}
                     className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none bg-white font-medium text-slate-700 appearance-none cursor-pointer"
                   >
                     <option value="" disabled>Select Position</option>
                     <option value="SECURITY GUARD">SECURITY GUARD</option>
                     <option value="UTILITY">UTILITY</option>
                   </select>
                   <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                 </div>
               </div>
             )}
           </div>
        </div>

        {/* SECTION: Request Details */}
        
        {/* Category Selection */}
        <div className="bg-white/50 p-5 md:p-6 rounded-2xl border border-slate-100">
          <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">What type of request is this?</label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as RequestCategory)}
              className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 appearance-none bg-white font-semibold text-slate-700 shadow-sm transition-all hover:border-sky-300 cursor-pointer outline-none"
            >
              {Object.values(RequestCategory).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 bg-white pl-2">
              <ChevronDown size={20} strokeWidth={2.5} />
            </div>
          </div>
          {isAcademic && (
             <div className="mt-4 text-sm text-violet-700 bg-violet-50 p-4 rounded-xl flex items-start border border-violet-100">
                <FileText size={18} className="mr-3 mt-0.5 flex-shrink-0 text-violet-500" />
                <span className="font-medium">For academic documents, simply leave a message below describing what you need. An admin will contact you to set an appointment.</span>
             </div>
          )}
        </div>

        {/* Conditional Fields based on Category */}
        {!isAcademic && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Title */}
            <div className="col-span-1">
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Issue Title <span className="text-rose-500">*</span></label>
              <input
                type="text"
                className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all outline-none bg-white font-medium text-slate-700 placeholder:text-slate-400"
                placeholder="Broken Projector..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Location */}
            <div className="col-span-1">
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 flex items-center">
                <MapPin size={16} className="mr-1.5 text-slate-400" />
                Location <span className="text-rose-500 ml-1">*</span>
              </label>
              <input
                type="text"
                className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all outline-none bg-white font-medium text-slate-700 placeholder:text-slate-400"
                placeholder="Room 304..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Description / Message */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-bold text-slate-700 ml-1">
               {isAcademic ? 'Message' : 'Description (Optional)'} {isAcademic && <span className="text-rose-500">*</span>}
            </label>
            {!isAcademic && (
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !description}
                className={`text-xs flex items-center space-x-1 px-3 py-1.5 rounded-full transition-all border ${
                  !description 
                  ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' 
                  : 'bg-sky-50 text-sky-600 border-sky-100 hover:bg-sky-100 hover:shadow-sm'
                }`}
              >
                {isAnalyzing ? <Loader2 size={12} className="animate-spin mr-1" /> : <Sparkles size={12} className="mr-1" />}
                <span className="font-bold">Auto-Categorize with AI</span>
              </button>
            )}
          </div>
          <textarea
            rows={isAcademic ? 6 : 4}
            className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all outline-none resize-none bg-white font-medium text-slate-700 placeholder:text-slate-400 shadow-sm"
            placeholder={isAcademic ? "Hi, I would like to request a copy of my transcript..." : "Please describe the issue in detail (optional)..."}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Image Upload - MULTIPLE SUPPORT (Max 5) */}
        {!isAcademic && (
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 ml-1 flex justify-between">
              <span>Attachment <span className="text-rose-500">*</span></span>
              <span className="text-xs text-slate-400">{images.length}/{MAX_IMAGES} Images</span>
            </label>
            
            <div className="space-y-4">
               {/* Upload Box */}
               {images.length < MAX_IMAGES && (
                 <div 
                   onClick={() => !isProcessingImage && fileInputRef.current?.click()}
                   className={`group border-2 border-dashed ${isProcessingImage ? 'opacity-50 cursor-wait' : 'cursor-pointer'} border-sky-300 bg-sky-50/50 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-500 hover:border-sky-400 hover:bg-sky-50/70 transition-all`}
                 >
                   {isProcessingImage ? (
                     <div className="flex flex-col items-center">
                       <Loader2 size={24} className="animate-spin text-sky-600 mb-2" />
                       <span className="text-sm font-bold text-sky-600">Compressing Images...</span>
                     </div>
                   ) : (
                     <>
                       <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center mb-2 text-sky-600 ring-4 ring-sky-50">
                          <Upload size={18} strokeWidth={3} />
                       </div>
                       <span className="text-sm font-bold text-sky-700">Click to upload photos</span>
                       <span className="text-xs text-slate-400 mt-1 font-medium">Max {MAX_IMAGES} images supported</span>
                     </>
                   )}
                   <input 
                       ref={fileInputRef} 
                       type="file" 
                       multiple
                       accept="image/*" 
                       className="hidden" 
                       onChange={handleImageUpload}
                       disabled={isProcessingImage}
                   />
                 </div>
               )}

               {/* Image Grid */}
               {images.length > 0 && (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 animate-fadeIn">
                    {images.map((img, index) => (
                      <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                        <img src={img} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        <button 
                           type="button"
                           onClick={() => removeImage(index)}
                           className="absolute top-1 right-1 p-1 bg-white/90 rounded-full text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                        >
                           <X size={14} />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 rounded-md font-bold backdrop-blur-sm">
                           #{index + 1}
                        </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isProcessingImage}
            className={`px-8 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-sky-200 transition-all flex items-center space-x-2 active:scale-[0.98] ${isProcessingImage ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isProcessingImage ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
            <span>Submit Request</span>
            {!isProcessingImage && <ChevronRight size={16} strokeWidth={3} />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestForm;
