export type UserRole = 'client' | 'worker';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  rating?: number;
  totalRatings?: number;
  balance?: number;
  escrow?: number;
  bio?: string;
  skills?: string[];
  portfolio?: any[];
  transactions?: any[];
  createdAt: any;
}

export type JobStatus = 'open' | 'assigned' | 'paid' | 'working' | 'submitting' | 'completed';

export interface Job {
  id: string;
  title: string;
  description: string;
  budget?: number;
  deadline: any;
  category: string;
  clientId: string;
  clientName?: string;
  clientPhotoURL?: string;
  workerId?: string;
  status: JobStatus;
  bidCount: number;
  isFixedPrice?: boolean;
  isAnonymous?: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface Bid {
  id: string;
  jobId: string;
  jobTitle?: string;
  clientName?: string;
  workerId: string;
  workerName: string;
  workerRating?: number;
  price: number;
  deliveryDays: number;
  pitch: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}

export interface ChatMessage {
  id: string;
  jobId: string;
  senderId: string;
  text: string;
  fileURL?: string;
  createdAt: any;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}
