import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Home, PlusSquare, User, Loader2, MessageCircle, FileText, ChevronLeft, ListChecks } from 'lucide-react';
import Onboarding from './screens/Onboarding';
import Auth from './screens/Auth';
import Feed from './screens/Feed';
import PostJob from './screens/PostJob';
import JobDetail from './screens/JobDetail';
import Chat from './screens/Chat';
import Profile from './screens/Profile';
import MyJobs from './screens/MyJobs';
import Settings from './screens/Settings';
import Notifications from './screens/Notifications';
import MyBids from './screens/MyBids';
import ChatList from './screens/ChatList';
import ChatDetail from './screens/ChatDetail';

type Screen = 'onboarding' | 'auth' | 'feed' | 'post' | 'detail' | 'chat' | 'profile' | 'my-jobs' | 'settings' | 'notifications' | 'my-bids' | 'chat-list' | 'chat-detail';
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
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);

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
        displayName: 'Student UB (Guest)',
        email: '',
        photoURL: '',
        role: pendingRole || 'client',
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
    setPendingRole(role);
    setCurrentScreen('auth');
  };

  const handleLogout = async () => {
    localStorage.removeItem(LOCAL_USER_KEY);
    setUser(null);
    setSelectedJobId(null);
    setPendingRole(null);
    setCurrentScreen('onboarding');
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
      const response = await fetch(`${apiBaseUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          credential: credentialResponse.credential,
          role: pendingRole || 'client'
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal verifikasi dengan server');
      }

      const { user: profile } = await response.json();
      saveLocalUser(profile);
      setUser(profile);
      setCurrentScreen('feed');
    } catch (error: any) {
      console.error('Google Auth Failed', error);
      alert(`Login Google Gagal: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col relative overflow-hidden shadow-xl border-x border-gray-200 transition-colors duration-300">
      <AnimatePresence mode="wait">
        {currentScreen === 'onboarding' && (
          <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <Onboarding onLogin={() => setCurrentScreen('auth')} onComplete={handleCompleteOnboarding} />
          </motion.div>
        )}
        {currentScreen === 'auth' && (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <Auth onLogin={handleLogin} onGoogleSuccess={handleGoogleSuccess} />
          </motion.div>
        )}
        {currentScreen === 'feed' && user && (
          <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <Feed 
              user={user} 
              onJobClick={navigateToJob} 
              onNotifications={() => setCurrentScreen('notifications')}
            />
          </motion.div>
        )}
        {currentScreen === 'post' && user && user.role === 'client' && (
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
        {currentScreen === 'chat-list' && (
          <motion.div key="chat-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <ChatList onSelectChat={(id) => {
              setSelectedChatId(id);
              setCurrentScreen('chat-detail');
            }} />
          </motion.div>
        )}
        {currentScreen === 'chat-detail' && selectedChatId && (
          <motion.div key="chat-detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <ChatDetail 
              chatId={selectedChatId} 
              onBack={() => setCurrentScreen('chat-list')} 
            />
          </motion.div>
        )}
        {currentScreen === 'profile' && user && (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <Profile 
              user={user} 
              onLogout={handleLogout} 
              onSettings={() => setCurrentScreen('settings')} 
              onViewMyJobs={() => setCurrentScreen('my-jobs')}
            />
          </motion.div>
        )}
        {currentScreen === 'settings' && user && (
          <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <Settings onBack={() => setCurrentScreen('profile')} />
          </motion.div>
        )}
        {currentScreen === 'my-jobs' && user && (
          <motion.div key="my-jobs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <MyJobs user={user} onJobClick={navigateToJob} />
          </motion.div>
        )}
        {currentScreen === 'notifications' && user && (
          <motion.div key="notifications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <Notifications onBack={() => setCurrentScreen('feed')} onAction={navigateToJob} />
          </motion.div>
        )}
        {currentScreen === 'my-bids' && user && (
          <motion.div key="my-bids" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <MyBids user={user} onJobClick={navigateToJob} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation for Logged-in Users */}
      {user && !['onboarding', 'auth', 'chat-detail', 'chat'].includes(currentScreen) && (
        <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-xl border-t border-gray-100 px-2 py-3 flex items-center justify-around z-50 rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
          <button 
            onClick={() => setCurrentScreen('feed')}
            className={`flex flex-col items-center gap-1 transition-all ${currentScreen === 'feed' ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <div className={`p-2 rounded-2xl transition-all ${currentScreen === 'feed' ? 'bg-blue-50 shadow-sm' : ''}`}>
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">Feed</span>
          </button>
          
          {user.role === 'client' ? (
            <button 
              onClick={() => setCurrentScreen('post')}
              className={`flex flex-col items-center gap-1 transition-all ${currentScreen === 'post' ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className={`p-2 rounded-2xl transition-all ${currentScreen === 'post' ? 'bg-blue-50 shadow-sm' : ''}`}>
                <PlusSquare className="w-5 h-5" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest">Post</span>
            </button>
          ) : (
            <button 
              onClick={() => setCurrentScreen('my-bids')}
              className={`flex flex-col items-center gap-1 transition-all ${currentScreen === 'my-bids' ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className={`p-2 rounded-2xl transition-all ${currentScreen === 'my-bids' ? 'bg-blue-50 shadow-sm' : ''}`}>
                <ListChecks className="w-5 h-5" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest">Bids</span>
            </button>
          )}

          <button 
            onClick={() => setCurrentScreen('chat-list')}
            className={`flex flex-col items-center gap-1 transition-all ${currentScreen === 'chat-list' ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <div className={`p-2 rounded-2xl transition-all ${currentScreen === 'chat-list' ? 'bg-blue-50 shadow-sm' : ''}`}>
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">Chat</span>
          </button>

          {user.role === 'client' && (
            <button 
              onClick={() => setCurrentScreen('my-jobs')}
              className={`flex flex-col items-center gap-1 transition-all ${currentScreen === 'my-jobs' ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className={`p-2 rounded-2xl transition-all ${currentScreen === 'my-jobs' ? 'bg-blue-50 shadow-sm' : ''}`}>
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest">Tugas</span>
            </button>
          )}

          <button 
            onClick={() => setCurrentScreen('profile')}
            className={`flex flex-col items-center gap-1 transition-all ${currentScreen === 'profile' ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <div className={`p-2 rounded-2xl transition-all ${currentScreen === 'profile' ? 'bg-blue-50 shadow-sm' : ''}`}>
              <User className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">Profil</span>
          </button>
        </footer>
      )}
    </div>
  );
}
