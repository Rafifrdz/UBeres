import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function Splash() {
  const navigate = useNavigate();
  const { user, isLoading } = useApp();

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        if (!user) {
          navigate('/login');
        } else if (!user.displayName) {
          navigate('/role-selection');
        } else {
          navigate('/feed');
        }
      }, 1500);
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8">
      <div className="text-center px-6">
        <div className="w-28 h-28 bg-gradient-to-br from-[#6366F1] to-[#4F46E5] rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-lg">
          <span className="text-5xl font-bold text-white">UB</span>
        </div>
        <h1 className="text-4xl font-bold mb-3 text-[#6366F1]">UBeres</h1>
        <p className="text-gray-600 text-lg mb-10">Beresno Tugas, Gampang!</p>

        {/* Loading dots */}
        <div className="flex items-center justify-center gap-2.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2.5 h-2.5 bg-[#6366F1] rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
