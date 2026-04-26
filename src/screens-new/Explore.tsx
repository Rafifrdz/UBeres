import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BottomNav } from '../components/BottomNav';
import { JobCard } from '../components/JobCard';
import { apiFetch } from '../lib/api';
import { Job } from '../types';
import { Loading } from '../components/Loading';
import { Search, SlidersHorizontal, Palette, Code, PenTool, Briefcase, Globe, Package, Star, X } from 'lucide-react';
import { motion } from 'motion/react';

const CATEGORY_GRID = [
  { name: 'Umum', Icon: Briefcase, color: 'bg-white text-gray-700 border border-gray-200' },
  { name: 'Coding', Icon: Code, color: 'bg-white text-gray-700 border border-gray-200' },
  { name: 'Penulisan', Icon: PenTool, color: 'bg-white text-gray-700 border border-gray-200' },
  { name: 'Desain', Icon: Palette, color: 'bg-white text-gray-700 border border-gray-200' },
  { name: 'Bahasa', Icon: Globe, color: 'bg-white text-gray-700 border border-gray-200' },
  { name: 'Lainnya', Icon: Package, color: 'bg-white text-gray-700 border border-gray-200' },
];

export function Explore() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<any[]>([]);
  const [topWorkers, setTopWorkers] = useState<any[]>([]);
  const [trendingJobs, setTrendingJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Debounce search query - Reduced to 200ms for instant feel
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [showFilter, setShowFilter] = useState(false);
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [minRating, setMinRating] = useState('0');
  const [sortBy, setSortBy] = useState('newest');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 140) {
        setScrolled(true);
      } else if (offset < 40) {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    if (selectedCategory || debouncedSearch) {
      setIsLoading(true);
      if (user?.role === 'client') {
        // Client mencari Workers
        const params = new URLSearchParams({
          role: 'worker',
          limit: '20',
          sort: sortBy === 'rating' ? 'rating' : sortBy === 'reviews' ? 'totalRatings' : 'createdAt',
        });
        if (selectedCategory) params.set('category', selectedCategory);
        if (debouncedSearch) params.set('q', debouncedSearch);
        if (minRating !== '0') params.set('minRating', minRating);

        apiFetch<{ data: any[] }>(`/users?${params.toString()}`)
          .then(res => setFilteredWorkers(res.data || []))
          .catch(err => console.error('Failed to load explore workers:', err))
          .finally(() => setIsLoading(false));
      } else {
        // Worker mencari Jobs
        const params = new URLSearchParams({
          status: 'open',
          limit: '20',
          sort: sortBy,
        });
        if (selectedCategory) params.set('category', selectedCategory);
        if (debouncedSearch) params.set('q', debouncedSearch);
        if (minBudget) params.set('minBudget', minBudget);
        if (maxBudget) params.set('maxBudget', maxBudget);

        apiFetch<{ data: Job[] }>(`/jobs?${params.toString()}`)
          .then(res => setFilteredJobs(res.data || []))
          .catch(err => console.error('Failed to load explore jobs:', err))
          .finally(() => setIsLoading(false));
      }
    } else {
      setFilteredJobs([]);
      setFilteredWorkers([]);
    }
  }, [selectedCategory, debouncedSearch, sortBy, minBudget, maxBudget, minRating, user?.role]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20">
      {/* 1. Title (Non-sticky) */}
      <div className="bg-white px-6 pt-6 pb-0 relative z-10">
        <h1 className="text-2xl font-bold mb-4">Explore</h1>
      </div>

      {/* 2. Sticky Search Bar */}
      <motion.div
        className={`sticky top-0 z-30 bg-white mt-[-16px] transition-shadow duration-300 transform-gpu backface-visibility-hidden ${scrolled ? 'shadow-md' : 'shadow-none'
          }`}
      >
        <div className="px-6 py-3">
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <motion.div
                animate={{ 
                  width: scrolled ? 16 : 20, 
                  height: scrolled ? 16 : 20,
                  left: scrolled ? 12 : 12 
                }}
                className="absolute top-1/2 -translate-y-1/2 text-gray-400 z-10"
              >
                <Search className="w-full h-full" />
              </motion.div>
              <motion.input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari worker, kategori..."
                animate={{ 
                  height: scrolled ? 36 : 48,
                  paddingLeft: scrolled ? 36 : 40,
                  fontSize: scrolled ? '14px' : '15px'
                }}
                className="w-full bg-[#F8F9FB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              />
            </div>
            <motion.button
              onClick={() => setShowFilter(true)}
              animate={{ 
                width: scrolled ? 36 : 48,
                height: scrolled ? 36 : 48
              }}
              className={`rounded-xl flex items-center justify-center ${showFilter ? 'bg-[#6366F1] text-white' : 'bg-[#F8F9FB] text-gray-600 hover:bg-gray-200'}`}
            >
              <motion.div
                animate={{ 
                  width: scrolled ? 16 : 20, 
                  height: scrolled ? 16 : 20 
                }}
              >
                <SlidersHorizontal className="w-full h-full" />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Selected Category Header */}
      {selectedCategory && (
        <div className="px-6 mb-4">
          <div className="bg-white rounded-[16px] p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-gray-500 mb-1">Kategori</p>
              <h2 className="text-lg font-semibold text-[#101829]">{selectedCategory}</h2>
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
            <Loading label={debouncedSearch ? "Mencari hasil terbaik..." : "Menyiapkan rekomendasi..."} />
          </div>
        ) : (
          <>
            {/* Show Category List & Dashboard only if no search/category selected */}
            {!(selectedCategory || debouncedSearch) ? (
              <>
                {/* Categories */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Kategori</h2>
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

                {/* Top Workers */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Worker Terbaik</h2>
                    <button onClick={() => navigate('/top-workers')} className="text-sm font-semibold text-[#6366F1] hover:text-[#4F46E5]">
                      Lihat Semua
                    </button>
                  </div>

                  <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-6 px-6 pb-4">
                    {topWorkers.map(worker => (
                      <div
                        key={worker.uid}
                        onClick={() => navigate(`/profile/${worker.uid}`)}
                        className="flex-shrink-0 w-28 bg-white rounded-xl p-3 cursor-pointer hover:shadow-md transition-shadow border border-gray-50"
                      >
                        <img
                          src={worker.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.uid}`}
                          alt={worker.displayName}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.uid}`;
                          }}
                          className="w-12 h-12 rounded-full mx-auto mb-2 object-cover ring-2 ring-gray-50"
                        />
                        <h3 className="font-bold text-[13px] text-gray-900 text-center mb-0.5 truncate px-1">
                          {worker.displayName}
                        </h3>
                        <div className="flex items-center justify-center gap-1 text-[11px] text-gray-600 mb-0.5">
                          {(() => {
                            const r = Number(worker.rating || 0);
                            if (r <= 0) return <Star className="w-2.5 h-2.5 fill-gray-300 text-gray-400" />;
                            return <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />;
                          })()}
                          <span className={`font-bold ${Number(worker.rating || 0) <= 0 ? 'text-gray-400' : 'text-gray-800'}`}>
                            {(Number(worker.rating || 0)).toFixed(1)}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center">{worker.totalRatings || 0} ulasan</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trending Jobs */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Trending Jobs</h2>
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
              </>
            ) : (
              /* Search / Category Results */
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    {debouncedSearch ? 'Hasil Pencarian' : (user?.role === 'client' ? 'Tenaga Kerja Tersedia' : 'Tugas Tersedia')}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {user?.role === 'client' ? filteredWorkers.length : filteredJobs.length} {user?.role === 'client' ? 'worker' : 'tugas'}
                  </span>
                </div>

                {user?.role === 'client' ? (
                  /* Workers Results for Client */
                  filteredWorkers.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {filteredWorkers.map(worker => (
                        <div
                          key={worker.uid}
                          onClick={() => navigate(`/profile/${worker.uid}`)}
                          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 hover:shadow-md transition-all active:scale-[0.98]"
                        >
                          <div className="flex flex-col items-center text-center">
                            <img
                              src={worker.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.uid}`}
                              alt={worker.displayName}
                              className="w-16 h-16 rounded-full mb-3 object-cover ring-4 ring-gray-50"
                            />
                            <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{worker.displayName}</h3>
                            <div className="flex items-center gap-1 text-xs text-yellow-500 font-bold mb-2">
                              <Star className="w-3 h-3 fill-yellow-500" />
                              <span>{Number(worker.rating || 0).toFixed(1)}</span>
                              <span className="text-gray-400 font-normal">({worker.totalRatings || 0})</span>
                            </div>
                            <div className="w-full pt-3 border-t border-gray-50 mt-1">
                              <span className="text-[10px] bg-[#6366F1]/10 text-[#6366F1] px-2 py-1 rounded-full font-bold">
                                {worker.skills?.[0] || worker.category || 'Worker'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-[16px] p-8 text-center">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Tidak menemukan worker yang sesuai</p>
                    </div>
                  )
                ) : (
                  /* Jobs Results for Worker */
                  filteredJobs.length > 0 ? (
                    <div className={filteredJobs.length > 1 ? "columns-2 gap-2.5 space-y-2.5" : "space-y-3"}>
                      {filteredJobs.map(job => (
                        <div key={job.id} className={filteredJobs.length > 1 ? "break-inside-avoid mb-2.5" : ""}>
                          <JobCard job={job} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-[16px] p-8 text-center">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Tidak menemukan tugas yang sesuai</p>
                    </div>
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />

      {/* Filter Sidebar (Drawer) */}
      {showFilter && (
        <div className="fixed inset-0 z-[100] flex justify-end max-w-[430px] mx-auto px-4">
          {/* Backdrop - No more blur here */}
          <div
            className="absolute inset-0 bg-black/10 transition-opacity"
            onClick={() => setShowFilter(false)}
          />

          {/* Drawer Content - Responsive: Top on mobile, Center on Laptop */}
          <div className="relative w-[210px] h-fit max-h-[85vh] bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl flex flex-col rounded-[24px] mt-16 md:mt-0 md:self-center overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="p-4 flex-1 overflow-y-auto scrollbar-hide">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Filter</h2>
                <button
                  onClick={() => setShowFilter(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Sorting */}
              <div className="mb-5">
                <h3 className="text-[10px] font-bold text-gray-400 tracking-wider mb-2">Urutkan</h3>
                <div className="space-y-1.5">
                  {(user?.role === 'client' ? [
                    { id: 'rating', label: 'Rating Tertinggi' },
                    { id: 'reviews', label: 'Ulasan Terbanyak' },
                    { id: 'newest', label: 'Terbaru' }
                  ] : [
                    { id: 'newest', label: 'Terbaru' },
                    { id: 'highest', label: 'Budget Tertinggi' },
                    { id: 'lowest', label: 'Budget Terendah' }
                  ]).map(opt => (
                    <div key={opt.id} className="relative">
                      <button
                        key={opt.id}
                        onClick={() => setSortBy(opt.id)}
                        className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${sortBy === opt.id
                          ? 'bg-[#6366F1] text-white shadow-md'
                          : 'bg-gray-50/50 text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        {opt.label}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Content based on Role */}
              {user?.role === 'client' ? (
                /* Rating Filter for Client */
                <div className="mb-6">
                  <h3 className="text-[10px] font-bold text-gray-400 tracking-wider mb-2">Rating Minimal</h3>
                  <div className="flex gap-1.5">
                    {['0', '3', '4', '4.5'].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${minRating === rating
                          ? 'bg-[#6366F1] text-white'
                          : 'bg-gray-50/50 text-gray-400'
                          }`}
                      >
                        {rating === '0' ? 'Semua' : `${rating}+`}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Budget Range for Worker */
                <div className="mb-6">
                  <h3 className="text-[10px] font-bold text-gray-400 tracking-wider mb-2">Budget (Rp)</h3>
                  <div className="space-y-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-400">Min</span>
                      <input
                        type="number"
                        value={minBudget}
                        onChange={e => setMinBudget(e.target.value)}
                        placeholder="0"
                        className="w-full bg-gray-50/50 border border-transparent focus:border-[#6366F1]/30 focus:bg-white rounded-lg pl-10 pr-3 py-2 text-xs outline-none transition-all"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-400">Max</span>
                      <input
                        type="number"
                        value={maxBudget}
                        onChange={e => setMaxBudget(e.target.value)}
                        placeholder="Tanpa batas"
                        className="w-full bg-gray-50/50 border border-transparent focus:border-[#6366F1]/30 focus:bg-white rounded-lg pl-10 pr-3 py-2 text-xs outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    setMinBudget('');
                    setMaxBudget('');
                    setMinRating('0');
                    setSortBy('newest');
                  }}
                  className="flex-1 py-2 text-[11px] font-bold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilter(false)}
                  className="flex-[1.5] bg-[#6366F1] text-white py-2 rounded-lg text-[11px] font-bold shadow-lg shadow-[#6366F1]/20 active:scale-95 transition-all"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
