import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Job, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Calendar, DollarSign, Users, Briefcase, Heart, Bookmark, User, Bell, X, CheckCircle2 } from 'lucide-react';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface FeedProps {
  user: UserProfile;
  onJobClick: (id: string) => void;
  onNotifications: () => void;
}

const skillPool = [
  'Marketing', 'Branding', 'Editing', 'Photo Editing', 
  'Content Writing', 'Social Media Marketing', 'Video Editing',
  'Digital Marketing', 'YouTube Video Editing', 'AI Image Editing',
  'AI Content Editing', 'ReactJS', 'Python', 'Skripsi', 'Joki Game'
];

type SortType = 'newest' | 'price_high';

export default function Feed({ user, onJobClick, onNotifications }: FeedProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillSearch, setSkillSearch] = useState('');

  const loadJobs = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams({ status: 'open', limit: '100' });
      if (searchQuery.trim()) params.set('q', searchQuery.trim());

      const response = await apiFetch<{ data: Job[] }>(`/jobs?${params.toString()}`);
      let loadedJobs = response.data || [];
      
      if (selectedSkills.length > 0) {
        loadedJobs = loadedJobs.filter(job => 
          selectedSkills.some(skill => 
            job.title.toLowerCase().includes(skill.toLowerCase()) || 
            job.description.toLowerCase().includes(skill.toLowerCase()) ||
            (job as any).keywords?.toLowerCase().includes(skill.toLowerCase())
          )
        );
      }

      if (sortBy === 'price_high') {
        loadedJobs = [...loadedJobs].sort((a, b) => (b.budget || 0) - (a.budget || 0));
      } else {
        loadedJobs = [...loadedJobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      setJobs(loadedJobs);
    } catch (error: any) {
      console.error('Feed fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [searchQuery, sortBy, selectedSkills]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col overflow-hidden pb-20 bg-gray-50"
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
          onClick={onNotifications}
          className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm relative active:scale-90 transition-all"
        >
          <Bell className="w-5 h-5 text-gray-400" />
          <div className="absolute top-3 right-3.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <button 
          onClick={() => {}} 
          className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm overflow-hidden active:scale-90 transition-all"
        >
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User className="w-5 h-5 text-blue-500" />
          )}
        </button>
      </header>

      {/* Compact Discovery Bar: Unified Skills Filter */}
      <div className="bg-white/95 backdrop-blur-md sticky top-[76px] z-20 pt-1 pb-3 border-b border-gray-100/30">
        <div className="px-4 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-50/50 p-1 rounded-2xl border border-gray-100/50">
            <button 
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-1.5 px-3 h-8 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md shadow-blue-100 active:scale-95 transition-all whitespace-nowrap"
            >
              <Filter className="w-3 h-3" />
              Filter
              {selectedSkills.length > 0 && (
                <span className="w-3.5 h-3.5 bg-white text-blue-600 rounded-full flex items-center justify-center text-[7px] font-black">
                  {selectedSkills.length}
                </span>
              )}
            </button>

            <div className="flex-1 flex gap-1.5 overflow-x-auto scrollbar-none py-0.5 pr-1">
              {selectedSkills.map(skill => (
                <button
                  key={skill}
                  onClick={() => setSelectedSkills(prev => prev.filter(s => s !== skill))}
                  className="px-2.5 h-6.5 bg-white text-blue-600 border border-blue-100/50 rounded-lg text-[8px] font-black uppercase tracking-tight whitespace-nowrap flex items-center gap-1 shadow-sm"
                >
                  {skill}
                  <X className="w-2.5 h-2.5 opacity-40" />
                </button>
              ))}
              {selectedSkills.length === 0 && (
                <span className="text-[9px] font-bold text-gray-400 italic px-1 opacity-60">Cari keahlian...</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <main 
        className="flex-1 overflow-y-auto px-6 relative scroll-smooth"
        onScroll={(e) => {
          const target = e.currentTarget;
          if (target.scrollTop === 0 && !refreshing) {
            // Potential refresh start
          }
        }}
      >
        {/* Pull to Refresh Indicator */}
        <motion.div 
          className="absolute top-2 left-0 right-0 flex justify-center z-40 pointer-events-none"
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: refreshing ? 1 : 0, 
            y: refreshing ? 20 : -20,
            scale: refreshing ? 1 : 0.8
          }}
        >
          <div className="bg-white p-2 rounded-full shadow-xl border border-blue-50">
            <div className="w-6 h-6 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          </div>
        </motion.div>

        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.4}
          onDragEnd={(_, info) => {
            const scrollContainer = document.querySelector('main.overflow-y-auto');
            if (scrollContainer && scrollContainer.scrollTop === 0 && info.offset.y > 80) {
              loadJobs(true);
            }
          }}
          className="min-h-full py-4 space-y-4 pt-4"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-4" />
              <h3 className="font-bold text-gray-900 text-sm">Memuat kerjaan...</h3>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-64 h-64 -mb-10">
                <DotLottieReact
                  src="https://lottie.host/02a50c8e-6705-4c07-889a-05186b515904/P8HqXoZlXm.lottie"
                  loop
                  autoplay
                />
              </div>
              <h3 className="font-black text-gray-900 text-lg">Belum ada kerjaan</h3>
              <p className="text-gray-400 max-w-[200px] text-[11px] mt-2 font-bold uppercase tracking-widest leading-relaxed">Coba sesuaikan filter atau cari dengan keyword lain ya.</p>
            </div>
          ) : (
          <AnimatePresence>
            {jobs.map((job) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
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
                    
                    {user.role !== 'client' && (
                      <button 
                        onClick={() => onJobClick(job.id)}
                        className="h-10 px-6 bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-2"
                      >
                        Beresin
                        <Briefcase className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        </motion.div>
      </main>

      {/* Skills Filter Modal */}
      <AnimatePresence>
        {showFilterModal && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterModal(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-white rounded-t-[40px] shadow-2xl p-8 pb-10"
            >
              <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8" />
              
              <div className="flex items-center justify-between mb-8 px-1">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Skills & Keywords</h2>
                <button 
                  onClick={() => setSelectedSkills([])}
                  className="text-xs font-black text-blue-500 uppercase tracking-widest"
                >
                  Clear
                </button>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Search skills..."
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    className="w-full h-12 bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl pl-11 pr-4 text-xs font-medium outline-none transition-all"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1">
                  {skillPool
                    .filter(skill => skill.toLowerCase().includes(skillSearch.toLowerCase()))
                    .map(skill => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          onClick={() => {
                            setSelectedSkills(prev => 
                              isSelected ? prev.filter(s => s !== skill) : [...prev, skill]
                            );
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-blue-50/50 rounded-xl transition-all group"
                        >
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200 group-hover:border-blue-300'
                          }`}>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <span className={`text-[11px] font-black transition-all ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                            {skill}
                          </span>
                        </button>
                      );
                    })
                  }
                </div>

                <button 
                  onClick={() => setShowFilterModal(false)}
                  className="w-full h-14 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all mt-4"
                >
                  Terapkan Filter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
