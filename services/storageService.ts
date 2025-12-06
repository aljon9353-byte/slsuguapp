import { ServiceRequest, User, UserRole, RequestStatus, RequestCategory } from '../types';

// STORAGE KEYS
// CRITICAL: These keys are LOCKED. Do not change them, or previous data will be lost.
const REQUESTS_KEY = 'slsu_gu_app_requests_v3'; 
const USERS_KEY = 'slsu_gu_app_users_v2';
const SESSION_KEY = 'slsu_gu_app_session_v2';

// Default Admin User (Created ONLY if the database is completely empty)
const defaultAdmin: User = {
  id: 'admin1',
  name: 'Aljon Admin',
  email: 'aljon9353@gmail.com',
  role: UserRole.ADMIN,
  isVerified: true,
  password: 'admin123'
};

export const getRequests = (): ServiceRequest[] => {
  try {
    const stored = localStorage.getItem(REQUESTS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Extra validation to ensure we return an array
      if (Array.isArray(parsed)) {
        console.log(`[Storage] Successfully loaded ${parsed.length} requests.`);
        return parsed;
      }
    }
  } catch (e) {
    console.error("[Storage] Failed to load requests:", e);
  }
  
  // Return empty array if nothing exists, but DO NOT overwrite storage yet.
  // This protects against overwriting data if a read error occurred.
  console.log("[Storage] No requests found or initialized.");
  return [];
};

export const saveRequest = (request: ServiceRequest): void => {
  try {
    const requests = getRequests(); // Load current data first
    const existingIndex = requests.findIndex(r => r.id === request.id);
    
    if (existingIndex >= 0) {
      // Update existing
      requests[existingIndex] = request;
    } else {
      // Add new (to top of list)
      requests.unshift(request);
    }
    
    // Commit back to storage
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  } catch (error) {
    console.error("Storage Error:", error);
    // @ts-ignore
    if (error && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      alert("Device storage limit reached! The image might be too large, or you have too many requests saved. Please delete old requests or use a smaller image.");
    } else {
      console.warn("Failed to save request:", error);
    }
  }
};

export const deleteRequest = (id: string): void => {
  try {
    const requests = getRequests();
    const filtered = requests.filter(r => r.id !== id);
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error("Failed to delete request", e);
  }
};

// User Methods
export const getUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`[Storage] Successfully loaded ${parsed.length} users.`);
        return parsed;
      }
    }
  } catch (e) {
    console.error("[Storage] Failed to load users:", e);
  }
  
  // Only initialize with Default Admin if storage is genuinely empty (null)
  if (localStorage.getItem(USERS_KEY) === null) {
    console.log("[Storage] Database empty. Initializing default Admin.");
    const initialUsers = [defaultAdmin];
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  }
  
  // Fallback if data exists but is corrupt/empty, return admin in memory but don't force save
  return [defaultAdmin];
};

export const saveUser = (user: User): void => {
  try {
    const users = getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("User Save Error:", error);
    alert("Failed to save user data. Storage limit might be reached.");
  }
};

export const deleteUser = (id: string): void => {
  try {
    const users = getUsers();
    const filtered = users.filter(u => u.id !== id);
    localStorage.setItem(USERS_KEY, JSON.stringify(filtered));
  } catch (e) {
     console.error("Failed to delete user", e);
  }
};

// Session Methods
export const getCurrentUser = (): User | null => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
};

export const setCurrentUser = (user: User | null): void => {
  try {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch (e) {
    console.error("Session Save Error", e);
  }
};

export const generateId = () => {
   return Date.now().toString(36) + Math.random().toString(36).substr(2);
};