import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole } from '../types';

interface AppContextType {
  user: UserProfile | null;
  login: (profile: UserProfile) => void;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'uberes_local_user';

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    if (raw) {
      try {
        const localUser = JSON.parse(raw);
        setUser(localUser);
      } catch (e) {
        localStorage.removeItem(LOCAL_USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (profile: UserProfile) => {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
    setUser(profile);
  };

  const logout = () => {
    localStorage.removeItem(LOCAL_USER_KEY);
    setUser(null);
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AppContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
