import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Job, UserProfile } from '../types';
import { motion } from 'motion/react';
import { Search, Filter, Calendar, DollarSign, Users, Briefcase } from 'lucide-react';

interface FeedProps {
  user: UserProfile;
  onJobClick: (id: string) => void;
}

const categories = ['Semua', 'Tugas', 'Desain', 'Koding', 'Editing', 'Lainnya'];

export default function Feed({ user, onJobClick }: FeedProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'jobs'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
      setJobs(data);
    }, (error) => {
      console.error("Feed fetch error:", error);
      alert(`Gagal memuat daftar kerjaan: ${error.message}\n\nPastikan Firestore sudah aktif dan Rules sudah di-Publish.`);
    });

    return () => unsubscribe();
  }, []);

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
      <header className="px-4 pt-5 pb-1 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Beresin yuk,</p>
            <h1 className="text-lg font-black text-gray-900">{user.displayName.split(' ')[0]}!</h1>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-blue-600 font-bold text-base">{user.displayName[0]}</span>
            )}
          </div>
        </div>

        <div className="relative mb-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input 
            type="text"
            placeholder="Cari kerjaan apa?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 bg-gray-50 rounded-lg pl-9 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all border-none text-xs"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-100' 
                  : 'bg-gray-50 text-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pt-4 space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-4 text-gray-300">
              <Briefcase className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Belum ada kerjaan</h3>
            <p className="text-gray-400 max-w-[200px] text-sm mt-1">Coba cari dengan kategori lain atau tunggu bentar lagi ya.</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <motion.button
              layoutId={job.id}
              key={job.id}
              onClick={() => onJobClick(job.id)}
              className="w-full text-left bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
            >
              <div className="flex justify-between items-start mb-1.5">
                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-wider rounded">
                  {job.category}
                </span>
                <span className="text-[9px] text-gray-400 font-bold uppercase">Baru</span>
              </div>
              
              <h3 className="text-sm font-black text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{job.title}</h3>
              <p className="text-[11px] text-gray-500 mb-3 line-clamp-2 leading-relaxed">{job.description}</p>
              
              <div className="flex items-center justify-between border-t border-gray-50 pt-2.5">
                <div className="flex items-center gap-3 text-[9px] font-black text-gray-400 uppercase">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-green-500" />
                    <span className="text-gray-900">Rp {job.budget?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-500" />
                    <span className="text-gray-900">{job.bidCount || 0} Bid</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-gray-400 font-black uppercase">
                  <Calendar className="w-3 h-3" />
                  <span>2 Hari</span>
                </div>
              </div>
            </motion.button>
          ))
        )}
      </main>
    </motion.div>
  );
}
