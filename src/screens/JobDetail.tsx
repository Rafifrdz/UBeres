import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Job, Bid, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, DollarSign, Clock, Star, MessageSquare, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface JobDetailProps {
  jobId: string;
  user: UserProfile;
  onBack: () => void;
  onChat: () => void;
}

export default function JobDetail({ jobId, user, onBack, onChat }: JobDetailProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidPrice, setBidPrice] = useState('');
  const [bidPitch, setBidPitch] = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);

  const loadJobAndBids = async () => {
    const [jobRes, bidsRes] = await Promise.all([
      apiFetch<{ data: Job }>(`/jobs/${jobId}`),
      apiFetch<{ data: Bid[] }>(`/jobs/${jobId}/bids`),
    ]);

    setJob(jobRes.data);
    setBids(bidsRes.data || []);
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        await loadJobAndBids();
      } catch (error: any) {
        console.error('Job detail error:', error);
        if (mounted) {
          alert(`Gagal memuat detail kerjaan: ${error.message}`);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [jobId]);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidPrice || !bidPitch) return;

    setSubmittingBid(true);
    try {
      await apiFetch(`/jobs/${jobId}/bids`, {
        method: 'POST',
        headers: {
          'x-user-id': user.uid,
        },
        body: JSON.stringify({
        workerId: user.uid,
        workerName: user.displayName,
        workerRating: user.rating || 5,
        price: parseInt(bidPrice),
        pitch: bidPitch,
        }),
      });
      setShowBidForm(false);
      setBidPitch('');
      setBidPrice('');
      await loadJobAndBids();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal kirim bid';
      alert(message);
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleSelectWorker = async (bid: Bid) => {
    if (!job || job.clientId !== user.uid) return;
    try {
      await apiFetch(`/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'x-user-id': user.uid,
        },
        body: JSON.stringify({
          actorId: user.uid,
          status: 'assigned',
          workerId: bid.workerId,
        }),
      });
      await loadJobAndBids();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memilih worker';
      alert(message);
    }
  };

  const handlePayment = async () => {
    if (!job || job.clientId !== user.uid) return;
    try {
      await apiFetch(`/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'x-user-id': user.uid,
        },
        body: JSON.stringify({
          actorId: user.uid,
          status: 'paid',
        }),
      });
      await loadJobAndBids();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal update status';
      alert(message);
    }
  };

  const handleDone = async () => {
    if (!job || job.clientId !== user.uid) return;
    try {
      await apiFetch(`/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'x-user-id': user.uid,
        },
        body: JSON.stringify({
          actorId: user.uid,
          status: 'completed',
        }),
      });
      await loadJobAndBids();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal update status';
      alert(message);
    }
  };

  const handleSubmission = async () => {
    if (!job || job.workerId !== user.uid) return;
    try {
      await apiFetch(`/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'x-user-id': user.uid,
        },
        body: JSON.stringify({
          actorId: user.uid,
          status: 'submitting',
        }),
      });
      await loadJobAndBids();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal update status';
      alert(message);
    }
  };

  if (loading || !job) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const isClient = job.clientId === user.uid;
  const isWorker = user.role === 'worker' && !isClient;
  const hasBid = bids.some(b => b.workerId === user.uid);
  const isAssigned = !!job.workerId;
  const isSelectedWorker = job.workerId === user.uid;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex-1 flex flex-col bg-gray-50 overflow-y-auto pb-32"
    >
      <div className="h-40 bg-blue-500 flex flex-col relative">
        <button onClick={onBack} className="absolute top-6 left-5 p-2 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-colors z-20">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="absolute top-8 right-5 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-wider">
          {job.category}
        </div>
        <div className="mt-auto p-5 text-white">
          <h1 className="text-xl font-black mb-1">{job.title}</h1>
          <div className="flex items-center gap-3 text-white/80 text-[10px] font-black uppercase tracking-wider leading-none">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{job.status}</span>
            </div>
            <div className="w-1 h-1 bg-white/40 rounded-full" />
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              <span>Rp {job.budget?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 mt-[-20px] bg-gray-50 rounded-t-[32px] overflow-hidden">
        <div className="p-5 bg-white overflow-hidden shadow-sm">
          <h2 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Deskripsi</h2>
          <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
        </div>

        {/* Action Buttons based on Status */}
        <div className="p-6 space-y-4">
          {job.status === 'open' && isWorker && !hasBid && (
            <button 
              onClick={() => setShowBidForm(!showBidForm)}
              className="w-full h-14 bg-blue-500 text-white rounded-2xl font-black text-base shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
            >
              Tawar Kerjaan
            </button>
          )}

          {job.status === 'assigned' && isClient && (
            <div className="space-y-3">
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <p className="text-sm font-medium text-orange-800">
                  Worker udah dipilih! Silahkan lakuin pembayaran biar worker langsung gas.
                </p>
              </div>
              <button 
                onClick={handlePayment}
                className="w-full h-16 bg-blue-500 text-white rounded-3xl font-black text-lg shadow-xl shadow-blue-100"
              >
                Bayar Sekarang
              </button>
            </div>
          )}

          {job.status === 'working' && isSelectedWorker && (
             <button 
                onClick={handleSubmission}
                className="w-full h-16 bg-blue-500 text-white rounded-3xl font-black text-lg shadow-xl shadow-blue-100"
             >
               Selesaiin Kerjaan
             </button>
          )}

          {job.status === 'submitting' && isClient && (
             <button 
                onClick={handleDone}
                className="w-full h-16 bg-green-500 text-white rounded-3xl font-black text-lg shadow-xl shadow-green-100"
             >
               Beresin Beresin!
             </button>
          )}

          {isAssigned && (isClient || isSelectedWorker) && (
            <button 
              onClick={onChat}
              className="w-full h-14 bg-white border-2 border-blue-100 text-blue-600 rounded-2xl font-black text-base flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Chat Personal
            </button>
          )}
        </div>

        {/* Bid Form Modal-like (simplified) */}
        <AnimatePresence>
          {showBidForm && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="px-6 mb-6"
            >
              <form onSubmit={handlePlaceBid} className="bg-white p-5 rounded-2xl border-2 border-blue-500 shadow-xl space-y-4">
                <h3 className="font-black text-lg text-gray-900">Bid Kamu</h3>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Harga Tawar (Rp)</label>
                  <input 
                    required type="number" 
                    value={bidPrice} 
                    onChange={e => setBidPrice(e.target.value)}
                    className="w-full h-12 bg-gray-50 rounded-xl px-4 font-black text-blue-600 border-none focus:ring-2 focus:ring-blue-100 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Kenapa Pilih Kamu?</label>
                  <textarea 
                    required rows={3}
                    value={bidPitch} 
                    onChange={e => setBidPitch(e.target.value)}
                    className="w-full bg-gray-50 rounded-xl p-4 text-xs text-gray-700 border-none focus:ring-2 focus:ring-blue-100 resize-none"
                  />
                </div>
                <button 
                  disabled={submittingBid}
                  className="w-full h-12 bg-blue-500 text-white rounded-xl font-black flex items-center justify-center text-sm"
                >
                  {submittingBid ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kirim Bid"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bids List */}
        <div className="p-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">List Penawar ({bids.length})</h2>
          {bids.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center">
              <p className="text-gray-400 font-medium italic">Belum ada tawarannya nih...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bids.map((bid) => (
                <div key={bid.id} className={`p-5 rounded-3xl border-2 transition-all ${job.workerId === bid.workerId ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-black text-blue-500">
                        {bid.workerName[0]}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 leading-none mb-1">{bid.workerName}</h4>
                        <div className="flex items-center gap-1 text-[10px] text-orange-500 font-black">
                          <Star className="w-3 h-3 fill-orange-500" />
                          <span>{bid.workerRating?.toFixed(1) || '5.0'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-bold uppercase mb-0.5 leading-none">Budget</p>
                      <p className="text-lg font-black text-blue-600 leading-none">Rp {bid.price.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-5 italic">"{bid.pitch}"</p>

                  {isClient && job.status === 'open' && (
                    <button 
                      onClick={() => handleSelectWorker(bid)}
                      className="w-full h-12 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-blue-600 transition-colors"
                    >
                      Pilih & Beresin 
                    </button>
                  )}

                  {job.workerId === bid.workerId && (
                    <div className="flex items-center justify-center gap-2 text-blue-600 font-black text-sm py-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Terpilih!</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
