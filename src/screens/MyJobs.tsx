import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Job, UserProfile } from '../types';
import { motion } from 'motion/react';
import { Briefcase, Clock, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

interface MyJobsProps {
  user: UserProfile;
  onJobClick: (id: string) => void;
}

export default function MyJobs({ user, onJobClick }: MyJobsProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadMyJobs = async () => {
      try {
        setLoading(true);
        // We fetch jobs where the current user is the client
        const response = await apiFetch<{ data: Job[] }>(`/jobs?clientId=${user.uid}`);
        if (mounted) {
          setJobs(response.data || []);
        }
      } catch (error: any) {
        console.error('MyJobs fetch error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadMyJobs();

    return () => {
      mounted = false;
    };
  }, [user.uid]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'assigned': return 'bg-orange-500';
      case 'paid': return 'bg-indigo-500';
      case 'working': return 'bg-blue-600';
      case 'submitting': return 'bg-purple-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col overflow-hidden pb-20 bg-gray-50"
    >
      <header className="px-6 pt-10 pb-6 bg-white border-b border-gray-100">
        <h1 className="text-2xl font-black text-gray-900 leading-tight">Kerjaan Saya</h1>
        <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-widest">Kelola kerjaan yang kamu posting</p>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-gray-100">
              <Briefcase className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="font-black text-gray-900 text-lg">Belum Posting Apapun</h3>
            <p className="text-gray-400 max-w-[200px] text-xs mt-2 font-medium">Post kerjaan pertamamu biar dibantu sama mahasiswa lain!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => onJobClick(job.id)}
                className="w-full bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4 group active:scale-[0.98] transition-all text-left"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${getStatusColor(job.status)}`}>
                  <Briefcase className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[7px] font-black text-white uppercase tracking-widest px-1.5 py-0.5 rounded bg-gray-900/10 text-gray-900">{job.category}</span>
                    <div className="w-1 h-1 bg-gray-200 rounded-full" />
                    <span className="text-[7px] font-black text-blue-600 uppercase tracking-widest">{job.status}</span>
                  </div>
                  <h3 className="text-sm font-black text-gray-900 truncate group-hover:text-blue-600 transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-gray-400" />
                      <span className="text-[9px] font-bold text-gray-400">Rp {job.budget?.toLocaleString()}</span>
                    </div>
                    {job.bidCount > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5 text-orange-500" />
                        <span className="text-[9px] font-black text-orange-500 uppercase">{job.bidCount} Penawaran</span>
                      </div>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </main>
    </motion.div>
  );
}
