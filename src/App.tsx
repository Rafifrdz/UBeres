import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile, UserRole } from './types';
import { testConnection } from './lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Home, PlusSquare, MessageCircle, User, Loader2 } from 'lucide-react';
import Onboarding from './screens/Onboarding';
import Auth from './screens/Auth';
import Feed from './screens/Feed';
import PostJob from './screens/PostJob';
import JobDetail from './screens/JobDetail';
import Chat from './screens/Chat';
import Profile from './screens/Profile';

type Screen = 'onboarding' | 'auth' | 'feed' | 'post' | 'detail' | 'chat' | 'profile';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as UserProfile);
            if (currentScreen === 'onboarding' || currentScreen === 'auth') {
              setCurrentScreen('feed');
            }
          } else {
            setCurrentScreen('onboarding');
          }
        } else {
          setUser(null);
          if (currentScreen !== 'onboarding') {
            setCurrentScreen('onboarding');
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Fallback to onboarding if Firestore fails
        setCurrentScreen('onboarding');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (userDoc.exists()) {
        setUser(userDoc.data() as UserProfile);
        setCurrentScreen('feed');
      } else {
        setCurrentScreen('onboarding');
      }
    } catch (error: any) {
      console.error("Login failed", error);
      alert(`Login Gagal: ${error.message}\n\nPastikan Google Auth sudah aktif di Firebase Console.`);
    }
  };

  const handleCompleteOnboarding = async (role: UserRole) => {
    try {
      let fbUser = auth.currentUser;
      if (!fbUser) {
        const result = await signInWithPopup(auth, googleProvider);
        fbUser = result.user;
      }

      if (fbUser) {
        const profile: UserProfile = {
          uid: fbUser.uid,
          displayName: fbUser.displayName || 'Student',
          email: fbUser.email || '',
          photoURL: fbUser.photoURL || '',
          role,
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'users', profile.uid), profile);
        setUser(profile);
        setCurrentScreen('feed');
      }
    } catch (error: any) {
      console.error("Onboarding failed", error);
      alert(`Gagal menyimpan data: ${error.message}\n\nPastikan Firestore sudah aktif dan rules-nya benar.`);
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
        {currentScreen === 'profile' && user && (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <Profile user={user} onLogout={() => signOut(auth)} />
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
