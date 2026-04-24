import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { JobCard } from '../components/JobCard';
import { apiFetch } from '../lib/api';
import { Job } from '../types';
import { Loading } from '../components/Loading';
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
  const [isLoading, setIsLoading] = useState(true);

  const [showFilter, setShowFilter] = useState(false);
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      apiFetch<{ data: any[] }>('/users/top-workers?limit=5'),
      apiFetch<{ data: Job[] }>('/jobs?status=open&limit=3&sort=trending')
    ]).then(([workersRes, jobsRes]) => {
      setTopWorkers(workersRes.data || []);
      setTrendingJobs(jobsRes.data || []);
    }).catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const params = new URLSearchParams({
        category: selectedCategory,
        status: 'open',
        limit: '20',
        sort: sortBy,
      });
      if (minBudget) params.set('minBudget', minBudget);
      if (maxBudget) params.set('maxBudget', maxBudget);

      apiFetch<{ data: Job[] }>(`/jobs?${params.toString()}`)
        .then(res => setFilteredJobs(res.data || []))
        .catch(err => console.error('Failed to load explore jobs:', err));
    } else {
      setFilteredJobs([]);
    }
  }, [selectedCategory, sortBy, minBudget, maxBudget]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20">
      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-4 mb-6 sticky top-0 z-10 shadow-sm">
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
          <button 
            onClick={() => setShowFilter(true)}
            className={`rounded-[10px] p-3 transition-colors ${showFilter ? 'bg-[#6366F1] text-white' : 'bg-[#F8F9FB] text-gray-600 hover:bg-gray-200'}`}
          >
            <SlidersHorizontal className="w-5 h-5" />
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
        {isLoading ? (
          <div className="py-20">
            <Loading label="Menyiapkan rekomendasi..." />
          </div>
        ) : (
          <>
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
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Worker Terbaik</h2>
                  <button onClick={() => navigate('/top-workers')} className="text-sm font-semibold text-[#6366F1] hover:text-[#4F46E5]">
                    Lihat Semua
                  </button>
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
                          const r = Number(worker.rating || 0);
                          if (r <= 0) return <Star className="w-3 h-3 fill-gray-300 text-gray-400" />;
                          if (r % 1 !== 0) return <StarHalf className="w-3 h-3 fill-yellow-400 text-yellow-400" />;
                          return <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />;
                        })()}
                        <span className={Number(worker.rating || 0) <= 0 ? 'text-gray-400' : 'text-gray-700'}>
                          {(Number(worker.rating || 0)).toFixed(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 text-center">{worker.totalRatings || 0} ulasan</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Jobs / Trending */}
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
                  <h2 className="text-xl font-bold text-gray-900">Trending Jobs</h2>
                  <button onClick={() => navigate('/feed')} className="text-sm font-semibold text-[#6366F1] hover:text-[#4F46E5]">
                    Lihat Semua
                  </button>
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
          </>
        )}
      </div>

      <BottomNav />

      {/* Filter Sidebar (Drawer) */}
      {showFilter && (
        <div className="absolute inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={() => setShowFilter(false)}
          />
          
          {/* Drawer Content */}
          <div className="relative w-[200px] h-fit max-h-[80vh] bg-white shadow-2xl flex flex-col rounded-l-2xl self-center animate-in slide-in-from-right duration-300">
            <div className="p-4 flex-1 overflow-y-auto scrollbar-hide">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-tighter">Filter</h2>
                <button 
                  onClick={() => setShowFilter(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Sort By */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Urutkan</label>
                  <div className="space-y-2">
                    {[
                      { id: 'newest', label: 'Terbaru' },
                      { id: 'highest', label: 'Budget Tertinggi' },
                      { id: 'lowest', label: 'Budget Terendah' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setSortBy(opt.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          sortBy === opt.id 
                            ? 'bg-[#6366F1] text-white shadow-md' 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Range */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Budget (Rp)</label>
                  <div className="space-y-3">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">MIN</span>
                      <input
                        type="number"
                        value={minBudget}
                        onChange={e => setMinBudget(e.target.value)}
                        placeholder="0"
                        className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#6366F1]"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">MAX</span>
                      <input
                        type="number"
                        value={maxBudget}
                        onChange={e => setMaxBudget(e.target.value)}
                        placeholder="Tanpa batas"
                        className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#6366F1]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-white border-t border-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setMinBudget('');
                  setMaxBudget('');
                  setSortBy('newest');
                }}
                className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilter(false)}
                className="flex-[2] bg-[#6366F1] text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-[#6366F1]/20 hover:bg-[#4F46E5] active:scale-95 transition-all"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
