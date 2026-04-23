import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { auth } from './firebase';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleFirestoreError(error: any, operationType: any, path: string | null = null): never {
  const authInfo = {
    userId: auth.currentUser?.uid || 'anonymous',
    email: auth.currentUser?.email || '',
    emailVerified: auth.currentUser?.emailVerified || false,
    isAnonymous: auth.currentUser?.isAnonymous || true,
    providerInfo: auth.currentUser?.providerData.map(p => ({
      providerId: p.providerId,
      displayName: p.displayName || '',
      email: p.email || '',
    })) || [],
  };

  const errorInfo = {
    error: error.message || 'Unknown error',
    operationType,
    path,
    authInfo,
  };

  throw new Error(JSON.stringify(errorInfo));
}
