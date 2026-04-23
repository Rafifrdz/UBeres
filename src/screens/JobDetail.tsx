import React, { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { apiFetch } from '../lib/api';
import { Job, Bid, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, DollarSign, Clock, Star, MessageSquare, CheckCircle, AlertCircle, Loader2, User, ShieldCheck, QrCode, X, Upload, AlertTriangle } from 'lucide-react';

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
  const [bidPrice, setBidPrice] = useState(job?.budget?.toString() || '');
  const [bidDays, setBidDays] = useState('7');
  const [bidPitch, setBidPitch] = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [showQRIS, setShowQRIS] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [disputeProof, setDisputeProof] = useState<string | null>(null);

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

  const handlePayment = () => {
    setShowQRIS(true);
  };

  const confirmPayment = async () => {
    if (!job || job.clientId !== user.uid) return;
    setConfirmingPayment(true);
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
      setShowQRIS(false);
      setShowPaymentSuccess(true);
      setTimeout(() => setShowPaymentSuccess(false), 3000);
      await loadJobAndBids();
    } catch (error) {
      alert('Gagal melakukan pembayaran escrow');
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    // Simulate API call for review
    setTimeout(() => {
      setSubmittingReview(false);
      setReviewSubmitted(true);
    }, 1500);
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

  const handleDispute = async () => {
    if (!job || !disputeReason) return;
    setSubmittingDispute(true);
    try {
      await apiFetch(`/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'x-user-id': user.uid,
        },
        body: JSON.stringify({
          actorId: user.uid,
          status: 'disputed',
          reason: disputeReason,
        }),
      });
      setShowDisputeModal(false);
      await loadJobAndBids();
    } catch (error) {
      alert('Gagal mengajukan komplain');
    } finally {
      setSubmittingDispute(false);
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
  const isGuest = user.uid.startsWith('local-');

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
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <div className="bg-blue-900 rounded-[32px] p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-white/10">
                    <ShieldCheck className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wider">Amanin Pembayaran</h3>
                    <p className="text-[9px] font-bold text-blue-300">Escrow Payment Protection</p>
                  </div>
                </div>
                
                <p className="text-[11px] text-blue-100 font-medium leading-relaxed mb-6">
                  Dana bakal ditahan sistem UBeres dulu. Worker baru bisa narik kalau kamu sudah konfirmasi kerjaan selesai.
                </p>

                <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/5 mb-6">
                  <p className="text-[10px] font-black uppercase">Total Bayar</p>
                  <p className="text-xl font-black text-blue-200">Rp {job.budget?.toLocaleString()}</p>
                </div>

                <button 
                  onClick={handlePayment}
                  className="w-full h-12 bg-white text-blue-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                >
                  Bayar ke Escrow Sekarang
                </button>
              </div>
            </motion.div>
          )}

          {/* Paid / Working Status UI */}
          {job.status === 'paid' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 mb-6"
            >
              <div className="bg-white border-2 border-blue-50 rounded-[32px] p-6 shadow-xl shadow-blue-500/5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 relative">
                    <Clock className="w-6 h-6" />
                    <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-sm uppercase tracking-tight">Worker Sedang Mengerjakan</h3>
                    <p className="text-[10px] font-bold text-gray-400">Estimasi selesai: Hari ini</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {isClient ? (
                    <button 
                      onClick={handleDone}
                      className="w-full h-14 bg-green-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Konfirmasi Selesai & Lepas Dana
                    </button>
                  ) : (
                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                      <p className="text-[11px] text-gray-500 font-medium">Kamu sedang mengerjakan tugas ini. Klik tombol di bawah jika butuh bantuan atau diskusi.</p>
                    </div>
                  )}

                  <button
                    onClick={onChat}
                    className="w-full h-12 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Diskusi Pengerjaan
                  </button>

                  {isClient && (
                    <button 
                      onClick={() => setShowDisputeModal(true)}
                      className="w-full py-2 text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                    >
                      Ajukan Refund / Komplain
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {job.status === 'disputed' && (
            <div className="px-5 mb-6">
              <div className="bg-red-50 border-2 border-red-100 rounded-[32px] p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-black text-gray-900 text-sm mb-1 uppercase tracking-tight">Dalam Investigasi</h3>
                <p className="text-[10px] text-red-600 font-medium mb-4">Pengaduan kamu sedang ditinjau oleh tim UBeres. Dana tetap aman di escrow.</p>
                <button
                  onClick={onChat}
                  className="w-full h-10 bg-white border border-red-200 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  Chat Admin Support
                </button>
              </div>
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

        {/* Review & Rating Form */}
        {job.status === 'completed' && isClient && !reviewSubmitted && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-5 mb-6"
          >
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-[32px] p-6 border-2 border-orange-100 shadow-xl shadow-orange-500/5">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-lg mb-4">
                  <Star className="w-7 h-7 fill-orange-500" />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-1">Kerjaan Selesai!</h3>
                <p className="text-[11px] text-gray-500 font-medium px-4">Bantu {job.workerName} ningkatin reputasinya dengan kasih rating & ulasan.</p>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-5">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform active:scale-90"
                    >
                      <Star className={`w-8 h-8 ${star <= rating ? 'fill-orange-500 text-orange-500' : 'text-gray-200'}`} />
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-1">Ulasan Singkat</label>
                  <textarea
                    placeholder="Contoh: Mantap, kerjaan cepet banget kelar!"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="w-full bg-white border-2 border-orange-100 rounded-2xl p-4 text-xs text-gray-700 focus:border-orange-400 transition-all resize-none h-24 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full h-12 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submittingReview ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Kirim Rating"
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {reviewSubmitted && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 mb-6"
          >
            <div className="bg-green-50 border-2 border-green-100 rounded-[32px] p-6 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-green-100">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-black text-gray-900 text-sm mb-1">Makasih Bro!</h3>
              <p className="text-[10px] text-green-700 font-medium">Ulasan kamu sudah terkirim. Ini ngebantu banget buat komunitas UBeres!</p>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {showBidForm && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="px-5 mb-6"
            >
              {isGuest ? (
                <div className="bg-orange-50 border-2 border-orange-100 rounded-[24px] p-6 text-center">
                   <h3 className="font-black text-orange-900 text-sm mb-1">Eits, Login Dulu!</h3>
                   <p className="text-[10px] text-orange-700 font-medium mb-4">Kamu harus login biar bisa ngebid dan dapetin cuan beneran.</p>
                   <button onClick={() => window.location.reload()} className="h-10 px-6 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Login Sekarang</button>
                </div>
              ) : (
                <div className="bg-white rounded-[24px] p-5 shadow-2xl shadow-blue-100 border border-blue-50 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />

                <h3 className="font-black text-lg text-gray-900 mb-1">Tawar Kerjaan Ini</h3>
                <p className="text-[10px] text-gray-400 font-medium mb-5">
                  Berikan penawaran terbaikmu untuk membantu client.
                </p>

                <form onSubmit={handlePlaceBid} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5 flex-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Harga Tawaran (Rp)</label>
                      <div className="relative group">
                        <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[10px] ${job.isFixedPrice ? 'text-gray-300' : 'text-gray-400'}`}>Rp</div>
                        <input
                          type="number"
                          placeholder="50.000"
                          value={job.isFixedPrice ? job.budget : bidPrice}
                          onChange={e => setBidPrice(e.target.value)}
                          disabled={job.isFixedPrice}
                          className={`w-full h-12 rounded-xl pl-8 pr-3 font-black transition-all text-xs outline-none border-2 ${
                            job.isFixedPrice ? 'bg-gray-100 border-gray-100 text-gray-400' : 'bg-gray-50 border-gray-100 text-blue-600 focus:border-blue-500 focus:bg-white'
                          }`}
                        />
                      </div>
                      {job.isFixedPrice && (
                        <p className="text-[8px] text-blue-500 font-bold px-1 italic leading-tight">* Client menetapkan harga pas</p>
                      )}
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
                      <span>{submittingBid ? "Mengirim..." : (job.isFixedPrice ? "Ambil Kerjaan" : "Kirim Tawaran")}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
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
                      onClick={() => !isGuest && handleSelectWorker(bid)}
                      disabled={isGuest}
                      className={`w-full h-10 rounded-xl font-black text-xs transition-colors uppercase tracking-widest ${isGuest ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 text-white hover:bg-blue-600'}`}
                    >
                      {isGuest ? 'Login untuk Pilih' : 'Pilih & Beresin'}
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

        {/* QRIS Modal Overlay */}
        <AnimatePresence>
          {showQRIS && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-xs rounded-[40px] overflow-hidden shadow-2xl relative"
              >
                <button 
                  onClick={() => setShowQRIS(false)}
                  className="absolute top-6 right-6 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 active:scale-90 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="p-8 pt-10 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <QrCode className="w-6 h-6 text-blue-600" />
                    <span className="font-black text-xl text-gray-900 tracking-tighter">QRIS PAY</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">UBeres Escrow System</p>
                  
                  <div className="bg-gray-50 p-6 rounded-[32px] border-2 border-dashed border-gray-200 mb-6">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png" 
                      alt="QRIS Code" 
                      className="w-full aspect-square object-contain mix-blend-multiply opacity-80"
                    />
                  </div>

                  <div className="space-y-1 mb-8">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Pembayaran</p>
                    <p className="text-2xl font-black text-blue-600">Rp {job.budget?.toLocaleString()}</p>
                  </div>

                  <button 
                    onClick={confirmPayment}
                    disabled={confirmingPayment}
                    className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {confirmingPayment ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Saya Sudah Bayar
                      </>
                    )}
                  </button>
                  <p className="text-[9px] text-gray-400 font-medium mt-4">
                    Konfirmasi otomatis dalam beberapa menit setelah transfer.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dispute Modal */}
        <AnimatePresence>
          {showDisputeModal && (
            <div className="fixed inset-0 z-[60] flex items-end justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDisputeModal(false)}
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
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Ajukan Pengaduan</h2>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Refund Dana Escrow</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Alasan Pengaduan</label>
                    <textarea 
                      placeholder="Jelaskan kenapa kamu minta refund... (misal: Worker tidak bisa dihubungi)"
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-red-100 focus:bg-white rounded-2xl p-4 text-xs font-medium min-h-[120px] transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Bukti Foto / Screenshot</label>
                    <button 
                      onClick={() => setDisputeProof("simulated_proof.jpg")}
                      className="w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-red-200 hover:bg-red-50/30 transition-all group"
                    >
                      {disputeProof ? (
                        <div className="flex flex-col items-center gap-1">
                          <CheckCircle className="w-6 h-6 text-green-500" />
                          <span className="text-[10px] font-bold text-gray-500">Bukti Terlampir</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-gray-300 group-hover:text-red-400" />
                          <span className="text-[10px] font-bold text-gray-400">Klik untuk upload bukti</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setShowDisputeModal(false)}
                      className="flex-1 h-12 bg-gray-50 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest"
                    >
                      Batal
                    </button>
                    <button 
                      disabled={!disputeReason || submittingDispute}
                      onClick={handleDispute}
                      className="flex-[2] h-12 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submittingDispute ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Kirim Pengaduan"
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Payment Success Overlay */}
        <AnimatePresence>
          {showPaymentSuccess && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white/90 backdrop-blur-xl z-[200] flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="w-80 h-80 -mt-20">
                <DotLottieReact
                  src="https://lottie.host/8591f1a5-8c7b-4a52-b43e-7a4f9a0c8b9a/P8HqXoZlXm.lottie"
                  autoplay
                />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-2xl font-black text-gray-900 mb-2">Pembayaran Sukses!</h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Dana kamu sudah aman di Escrow UBeres.</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
