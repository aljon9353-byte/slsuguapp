
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import RequestForm from './components/RequestForm';
import RequestList from './components/RequestList';
import AdminDashboard from './components/AdminDashboard';
import AdminRequestTable from './components/AdminRequestTable';
import AdminUserTable from './components/AdminUserTable';
import AdminHistory from './components/AdminHistory';
import AdminAbout from './components/AdminAbout';
import { UserRole, ServiceRequest, RequestStatus, User, Comment, Reaction } from './types';
import { 
  saveRequest, deleteRequest, restoreRequest, permanentDeleteRequest, 
  saveUser, deleteUser, getCurrentUser, setCurrentUser, generateId,
  subscribeToRequests, subscribeToUsers 
} from './services/storageService';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('user-home');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [showFailsafeButton, setShowFailsafeButton] = useState(false);

  // INITIALIZATION & SUBSCRIPTIONS
  useEffect(() => {
    // 1. Load Session Robustly
    try {
      const sessionUser = getCurrentUser();
      // Ensure session user has basic required properties
      if (sessionUser && sessionUser.id && sessionUser.email) {
        setUser(sessionUser);
        if (sessionUser.role === UserRole.ADMIN) {
          setCurrentView('admin-dashboard');
        }
      } else {
        // Clear invalid session
        setCurrentUser(null);
      }
    } catch (e) {
      console.error("Failed to load session:", e);
      setCurrentUser(null);
    }

    // 2. Subscribe to Real-time Data
    let requestsLoaded = false;
    let usersLoaded = false;

    const forceTimer = setTimeout(() => {
      setShowFailsafeButton(true);
    }, 4000);

    const safetyTimer = setTimeout(() => {
      if (isDataLoading) {
        setIsDataLoading(false);
      }
    }, 8000);

    const checkLoading = () => {
      if (requestsLoaded && usersLoaded) {
        setIsDataLoading(false);
        clearTimeout(safetyTimer);
        clearTimeout(forceTimer);
      }
    };

    const unsubscribeRequests = subscribeToRequests((data) => {
      // Ensure data is an array
      setRequests(Array.isArray(data) ? data : []);
      requestsLoaded = true;
      checkLoading();
    });

    const unsubscribeUsers = subscribeToUsers((data) => {
      // Ensure data is an array
      setUsers(Array.isArray(data) ? data : []);
      usersLoaded = true;
      checkLoading();
    });

    return () => {
      clearTimeout(safetyTimer);
      clearTimeout(forceTimer);
      if (typeof unsubscribeRequests === 'function') unsubscribeRequests();
      if (typeof unsubscribeUsers === 'function') unsubscribeUsers();
    };
  }, []);

  const handleLogin = (loggedInUser: User) => {
    if (!loggedInUser || !loggedInUser.id) return;
    setUser(loggedInUser);
    setCurrentUser(loggedInUser);
    setCurrentView(loggedInUser.role === UserRole.ADMIN ? 'admin-dashboard' : 'user-home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentUser(null);
    setCurrentView('user-home');
  };

  const handleRegister = (newUser: User) => {
    if (newUser && newUser.id) saveUser(newUser);
  };

  const handleCreateRequest = async (newRequest: ServiceRequest, updatedUserDetails: Partial<User>) => {
    if (user && user.id) {
      try {
        await saveRequest(newRequest);
        const updatedUser = { ...user, ...updatedUserDetails };
        await saveUser(updatedUser);
        setUser(updatedUser);
        setCurrentUser(updatedUser);
        setCurrentView('user-home');
      } catch (error: any) {
        console.error("Failed to submit request:", error);
        alert("Unable to submit request. Please check your internet connection.");
      }
    }
  };

  const handleUpdateStatus = (id: string, status: RequestStatus) => {
    const req = requests.find(r => r.id === id);
    if (req) {
      const updated = { ...req, status, updatedAt: new Date().toISOString() };
      saveRequest(updated);
    }
  };

  const handleAddComment = (requestId: string, text: string, imageUrl?: string) => {
    if (!user || !user.id) return;
    const req = requests.find(r => r.id === requestId);
    if (req) {
      const newComment: Comment = {
        id: generateId(),
        author: user.name || 'Anonymous',
        role: user.role,
        text: text || '',
        imageUrl,
        timestamp: new Date().toISOString(),
        reactions: []
      };
      saveRequest({
        ...req,
        comments: [...(req.comments || []), newComment],
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleToggleReaction = (requestId: string, targetId: string, emoji: string) => {
    if (!user || !user.id) return;
    const req = requests.find(r => r.id === requestId);
    if (req) {
      const toggleReactionInList = (currentReactions: Reaction[] = []) => {
        const existingIndex = currentReactions.findIndex(r => r.userId === user.id);
        const newReactions = [...currentReactions];
        if (existingIndex >= 0) {
          if (currentReactions[existingIndex].emoji === emoji) newReactions.splice(existingIndex, 1);
          else newReactions[existingIndex] = { ...newReactions[existingIndex], emoji };
        } else {
          newReactions.push({ emoji, userId: user.id, userName: user.name });
        }
        return newReactions;
      };

      let updatedRequest = { ...req };
      if (requestId === targetId) {
        updatedRequest.reactions = toggleReactionInList(req.reactions);
      } else {
        updatedRequest.comments = (req.comments || []).map(comment => {
          if (comment.id === targetId) return { ...comment, reactions: toggleReactionInList(comment.reactions) };
          return comment;
        });
      }
      saveRequest(updatedRequest);
    }
  };

  const handleDeleteRequest = (id: string) => deleteRequest(id);
  const handleRestoreRequest = (id: string) => restoreRequest(id);
  const handlePermanentDelete = (id: string) => permanentDeleteRequest(id);

  const handleRateRequest = (id: string, rating: number, feedback: string) => {
    const req = requests.find(r => r.id === id);
    if (req) saveRequest({ ...req, rating, feedback, updatedAt: new Date().toISOString() });
  };

  const handleToggleVerify = (id: string) => {
    const targetUser = users.find(u => u.id === id);
    if (targetUser) saveUser({ ...targetUser, isVerified: !targetUser.isVerified });
  };

  const handleDeleteUser = (id: string) => {
    if (user && user.id === id) return alert("You cannot delete your own account.");
    deleteUser(id);
  };

  if (isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center p-6 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-sky-100 border border-slate-100 mb-6 animate-bounce">
             <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-sky-500 to-blue-600">SL</span>
          </div>
          <Loader2 className="animate-spin text-sky-500 mb-2" size={32} />
          <p className="text-slate-500 font-medium animate-pulse">Connecting to SLSU Cloud...</p>
          
          {showFailsafeButton && (
            <button 
              onClick={() => setIsDataLoading(false)}
              className="mt-8 text-xs font-bold text-sky-600 bg-white px-4 py-2 rounded-full border border-sky-100 hover:bg-sky-50 transition-colors"
            >
              Skip Loading & Continue
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={handleLogin} users={users} onRegister={handleRegister} />;
  }

  const renderContent = () => {
    try {
      switch (currentView) {
        case 'user-home':
          return <RequestList 
            requests={requests.filter(r => r.userId === user.id && !r.isArchived)} 
            onRate={handleRateRequest} 
            onAddComment={handleAddComment} 
            onReact={handleToggleReaction}
          />;
        case 'user-create':
          return <RequestForm onSubmit={handleCreateRequest} onCancel={() => setCurrentView('user-home')} currentUser={user} />;
        case 'admin-dashboard':
          return <AdminDashboard requests={requests} />;
        case 'admin-requests':
          return <AdminRequestTable 
            requests={requests} 
            onUpdateStatus={handleUpdateStatus} 
            onDelete={handleDeleteRequest}
            onAddComment={handleAddComment}
            onReact={handleToggleReaction}
          />;
        case 'admin-history':
          return <AdminHistory requests={requests} onRestore={handleRestoreRequest} onPermanentDelete={handlePermanentDelete} />
        case 'admin-users':
          return <AdminUserTable users={users} currentUser={user} onToggleVerify={handleToggleVerify} onDelete={handleDeleteUser} />;
        case 'admin-about':
        case 'user-about':
          return <AdminAbout />;
        default:
          return <div className="p-8 text-center text-slate-500 font-medium">View not found</div>;
      }
    } catch (e) {
      console.error("View render error:", e);
      return <div className="p-12 text-center text-rose-500 font-bold">Error rendering this page. Please try another menu.</div>;
    }
  };

  return (
    <Layout 
      user={user} 
      currentView={currentView} 
      onNavigate={setCurrentView}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
