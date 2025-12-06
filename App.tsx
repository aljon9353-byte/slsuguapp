import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import RequestForm from './components/RequestForm';
import RequestList from './components/RequestList';
import AdminDashboard from './components/AdminDashboard';
import AdminRequestTable from './components/AdminRequestTable';
import AdminUserTable from './components/AdminUserTable';
import { UserRole, ServiceRequest, RequestStatus, User, Comment, Reaction } from './types';
import { getRequests, saveRequest, deleteRequest, getUsers, saveUser, deleteUser, getCurrentUser, setCurrentUser, generateId } from './services/storageService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('user-home');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Load initial data
  useEffect(() => {
    setRequests(getRequests());
    setUsers(getUsers());
    const sessionUser = getCurrentUser();
    if (sessionUser) {
      setUser(sessionUser);
      // If admin, default to dashboard, else user home
      if (sessionUser.role === UserRole.ADMIN) {
        setCurrentView('admin-dashboard');
      }
    }
  }, []);

  const refreshRequests = () => {
    setRequests(getRequests());
  };
  
  const refreshUsers = () => {
    setUsers(getUsers());
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentUser(loggedInUser);
    setCurrentView(loggedInUser.role === UserRole.ADMIN ? 'admin-dashboard' : 'user-home');
  };

  const handleLogout = () => {
    // Refresh users from storage to ensure the Auth component gets the latest data
    refreshUsers(); 
    setUser(null);
    setCurrentUser(null);
    setCurrentView('user-home');
  };

  const handleRegister = (newUser: User) => {
    saveUser(newUser);
    refreshUsers();
  };

  const handleCreateRequest = (newRequest: ServiceRequest, updatedUserDetails: Partial<User>) => {
    // Ensure the request is attached to the current user
    if (user) {
      // 1. Save the Request
      // Note: The newRequest already contains the updated name/role/course etc. from the form
      saveRequest(newRequest);
      refreshRequests();

      // 2. Update the User Profile with new details
      // This ensures the user doesn't have to re-type name/role next time
      const updatedUser = { ...user, ...updatedUserDetails };
      saveUser(updatedUser);
      setUser(updatedUser);
      setCurrentUser(updatedUser);
      refreshUsers();

      setCurrentView('user-home');
    }
  };

  const handleUpdateStatus = (id: string, status: RequestStatus) => {
    const currentRequests = getRequests();
    const req = currentRequests.find(r => r.id === id);
    
    if (req) {
      const updated = { ...req, status, updatedAt: new Date().toISOString() };
      saveRequest(updated);
      setRequests(getRequests());
    }
  };

  const handleAddComment = (requestId: string, text: string, imageUrl?: string) => {
    if (!user) return;

    const currentRequests = getRequests();
    const req = currentRequests.find(r => r.id === requestId);
    
    if (req) {
      const newComment: Comment = {
        id: generateId(),
        author: user.name,
        role: user.role,
        text,
        imageUrl,
        timestamp: new Date().toISOString(),
        reactions: []
      };
      
      const updated = {
        ...req,
        comments: [...req.comments, newComment],
        updatedAt: new Date().toISOString()
      };

      saveRequest(updated);
      setRequests(getRequests());
    }
  };

  const handleToggleReaction = (requestId: string, targetId: string, emoji: string) => {
    if (!user) return;

    const currentRequests = getRequests();
    const req = currentRequests.find(r => r.id === requestId);

    if (req) {
      // Helper function to update a reactions array
      const toggleReactionInList = (currentReactions: Reaction[] = []) => {
        const existingIndex = currentReactions.findIndex(r => r.userId === user.id);
        const newReactions = [...currentReactions];
        
        if (existingIndex >= 0) {
          if (currentReactions[existingIndex].emoji === emoji) {
            // Remove if clicking same emoji
            newReactions.splice(existingIndex, 1);
          } else {
            // Update if clicking different emoji
            newReactions[existingIndex] = { ...newReactions[existingIndex], emoji };
          }
        } else {
          // Add new
          newReactions.push({ emoji, userId: user.id, userName: user.name });
        }
        return newReactions;
      };

      let updatedRequest = { ...req };

      // Case 1: Reacting to the Main Request Description
      if (requestId === targetId) {
        updatedRequest.reactions = toggleReactionInList(req.reactions);
      } 
      // Case 2: Reacting to a Comment
      else {
        updatedRequest.comments = req.comments.map(comment => {
          if (comment.id === targetId) {
            return { ...comment, reactions: toggleReactionInList(comment.reactions) };
          }
          return comment;
        });
      }

      saveRequest(updatedRequest);
      setRequests(getRequests());
    }
  };

  const handleDeleteRequest = (id: string) => {
    deleteRequest(id);
    refreshRequests();
  };

  const handleRateRequest = (id: string, rating: number, feedback: string) => {
    const currentRequests = getRequests();
    const req = currentRequests.find(r => r.id === id);
    if (req) {
      const updated = { ...req, rating, feedback, updatedAt: new Date().toISOString() };
      saveRequest(updated);
      refreshRequests();
    }
  };

  // User Management Handlers
  const handleToggleVerify = (id: string) => {
    const targetUser = users.find(u => u.id === id);
    if (targetUser) {
      const updated = { ...targetUser, isVerified: !targetUser.isVerified };
      saveUser(updated);
      refreshUsers();
    }
  };

  const handleChangeRole = (id: string, role: UserRole) => {
    const targetUser = users.find(u => u.id === id);
    if (targetUser) {
      const updated = { ...targetUser, role };
      saveUser(updated);
      refreshUsers();
    }
  };

  const handleDeleteUser = (id: string) => {
    if (user && user.id === id) {
      alert("You cannot delete your own account.");
      return;
    }
    deleteUser(id);
    refreshUsers();
  };

  if (!user) {
    return <Auth onLogin={handleLogin} users={users} onRegister={handleRegister} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'user-home':
        const userRequests = requests.filter(r => r.userId === user.id); 
        return <RequestList 
          requests={userRequests} 
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
      
      case 'admin-users':
        return <AdminUserTable 
          users={users} 
          currentUser={user}
          onToggleVerify={handleToggleVerify} 
          onChangeRole={handleChangeRole} 
          onDelete={handleDeleteUser}
        />;
        
      default:
        return <div>Not found</div>;
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