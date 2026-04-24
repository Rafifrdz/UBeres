import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../lib/api';
import { Job } from '../types';
import { JobCard } from '../components/JobCard';
import { JobCardSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { BottomNav } from '../components/BottomNav';
import { Search, Plus, Briefcase } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20">
      {/* Header */}
      <div className="bg-white px-5 pt-6 pb-5 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm text-gray-500 mb-0.5">{getGreeting()},</p>
            <h1 className="text-xl font-bold text-gray-900">{user?.displayName || 'User'}</h1>
          </div>
          <img
            src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`}
            alt="Avatar"
            className="w-14 h-14 rounded-full ring-2 ring-gray-100"
          />
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari tugas..."
            className="w-full bg-[#F8F9FB] rounded-[12px] pl-12 pr-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#6366F1] placeholder:text-gray-400"
          />
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === category
                  ? 'bg-[#6366F1] text-white shadow-sm'
                  : 'bg-[#F1F3F7] text-gray-700 hover:bg-gray-200 active:scale-95'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Job List */}
      <div className="px-5">
        {isRefreshing && (
          <div className="text-center py-4">
            <div className="inline-block w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <JobCardSkeleton key={i} />
            ))}
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
          <div className="space-y-4">
            {filteredJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
