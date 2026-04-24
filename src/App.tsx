import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/Toast';
import { Toaster } from 'sonner';

// Screens Baru
import { Splash } from './screens-new/Splash';
import { Login } from './screens-new/Login';
import { RoleSelection } from './screens-new/RoleSelection';
import { ProfileSetup } from './screens-new/ProfileSetup';
import { Feed } from './screens-new/Feed';
import { Explore } from './screens-new/Explore';
import { JobDetail } from './screens-new/JobDetail';
import { MyJobs } from './screens-new/MyJobs';
import { MyPosts } from './screens-new/MyPosts';
import { PostJob } from './screens-new/PostJob';
import { Profile } from './screens-new/Profile';
import { EditProfile } from './screens-new/EditProfile';
import { Settings } from './screens-new/Settings';
import { Chat } from './screens-new/Chat';
import { ChatDetail } from './screens-new/ChatDetail';
import { Notifications } from './screens-new/Notifications';
import { Rating } from './screens-new/Rating';
import { Payment } from './screens-new/Payment';
import { SubmitResult } from './screens-new/SubmitResult';
import { PublicProfile } from './screens-new/PublicProfile';
import { TopUp } from './screens-new/TopUp';
import { Withdraw } from './screens-new/Withdraw';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppProvider>
          <div className="min-h-screen bg-[#F8F9FB] max-w-[430px] mx-auto relative overflow-x-hidden shadow-2xl border-x border-gray-100">
            <Routes>
              {/* Auth Flow */}
              <Route path="/" element={<Splash />} />
              <Route path="/login" element={<Login />} />
              <Route path="/role-selection" element={<RoleSelection />} />
              <Route path="/profile-setup" element={<ProfileSetup />} />

              {/* Main App */}
              <Route path="/feed" element={<Feed />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/job/:id" element={<JobDetail />} />
              <Route path="/my-jobs" element={<MyJobs />} />
              <Route path="/my-posts" element={<MyPosts />} />
              <Route path="/post-job" element={<PostJob />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/chat/:jobId" element={<ChatDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:userId" element={<PublicProfile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />

              {/* Actions */}
              <Route path="/rating/:jobId" element={<Rating />} />
              <Route path="/payment/:jobId" element={<Payment />} />
              <Route path="/submit-result/:jobId" element={<SubmitResult />} />
              <Route path="/topup" element={<TopUp />} />
              <Route path="/withdraw" element={<Withdraw />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster position="top-center" richColors />
          </div>
        </AppProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
