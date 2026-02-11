import { ServiceRequest, User, UserRole } from '../types';
import { db } from './firebase';
import { ref, onValue, set, update, remove, off, get } from 'firebase/database';

const REQUESTS_KEY = 'slsu_gu_app_requests_v3'; 
const USERS_KEY = 'slsu_gu_app_users_v2';
const SESSION_KEY = 'slsu_gu_app_session_v2';

const LOCAL_UPDATE_EVENT = 'slsu-local-update';

export const triggerLocalUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(LOCAL_UPDATE_EVENT));
  }
};

const defaultAdmin: User = {
  id: 'admin1',
  name: 'Aljon Admin',
  email: 'aljon9353@gmail.com',
  role: UserRole.ADMIN,
  isVerified: true,
  password: 'admin123'
};

const isFirebaseReady = () => !!db;

const sanitizeForFirebase = (obj: any): any => {
  if (obj === undefined || obj === null) return null;
  // Deep clone and remove undefined to prevent Firebase errors
  return JSON.parse(JSON.stringify(obj, (key, value) => value === undefined ? null : value));
};

export const subscribeToRequests = (callback: (requests: ServiceRequest[]) => void) => {
  if (isFirebaseReady()) {
    const requestsRef = ref(db, 'requests');
    const unsubscribe = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      
      const loadedRequests: ServiceRequest[] = [];
      if (data) {
        Object.keys(data).forEach(key => {
          if (data[key]) {
            loadedRequests.push({ ...data[key], id: key });
          }
        });
      } else {
        // Fallback to local if Firebase is empty (first run or offline)
        const local = getRequestsLocal();
        if (local.length > 0) {
          // Attempt to sync local to Firebase if Firebase is empty
          local.forEach(req => saveRequest(req));
          loadedRequests.push(...local);
        }
      }

      loadedRequests.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      callback(loadedRequests);
      
      // Update local cache
      localStorage.setItem(REQUESTS_KEY, JSON.stringify(loadedRequests));
    });
    return () => unsubscribe();
  } else {
    const localHandler = () => callback(getRequestsLocal());
    localHandler();
    window.addEventListener(LOCAL_UPDATE_EVENT, localHandler);
    return () => window.removeEventListener(LOCAL_UPDATE_EVENT, localHandler);
  }
};

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  if (isFirebaseReady()) {
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const loadedUsers: User[] = [];
      
      if (data) {
        Object.keys(data).forEach(key => {
          if (data[key]) {
            loadedUsers.push({ ...data[key], id: key });
          }
        });
      } else {
        const local = getUsersLocal();
        if (local.length > 0) {
          local.forEach(u => saveUser(u));
          loadedUsers.push(...local);
        }
      }
      
      // Ensure Admin always exists
      const adminInLoaded = loadedUsers.find(u => u && u.email && u.email.toLowerCase() === defaultAdmin.email.toLowerCase());
      if (!adminInLoaded) {
         saveUser(defaultAdmin); 
         loadedUsers.push(defaultAdmin);
      }
      
      callback(loadedUsers);
      localStorage.setItem(USERS_KEY, JSON.stringify(loadedUsers));
    });
    return () => unsubscribe();
  } else {
    const localHandler = () => callback(getUsersLocal());
    localHandler();
    window.addEventListener(LOCAL_UPDATE_EVENT, localHandler);
    return () => window.removeEventListener(LOCAL_UPDATE_EVENT, localHandler);
  }
};

const getRequestsLocal = (): ServiceRequest[] => {
  try {
    const stored = localStorage.getItem(REQUESTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) { return []; }
};

const getUsersLocal = (): User[] => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    let users = stored ? JSON.parse(stored) : [];
    return Array.isArray(users) ? users : [defaultAdmin];
  } catch (e) { return [defaultAdmin]; }
};

export const saveRequest = async (request: ServiceRequest): Promise<void> => {
  if (!request || !request.id) return Promise.resolve();
  // Always update local storage first for immediate UI response
  const localRequests = getRequestsLocal();
  const idx = localRequests.findIndex(r => r.id === request.id);
  if (idx >= 0) localRequests[idx] = request;
  else localRequests.unshift(request);
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(localRequests));
  triggerLocalUpdate();

  if (isFirebaseReady()) {
    try {
      return set(ref(db, 'requests/' + request.id), sanitizeForFirebase(request));
    } catch (err) {
      console.error("Firebase set failed:", err);
    }
  }
  return Promise.resolve();
};

export const deleteRequest = (id: string): void => {
  if (!id) return;
  const requests = getRequestsLocal();
  const req = requests.find(r => r.id === id);
  if (req) {
    req.isArchived = true;
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
    triggerLocalUpdate();
    if (isFirebaseReady()) {
      update(ref(db, 'requests/' + id), { isArchived: true });
    }
  }
};

export const restoreRequest = (id: string): void => {
  if (!id) return;
  const requests = getRequestsLocal();
  const req = requests.find(r => r.id === id);
  if (req) {
    req.isArchived = false;
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
    triggerLocalUpdate();
    if (isFirebaseReady()) {
      update(ref(db, 'requests/' + id), { isArchived: false });
    }
  }
};

export const permanentDeleteRequest = (id: string): void => {
  if (!id) return;
  const requests = getRequestsLocal().filter(r => r.id !== id);
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  triggerLocalUpdate();
  if (isFirebaseReady()) {
    remove(ref(db, 'requests/' + id));
  }
};

export const saveUser = async (user: User): Promise<void> => {
  if (!user || !user.id) return Promise.resolve();
  const users = getUsersLocal();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) users[index] = user;
  else users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  triggerLocalUpdate();

  if (isFirebaseReady()) {
    try {
      return set(ref(db, 'users/' + user.id), sanitizeForFirebase(user));
    } catch (err) {
      console.error("Firebase user save failed:", err);
    }
  }
  return Promise.resolve();
};

export const deleteUser = (id: string): void => {
  if (!id) return;
  const users = getUsersLocal().filter(u => u.id !== id);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  triggerLocalUpdate();
  if (isFirebaseReady()) {
    remove(ref(db, 'users/' + id));
  }
};

export const getCurrentUser = (): User | null => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored || stored === 'undefined' || stored === 'null') return null;
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === 'object' && parsed.id && parsed.email) {
      return parsed as User;
    }
    return null;
  } catch (e) { 
    return null; 
  }
};

export const setCurrentUser = (user: User | null): void => {
  if (user && user.id) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
};

export const generateId = () => {
   return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const getRequests = getRequestsLocal;
export const getUsers = getUsersLocal;