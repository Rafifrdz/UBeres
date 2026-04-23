export type UserRole = 'client' | 'worker';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  rating?: number;
  totalRatings?: number;
  bio?: string;
  portfolio?: string[];
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
  createdAt: any;
  updatedAt: any;
}

export interface Bid {
  id: string;
  jobId: string;
  workerId: string;
  workerName: string;
  workerRating?: number;
  price: number;
  deliveryDays: number;
  pitch: string;
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
