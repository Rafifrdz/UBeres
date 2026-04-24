import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { Star, ArrowLeft, StarHalf } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';

export function TopWorkers() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ data: any[] }>('/users/top-workers?limit=50')
      .then(res => setWorkers(res.data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Worker Terbaik</h1>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 text-sm">Memuat daftar worker...</p>
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">Belum ada worker terdaftar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {workers.map(worker => (
              <div
                key={worker.uid}
                onClick={() => navigate(`/profile/${worker.uid}`)}
                className="bg-white rounded-[16px] p-3 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 flex flex-col items-center"
              >
                <img
                  src={worker.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.uid}`}
                  alt={worker.displayName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.uid}`;
                  }}
                  className="w-14 h-14 rounded-full mb-3 object-cover ring-2 ring-gray-50"
                />
                <h3 className="font-bold text-gray-900 text-center text-sm mb-1 line-clamp-1">
                  {worker.displayName}
                </h3>
                
                <div className="flex items-center gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => {
                    const r = Number(worker.rating || 0);
                    if (r >= i + 1) return <Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />;
                    if (r >= i + 0.5) return <StarHalf key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />;
                    return <Star key={i} className="w-2.5 h-2.5 fill-gray-200 text-gray-300" />;
                  })}
                </div>

                <div className="flex flex-col items-center gap-1">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-[#6366F1] bg-[#6366F1]/5 px-2 py-0.5 rounded">
                    {worker.totalRatings || 0} Ulasan
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
