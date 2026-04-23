import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleApiError(error: unknown, context: string): never {
  const message = error instanceof Error ? error.message : 'Unknown error';
  throw new Error(`${context}: ${message}`);
}
