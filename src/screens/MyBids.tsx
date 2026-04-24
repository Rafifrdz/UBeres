import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { Bid, UserProfile } from '../types';
import { apiFetch } from '../lib/api';

interface MyBidsProps {
  user: UserProfile;
  onJobClick: (id: string) => void;
}

export default function MyBids({ user, onJobClick }: MyBidsProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'semua' | 'pending' | 'accepted'>('semua');

  useEffect(() => {
    let mounted = true;

    const loadBids = async () => {
      try {
        setLoading(true);
        const response = await apiFetch<{ data: Bid[] }>(`/jobs/bids?workerId=${user.uid}`);
        if (mounted) {
          setBids(response.data || []);
        }
      } catch (error: any) {
        console.error('MyBids fetch error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBids();

    return () => {
      mounted = false;
    };
  }, [user.uid]);

  const filteredBids = bids.filter(bid => {
    if (activeTab === 'semua') return true;
    return bid.status === activeTab;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden h-full">
      <header className="px-6 pt-10 pb-6 bg-white border-b border-gray-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
        <div className="relative z-10">
          <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em] mb-1">Worker Dashboard</p>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">Bid Saya</h1>
        </div>
      </header>

      <div className="px-6 py-4 bg-white border-b border-gray-50 flex gap-2 overflow-x-auto scrollbar-none sticky top-0 z-20">
        {(['semua', 'pending', 'accepted'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab 
                ? 'bg-gray-900 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-4 pb-24">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-xs font-bold text-gray-400">Memuat tawaranku...</p>
          </div>
        ) : filteredBids.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-gray-300">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-gray-900">Belum ada bid</h3>
            <p className="text-gray-400 text-sm mt-1">Cari kerjaan di feed dan berikan tawaran terbaikmu!</p>
          </div>
        ) : (
          filteredBids.map((bid) => (
            <motion.div
              key={bid.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onJobClick(bid.jobId)}
              className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className={`absolute top-0 left-0 w-1.5 h-full ${
                bid.status === 'accepted' ? 'bg-green-500' :
                bid.status === 'rejected' ? 'bg-red-400' : 'bg-blue-400'
              }`} />
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                      bid.status === 'accepted' ? 'bg-green-50 text-green-600' :
                      bid.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {bid.status === 'accepted' ? 'Diterima' :
                       bid.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                    </span>
                    <span className="text-[9px] text-gray-300 font-bold">{formatDate(bid.createdAt)}</span>
                  </div>
                  <h3 className="text-sm font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{bid.jobTitle || 'Judul Kerjaan'}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-gray-400 font-black uppercase mb-0.5 leading-none">Tawaranmu</p>
                  <p className="text-sm font-black text-blue-600">Rp {bid.price.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-black text-blue-500">
                    {(bid.clientName || 'U')[0]}
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold">{bid.clientName || 'User UBeres'}</p>
                </div>
                <div className="flex items-center gap-1 text-blue-500">
                  <span className="text-[9px] font-black uppercase tracking-widest">Lihat Detail</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </main>
    </div>
  );
}
