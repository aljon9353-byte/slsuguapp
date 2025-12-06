
export enum UserRole {
  STUDENT = 'STUDENT',
  FACULTY = 'FACULTY',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

export enum RequestStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  REJECTED = 'Rejected'
}

export enum RequestCategory {
  FACILITIES = 'Facilities', // Broken chairs, lights, windows
  SANITATION = 'Sanitation', // Cleaning
  ACADEMIC = 'Academic Docs', // Document requests
  OTHER = 'Other'
}

export interface Reaction {
  emoji: string;
  userId: string;
  userName: string;
}

export interface Comment {
  id: string;
  author: string;
  role: UserRole;
  text: string;
  timestamp: string;
  imageUrl?: string; // Admin can send images
  reactions?: Reaction[]; // Facebook-style reactions
}

export interface ServiceRequest {
  id: string;
  userId: string;
  userName: string;
  userRole?: UserRole;      // Added to track role at time of request
  userCourse?: string;      // Added for Students
  userStaffPosition?: string; // Added for Staff
  title: string;
  description: string;
  category: RequestCategory;
  location: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string; // Base64 or URL
  rating?: number; // 1-5
  feedback?: string;
  comments: Comment[];
  aiAnalysis?: string; // Short AI summary
  assignedTo?: string; // Department or Staff Name
  reactions?: Reaction[]; // Added to allow reacting to the main request
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  department?: string;
  avatarUrl?: string;
  password?: string; // Added for auth
  course?: string; // Added for Students (e.g., BIT-CPT, BSN)
  staffPosition?: string; // Added for Staff (e.g., SECURITY GUARD, UTILITY)
}

// Stats for Admin Dashboard
export interface DashboardStats {
  totalRequests: number;
  pending: number;
  inProgress: number;
  completed: number;
  avgRating: number;
}
