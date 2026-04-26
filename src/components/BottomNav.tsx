import { Home, Search, Briefcase, MessageCircle, User, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useApp();

  const isActive = (path: string) => location.pathname === path;

  // Dynamic tabs based on user role
  const clientTabs = [
    { icon: Home, label: 'Feed', path: '/feed' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: Plus, label: 'Post', path: '/post-job', isCenter: true },
    { icon: MessageCircle, label: 'Chat', path: '/chat' },
    { icon: User, label: 'Profil', path: '/profile' },
  ];

  const workerTabs = [
    { icon: Home, label: 'Feed', path: '/feed' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: Briefcase, label: 'My Jobs', path: '/my-jobs' },
    { icon: MessageCircle, label: 'Chat', path: '/chat' },
    { icon: User, label: 'Profil', path: '/profile' },
  ];

  const tabs = user?.role === 'client' ? clientTabs : workerTabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-[430px] mx-auto bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around px-1 py-2 safe-area-pb">
          {tabs.map(({ icon: Icon, label, path, isCenter }) => {
            const active = isActive(path);

            // Center button (Post for Client) - More prominent
            if (isCenter) {
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="flex flex-col items-center gap-1 -mt-4"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    active
                      ? 'bg-[#6366F1] scale-105'
                      : 'bg-[#6366F1] hover:scale-105 active:scale-95'
                  }`}>
                    <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-900 mt-1">{label}</span>
                </button>
              );
            }

            // Regular tabs
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-1 px-4 py-2.5 min-w-[60px] rounded-xl transition-all ${
                  active
                    ? 'text-[#6366F1] bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 active:bg-gray-50'
                }`}
              >
                <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
                <span className="text-[11px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
