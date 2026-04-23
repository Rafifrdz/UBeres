import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Home, PlusSquare, User, Loader2 } from 'lucide-react';
import Onboarding from './screens/Onboarding';
import Auth from './screens/Auth';
import Feed from './screens/Feed';
import PostJob from './screens/PostJob';
import JobDetail from './screens/JobDetail';
import Chat from './screens/Chat';
import Profile from './screens/Profile';

type Screen = 'onboarding' | 'auth' | 'feed' | 'post' | 'detail' | 'chat' | 'profile';
const LOCAL_USER_KEY = 'uberes_local_user';

function saveLocalUser(profile: UserProfile) {
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
}

function loadLocalUser(): UserProfile | null {
  const raw = localStorage.getItem(LOCAL_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    localStorage.removeItem(LOCAL_USER_KEY);
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    const localUser = loadLocalUser();
    if (localUser) {
      setUser(localUser);
      setCurrentScreen('feed');
    } else {
      setCurrentScreen('onboarding');
    }
    setLoading(false);
  }, []);

  const handleLogin = async () => {
    try {
      const profile: UserProfile = {
        uid: `local-${crypto.randomUUID()}`,
        displayName: 'Student UB',
        email: '',
        photoURL: '',
        role: 'client',
        createdAt: new Date(),
      };

      saveLocalUser(profile);
      setUser(profile);
      setCurrentScreen('feed');
    } catch (error: any) {
      console.error('Login failed', error);
      alert(`Login Gagal: ${error.message}`);
    }
  };

  const handleCompleteOnboarding = async (role: UserRole) => {
    try {
      const profile: UserProfile = {
        uid: `local-${crypto.randomUUID()}`,
        displayName: 'Student UB',
        email: '',
        photoURL: '',
        role,
        createdAt: new Date(),
      };

      saveLocalUser(profile);
      setUser(profile);
      setCurrentScreen('feed');
    } catch (error: any) {
      console.error('Onboarding failed', error);
      alert(`Gagal menyimpan data: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem(LOCAL_USER_KEY);
    setUser(null);
    setSelectedJobId(null);
    setCurrentScreen('onboarding');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const navigateToJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setCurrentScreen('detail');
  };

  const navigateToChat = (jobId: string) => {
    setSelectedJobId(jobId);
    setCurrentScreen('chat');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col relative overflow-hidden shadow-xl border-x border-gray-200">
      <AnimatePresence mode="wait">
        {currentScreen === 'onboarding' && (
          <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <Onboarding onLogin={handleLogin} onComplete={handleCompleteOnboarding} />
          </motion.div>
        )}
        {currentScreen === 'auth' && (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <Auth onLogin={handleLogin} />
          </motion.div>
        )}
        {currentScreen === 'feed' && user && (
          <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <Feed user={user} onJobClick={navigateToJob} />
          </motion.div>
        )}
        {currentScreen === 'post' && user && (
          <motion.div key="post" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <PostJob user={user} onBack={() => setCurrentScreen('feed')} onSuccess={() => setCurrentScreen('feed')} />
          </motion.div>
        )}
        {currentScreen === 'detail' && selectedJobId && user && (
          <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <JobDetail 
              jobId={selectedJobId} 
              user={user} 
              onBack={() => setCurrentScreen('feed')} 
              onChat={() => setCurrentScreen('chat')}
            />
          </motion.div>
        )}
        {currentScreen === 'chat' && selectedJobId && user && (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <Chat 
              jobId={selectedJobId} 
              user={user} 
              onBack={() => setCurrentScreen('detail')} 
            />
          </motion.div>
        )}
        {currentScreen === 'profile' && user && (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <Profile user={user} onLogout={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation for Logged-in Users */}
      {user && !['onboarding', 'auth'].includes(currentScreen) && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-14 bg-white border-t border-gray-100 flex items-center justify-around px-4 z-50 rounded-t-xl shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
          <button onClick={() => setCurrentScreen('feed')} className={`p-1.5 rounded-lg transition-colors ${currentScreen === 'feed' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}>
            <Home className="w-5 h-5" />
          </button>
          {user.role === 'client' && (
            <button onClick={() => setCurrentScreen('post')} className={`p-1.5 rounded-lg transition-colors ${currentScreen === 'post' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}>
              <PlusSquare className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setCurrentScreen('profile')} className={`p-1.5 rounded-lg transition-colors ${currentScreen === 'profile' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}>
            <User className="w-5 h-5" />
          </button>
        </nav>
      )}
    </div>
  );
}
