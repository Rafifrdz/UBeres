import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../lib/api';
import { Job } from '../types';
import { JobCard } from '../components/JobCard';
import { JobCardSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { Loading } from '../components/Loading';
import { BottomNav } from '../components/BottomNav';
import { Search, Plus, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = ['Semua', 'Umum', 'Coding', 'Penulisan', 'Desain', 'Bahasa'];

export function Feed() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadJobs = async (isRefresh = false) => {
    try {
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      const params = new URLSearchParams({ status: 'open', limit: '100' });
      if (searchQuery.trim()) params.set('q', searchQuery.trim());

      const response = await apiFetch<{ data: Job[] }>(`/jobs?${params.toString()}`);
      const openJobs = (response.data || [])
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setJobs(openJobs);
      setFilteredJobs(openJobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    let filtered = jobs;

    if (selectedCategory !== 'Semua') {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [selectedCategory, searchQuery, jobs]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(loadJobs, 800);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      // Gunakan threshold yang tinggi dan stabil
      if (offset > 140) {
        setScrolled(true);
      } else if (offset < 40) {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20">
      {/* 1. Greeting (Non-sticky) */}
      <div className="bg-white px-5 pt-6 pb-0 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="animate-in fade-in slide-in-from-top-2 duration-500">
            <p className="text-xs text-gray-500 mb-0">{getGreeting()},</p>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">{user?.displayName || 'User'}</h1>
          </div>
          <img
            src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`}
            alt="Avatar"
            className="w-12 h-12 rounded-full ring-2 ring-gray-100"
          />
        </div>
      </div>

      {/* 2. Sticky Search & Category Section - Precision overlap to fix gap */}
      <motion.div
        className={`sticky top-0 z-30 bg-white mt-[-12px] transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-none'
          }`}
      >
        <div className="px-5 py-3">
          {/* Search Bar - Static when sticky */}
          <div className={`relative ${scrolled ? 'mb-2' : 'mb-4'}`}>
            <motion.div
              animate={{ 
                width: scrolled ? 16 : 20, 
                height: scrolled ? 16 : 20,
                left: scrolled ? 16 : 16 
              }}
              className="absolute top-1/2 -translate-y-1/2 text-gray-400 z-10"
            >
              <Search className="w-full h-full" />
            </motion.div>
            <motion.input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari tugas..."
              animate={{ 
                height: scrolled ? 36 : 48,
                paddingLeft: scrolled ? 44 : 48,
                fontSize: scrolled ? '14px' : '15px'
              }}
              className="w-full bg-[#F8F9FB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            />
          </div>

          {/* Category Chips - Non-motion for stability */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-5 px-5">
            {CATEGORIES.map(category => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                animate={{ 
                  paddingLeft: scrolled ? 14 : 20,
                  paddingRight: scrolled ? 14 : 20,
                  paddingTop: scrolled ? 4 : 10,
                  paddingBottom: scrolled ? 4 : 10,
                  fontSize: scrolled ? '13px' : '14px'
                }}
                className={`flex-shrink-0 rounded-full font-bold ${selectedCategory === category
                    ? 'bg-[#6366F1] text-white shadow-sm'
                    : 'bg-[#F1F3F7] text-gray-700 active:scale-95'
                  }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Job List - Masonry Layout */}
      <div className="px-3 mt-4">
        {isLoading ? (
          <div className="py-20">
            <Loading label="Mencari tugas terbaik untukmu..." />
          </div>
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="w-16 h-16" />}
            title="Belum ada tugas"
            description={
              searchQuery
                ? 'Coba kata kunci lain'
                : selectedCategory !== 'Semua'
                  ? `Belum ada tugas di kategori ${selectedCategory}`
                  : 'Belum ada tugas terbuka'
            }
          />
        ) : (
          <div className="columns-2 gap-2.5 space-y-2.5">
            {filteredJobs.map(job => (
              <div key={job.id} className="break-inside-avoid mb-2.5">
                <JobCard job={job} />
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
