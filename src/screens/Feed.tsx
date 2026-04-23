import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Job, UserProfile } from '../types';
import { motion } from 'motion/react';
import { Search, Filter, Calendar, DollarSign, Users, Briefcase, Heart, Bookmark } from 'lucide-react';

interface FeedProps {
  user: UserProfile;
  onJobClick: (id: string) => void;
}

const categories = ['Semua', 'Tugas', 'Desain', 'Koding', 'Editing', 'Lainnya'];

export default function Feed({ user, onJobClick }: FeedProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadJobs = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ status: 'open', limit: '100' });
        if (selectedCategory !== 'Semua') params.set('category', selectedCategory);
        if (searchQuery.trim()) params.set('q', searchQuery.trim());

        const response = await apiFetch<{ data: Job[] }>(`/jobs?${params.toString()}`);
        if (mounted) {
          setJobs(response.data || []);
        }
      } catch (error: any) {
        console.error('Feed fetch error:', error);
        alert(`Gagal memuat daftar kerjaan: ${error.message}`);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      mounted = false;
    };
  }, [selectedCategory, searchQuery]);

  const filteredJobs = jobs.filter(job => {
    const matchesCategory = selectedCategory === 'Semua' || job.category === selectedCategory;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col overflow-hidden pb-20"
    >
      <header className="px-5 pt-6 pb-4 bg-white/80 backdrop-blur-xl sticky top-0 z-30 flex items-center gap-3">
        <div className="flex-1 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors">
            <Search className="w-full h-full" />
          </div>
          <input 
            type="text"
            placeholder="Cari kerjaan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 bg-gray-100/50 rounded-full pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all border-none text-sm font-medium shadow-inner"
          />
        </div>
        
        <button 
          onClick={() => setSelectedCategory('Semua')}
          className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm overflow-hidden active:scale-90 transition-all"
        >
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User className="w-5 h-5 text-blue-500" />
          )}
        </button>
      </header>

      {/* FYP Navigation Tabs */}
      <div className="px-5 pt-2 pb-4 bg-white/80 backdrop-blur-xl flex gap-8 justify-center border-b border-gray-50 sticky top-[76px] z-20">
        <button className="text-sm font-black text-gray-900 relative">
          Beresin Yuk
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-1 bg-blue-500 rounded-full" />
        </button>
        <button className="text-sm font-bold text-gray-400">Terdekat</button>
      </div>

      <main className="flex-1 overflow-y-auto px-6 pt-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h3 className="font-bold text-gray-900 text-lg">Memuat kerjaan...</h3>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-4 text-gray-300">
              <Briefcase className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Belum ada kerjaan</h3>
            <p className="text-gray-400 max-w-[200px] text-sm mt-1">Coba cari dengan kategori lain atau tunggu bentar lagi ya.</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <motion.div
              layoutId={job.id}
              key={job.id}
              className="w-full bg-white rounded-[32px] border border-gray-100 shadow-sm transition-all overflow-hidden group relative mb-4"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                      {job.clientPhotoURL ? (
                        <img src={job.clientPhotoURL} alt={job.clientName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-blue-600 font-black text-xs">{(job.clientName || 'U')[0]}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-gray-900 leading-none mb-1">{job.clientName || 'User UBeres'}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{job.category}</span>
                        <div className="w-1 h-1 bg-gray-200 rounded-full" />
                        <span className="text-[8px] text-gray-400 font-bold uppercase">Baru</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-xl text-gray-400 hover:text-red-500 transition-colors">
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-xl text-gray-400 hover:text-blue-500 transition-colors">
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={() => onJobClick(job.id)}
                  className="w-full text-left mb-4"
                >
                  <h3 className="text-sm font-black text-gray-900 mb-1 group-hover:text-blue-600 transition-colors leading-tight line-clamp-1">{job.title}</h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-medium line-clamp-2">{job.description}</p>
                </button>
                
                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                  <div className="flex flex-col">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Budget</p>
                    <p className="text-sm font-black text-blue-600 leading-none">Rp {job.budget?.toLocaleString()}</p>
                  </div>
                  
                  <button 
                    onClick={() => onJobClick(job.id)}
                    className="h-10 px-6 bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-2"
                  >
                    Beresin
                    <Briefcase className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </main>
    </motion.div>
  );
}
