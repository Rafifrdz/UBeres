import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Job, Bid, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, DollarSign, Clock, Star, MessageSquare, CheckCircle, AlertCircle, Loader2, User } from 'lucide-react';

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
  const [bidDays, setBidDays] = useState('7');
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
    if (!bidPrice || !bidPitch) {
      alert("Tolong isi harga dan alasan kamu!");
      return;
    }

    const priceNum = parseInt(bidPrice.replace(/[^0-9]/g, ''));
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Harga tawar harus berupa angka yang valid!");
      return;
    }

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
        price: priceNum,
        deliveryDays: parseInt(bidDays) || 7,
        pitch: bidPitch,
        }),
      });

      alert("🎉 Bid kamu berhasil dikirim!");
      setShowBidForm(false);
      setBidPrice('');
      setBidPitch('');
      await loadJobAndBids();
    } catch (error: any) {
      console.error("Bid submission error:", error);
      alert(`Gagal ngirim bid: ${error.message}`);
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
      <div className="h-52 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 flex flex-col relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-32 h-32 bg-blue-400/20 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between px-5 pt-6">
            <button onClick={onBack} className="p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl hover:bg-white/20 transition-all active:scale-95 shadow-lg">
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <div className="px-3 py-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-lg">
              <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">{job.category}</span>
            </div>
          </div>

          <div className="mt-auto p-5 pb-10">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <h1 className="text-xl font-black text-white leading-tight drop-shadow-sm">{job.title}</h1>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/10">
                  <Clock className="w-2.5 h-2.5 text-blue-200" />
                  <span className="text-[8px] font-black text-white uppercase tracking-wider">{job.status}</span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 backdrop-blur-md rounded-lg border border-green-500/20">
                  <DollarSign className="w-2.5 h-2.5 text-green-300" />
                  <span className="text-[8px] font-black text-white uppercase tracking-wider">Rp {job.budget?.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="flex-1 -mt-6 bg-gray-50 rounded-t-[32px] relative z-20 shadow-2xl overflow-hidden">
        <div className="bg-white p-6 pb-8 shadow-sm border-b border-gray-100">
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-1 h-3 bg-blue-500 rounded-full" />
            <h2 className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Deskripsi Pekerjaan</h2>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">{job.description}</p>
        </div>

        {/* About the Client */}
        {job && (
          <div className="bg-white p-6 pb-8 shadow-sm border-b border-gray-100">
            <div className="flex items-center gap-1.5 mb-5">
              <div className="w-1 h-3 bg-orange-500 rounded-full" />
              <h2 className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Tentang Client</h2>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                {job.clientPhotoURL ? (
                  <img src={job.clientPhotoURL} alt={job.clientName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500 font-bold">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 leading-none mb-1">{job.clientName || 'User UBeres'}</h3>
                <div className="flex items-center gap-1 text-[9px] text-orange-500 font-black uppercase tracking-wider">
                  <Star className="w-2.5 h-2.5 fill-orange-500" />
                  <span>5.0 Rating</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons based on Status */}
        <div className="p-5 space-y-3">
          {job.status === 'open' && isWorker && !hasBid && (
            <button
              onClick={() => setShowBidForm(!showBidForm)}
              className="w-full h-12 bg-blue-500 text-white rounded-xl font-black text-sm shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
            >
              Ambil Kerjaannya
            </button>
          )}

          {job.status === 'assigned' && isClient && (
            <div className="space-y-3">
              <div className="p-3.5 bg-orange-50 border border-orange-100 rounded-xl flex gap-3">
                <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <p className="text-[11px] font-medium text-orange-800">
                  Worker udah dipilih! Silahkan lakuin pembayaran biar worker langsung gas.
                </p>
              </div>
              <button
                onClick={handlePayment}
                className="w-full h-14 bg-blue-500 text-white rounded-2xl font-black text-base shadow-xl shadow-blue-100"
              >
                Bayar Sekarang
              </button>
            </div>
          )}

          {job.status === 'working' && isSelectedWorker && (
            <button
              onClick={handleSubmission}
              className="w-full h-14 bg-blue-500 text-white rounded-2xl font-black text-base shadow-xl shadow-blue-100"
            >
              Selesaiin Kerjaan
            </button>
          )}

          {job.status === 'submitting' && isClient && (
            <button
              onClick={handleDone}
              className="w-full h-14 bg-green-500 text-white rounded-2xl font-black text-base shadow-xl shadow-green-100"
            >
              Beresin Beresin!
            </button>
          )}

          {isAssigned && (isClient || isSelectedWorker) && (
            <button
              onClick={onChat}
              className="w-full h-12 bg-white border-2 border-blue-100 text-blue-600 rounded-xl font-black text-sm flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chat Personal
            </button>
          )}
        </div>

        {/* Bid Form Modal-like (simplified) */}
        <AnimatePresence>
          {showBidForm && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="px-5 mb-6"
            >
              <div className="bg-white rounded-[24px] p-5 shadow-2xl shadow-blue-100 border border-blue-50 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />

                <h3 className="font-black text-lg text-gray-900 mb-1">Tawar Kerjaan Ini</h3>
                <p className="text-[10px] text-gray-400 font-medium mb-5">
                  Berikan penawaran terbaikmu untuk membantu client.
                </p>

                <form onSubmit={handlePlaceBid} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black text-gray-900 uppercase tracking-widest px-1">Harga Tawar</label>
                      <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px]">Rp</div>
                        <input
                          required type="number"
                          placeholder="50.000"
                          value={bidPrice}
                          onChange={e => setBidPrice(e.target.value)}
                          className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl pl-8 pr-3 font-black text-blue-600 focus:border-blue-500 focus:bg-white transition-all text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black text-gray-900 uppercase tracking-widest px-1">Durasi Kerja</label>
                      <div className="relative">
                        <input
                          required type="number"
                          placeholder="7"
                          value={bidDays}
                          onChange={e => setBidDays(e.target.value)}
                          className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-3 font-black text-gray-900 focus:border-blue-500 focus:bg-white transition-all text-xs outline-none"
                        />
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[8px] font-black text-gray-400">Hari</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[8px] font-black text-gray-900 uppercase tracking-widest">Kenapa kamu?</label>
                      <span className="text-[8px] font-bold text-gray-400">(min 5 karakter)</span>
                    </div>
                    <textarea
                      placeholder="Jelasin kenapa client harus pilih kamu..."
                      value={bidPitch}
                      onChange={e => setBidPitch(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3.5 text-xs text-gray-700 focus:border-blue-500 focus:bg-white transition-all resize-none h-24 outline-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingBid}
                      className="h-12 px-6 bg-blue-500 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 text-[11px] uppercase tracking-widest"
                    >
                      <span>{submittingBid ? "Mengirim..." : "Kirim Tawaran"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bids List */}
        <div className="p-6">
          <div className="flex items-center gap-1.5 mb-6">
            <div className="w-1 h-3 bg-blue-500 rounded-full" />
            <h2 className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">List Penawar ({bids.length})</h2>
          </div>
          {bids.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
              <p className="text-[11px] text-gray-400 font-medium italic">Belum ada tawarannya nih...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bids.map((bid) => (
                <div key={bid.id} className={`p-4 rounded-2xl border-2 transition-all ${job.workerId === bid.workerId ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-black text-blue-500 text-xs">
                        {bid.workerName[0]}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-gray-900 leading-none mb-0.5">{bid.workerName}</h4>
                        <div className="flex items-center gap-1 text-[9px] text-orange-500 font-black">
                          <Star className="w-2.5 h-2.5 fill-orange-500" />
                          <span>{bid.workerRating?.toFixed(1) || '5.0'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] text-gray-400 font-black uppercase mb-0.5 tracking-tighter leading-none">{bid.deliveryDays} Hari</p>
                      <p className="text-base font-black text-blue-600 leading-none">Rp {bid.price.toLocaleString()}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 mb-4 italic">"{bid.pitch}"</p>

                  {isClient && job.status === 'open' && (
                    <button
                      onClick={() => handleSelectWorker(bid)}
                      className="w-full h-10 bg-gray-900 text-white rounded-xl font-black text-xs hover:bg-blue-600 transition-colors uppercase tracking-widest"
                    >
                      Pilih & Beresin
                    </button>
                  )}

                  {job.workerId === bid.workerId && (
                    <div className="flex items-center justify-center gap-1.5 text-blue-600 font-black text-[11px] py-1">
                      <CheckCircle className="w-3.5 h-3.5" />
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
