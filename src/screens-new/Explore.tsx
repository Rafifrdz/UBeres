import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { JobCard } from '../components/JobCard';
import { apiFetch } from '../lib/api';
import { Job } from '../types';
import { Search, SlidersHorizontal, Palette, Code, PenTool, Briefcase, Globe, Package, Star, StarHalf, X } from 'lucide-react';

const CATEGORY_GRID = [
  { name: 'Umum', Icon: Briefcase, color: 'bg-white text-gray-700 border border-gray-200' },
  { name: 'Coding', Icon: Code, color: 'bg-white text-gray-700 border border-gray-200' },
  { name: 'Penulisan', Icon: PenTool, color: 'bg-white text-gray-700 border border-gray-200' },
  { name: 'Desain', Icon: Palette, color: 'bg-white text-gray-700 border border-gray-200' },
  { name: 'Bahasa', Icon: Globe, color: 'bg-white text-gray-700 border border-gray-200' },
  { name: 'Lainnya', Icon: Package, color: 'bg-white text-gray-700 border border-gray-200' },
];



export function Explore() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [topWorkers, setTopWorkers] = useState<any[]>([]);
  const [trendingJobs, setTrendingJobs] = useState<Job[]>([]);

  useEffect(() => {
    // Fetch Top Workers
    apiFetch<{ data: any[] }>('/users/top-workers?limit=5')
      .then(res => setTopWorkers(res.data || []))
      .catch(console.error);

    // Fetch Trending Jobs
    apiFetch<{ data: Job[] }>('/jobs?status=open&limit=3')
      .then(res => setTrendingJobs(res.data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      apiFetch<{ data: Job[] }>(`/jobs?category=${selectedCategory}&status=open&limit=20`)
        .then(res => setFilteredJobs(res.data || []))
        .catch(err => console.error('Failed to load explore jobs:', err));
    } else {
      setFilteredJobs([]);
    }
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20">
      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-4 mb-6">
        <h1 className="text-2xl font-bold mb-4">Explore</h1>

        {/* Search */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari worker, kategori..."
              className="w-full bg-[#F8F9FB] rounded-[10px] pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            />
          </div>
          <button className="bg-[#F8F9FB] rounded-[10px] p-3 hover:bg-gray-200 transition-colors">
            <SlidersHorizontal className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Selected Category Header */}
      {selectedCategory && (
        <div className="px-6 mb-4">
          <div className="bg-white rounded-[16px] p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-gray-500 mb-1">Kategori</p>
              <h2 className="text-lg font-semibold text-[#6366F1]">{selectedCategory}</h2>
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      <div className="px-6 space-y-8">
        {/* Categories */}
        {!selectedCategory && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Kategori</h2>
            <div className="grid grid-cols-3 gap-2.5">
              {CATEGORY_GRID.map(category => {
                const IconComponent = category.Icon;
                return (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`${category.color} rounded-[12px] p-3 text-left hover:scale-105 transition-transform active:scale-95`}
                  >
                    <IconComponent className="w-6 h-6 mb-1.5 text-gray-600" strokeWidth={1.5} />
                    <h3 className="font-semibold text-xs">{category.name}</h3>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Workers */}
        {!selectedCategory && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Worker Terbaik</h2>
              <button className="text-sm text-[#6366F1] font-medium">Lihat Semua</button>
            </div>

            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {topWorkers.map(worker => (
                <div
                  key={worker.uid}
                  onClick={() => navigate(`/profile/${worker.uid}`)}
                  className="flex-shrink-0 w-36 bg-white rounded-[16px] p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <img
                    src={worker.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.uid}`}
                    alt={worker.displayName}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.uid}`;
                    }}
                    className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                  />
                  <h3 className="font-medium text-sm text-gray-900 text-center mb-1 truncate">
                    {worker.displayName}
                  </h3>
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-600 mb-1">
                    {(() => {
                      const r = worker.rating || 0;
                      if (r === 0) return <Star className="w-3 h-3 fill-gray-200 text-gray-300" />;
                      if (r % 1 !== 0) return <StarHalf className="w-3 h-3 fill-yellow-400 text-yellow-400" />;
                      return <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />;
                    })()}
                    <span>{(worker.rating || 0).toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-gray-500 text-center">{worker.totalRatings || 0} ulasan</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Jobs */}
        {selectedCategory ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Tugas Tersedia</h2>
              <span className="text-sm text-gray-500">{filteredJobs.length} tugas</span>
            </div>

            {filteredJobs.length > 0 ? (
              <div className="space-y-3">
                {filteredJobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[16px] p-8 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Belum ada tugas di kategori {selectedCategory}</p>
              </div>
            )}
          </div>
        ) : (
          /* Trending Jobs */
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Trending Jobs</h2>
              <button className="text-sm text-[#6366F1] font-medium">Lihat Semua</button>
            </div>

            <div className="space-y-3">
              {trendingJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => navigate(`/job/${job.id}`)}
                  className="bg-white rounded-[16px] p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <h3 className="font-medium text-[#6366F1] mb-2">{job.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium">Rp {(job.budget || 0).toLocaleString('id-ID')}</span>
                    <span className="text-xs text-gray-500">{job.bidCount} bids</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
