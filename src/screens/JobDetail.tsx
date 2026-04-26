import React, { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { apiFetch } from '../lib/api';
import { Job, Bid, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, DollarSign, Clock, Star, MessageSquare, CheckCircle, AlertCircle, Loader2, User, ShieldCheck, QrCode, X, Upload, AlertTriangle, Edit3, Plus } from 'lucide-react';

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
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewData, setReviewData] = useState<any>(null);
  const [justSubmittedReview, setJustSubmittedReview] = useState(false);
  const [showQRIS, setShowQRIS] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  const loadJobAndBids = async () => {
    try {
      const [jobRes, bidsRes, reviewRes] = await Promise.all([
        apiFetch<{ data: Job }>(`/jobs/${jobId}`),
        apiFetch<{ data: Bid[] }>(`/jobs/${jobId}/bids`),
        apiFetch<{ data: any[] }>(`/jobs/${jobId}/reviews`).catch(() => ({ data: [] }))
      ]);

      setJob(jobRes.data);
      setBids(bidsRes.data || []);
      
      const existingReview = reviewRes.data?.find((r: any) => r.reviewerId === user.uid);
      if (existingReview) {
        setReviewData(existingReview);
        setRating(existingReview.rating);
        setReview(existingReview.comment);
      }
    } catch (error) {
      console.error('Load detail error:', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        await loadJobAndBids();
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [jobId]);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(bidPrice.replace(/[^0-9]/g, ''));
    setSubmittingBid(true);
    try {
      await apiFetch(`/jobs/${jobId}/bids`, {
        method: 'POST',
        headers: { 'x-user-id': user.uid },
        body: JSON.stringify({
          workerId: user.uid,
          workerName: user.displayName,
          workerRating: user.rating || 5,
          price: priceNum || job?.budget,
          deliveryDays: parseInt(bidDays) || 7,
          pitch: bidPitch,
        }),
      });
      setShowBidForm(false);
      await loadJobAndBids();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmittingBid(false);
    }
  };

  const confirmPayment = async () => {
    if (!job || job.clientId !== user.uid) return;
    setConfirmingPayment(true);
    try {
      await apiFetch(`/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'x-user-id': user.uid },
        body: JSON.stringify({ actorId: user.uid, status: 'paid' }),
      });
      setShowQRIS(false);
      setShowPaymentSuccess(true);
      setTimeout(() => setShowPaymentSuccess(false), 3000);
      await loadJobAndBids();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await apiFetch(`/jobs/${jobId}/review`, {
        method: 'POST',
        headers: { 'x-user-id': user.uid },
        body: JSON.stringify({ rating, comment: review, clientId: user.uid }),
      });
      setJustSubmittedReview(true);
      await loadJobAndBids();
      setTimeout(() => setJustSubmittedReview(false), 3000);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSelectWorker = async (bid: Bid) => {
    try {
      await apiFetch(`/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'x-user-id': user.uid },
        body: JSON.stringify({ actorId: user.uid, status: 'assigned', workerId: bid.workerId }),
      });
      await loadJobAndBids();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDone = async () => {
    try {
      await apiFetch(`/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'x-user-id': user.uid },
        body: JSON.stringify({ actorId: user.uid, status: 'completed' }),
      });
      await loadJobAndBids();
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading || !job) {
    return <div className="flex-1 flex items-center justify-center bg-white"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  const isClient = job.clientId === user.uid;
  const isWorker = user.role === 'worker';
  
  // Debug: console.log('Current User UID:', user.uid, 'Job Client ID:', job.clientId, 'isClient:', isClient);
  const hasBid = bids.some(b => b.workerId === user.uid);
  const isAssigned = !!job.workerId;
  const isSelectedWorker = job.workerId === user.uid;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col bg-gray-50 overflow-y-auto pb-32">
      <div className="h-52 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 flex flex-col relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col h-full p-5">
          <div className="flex items-center justify-between pt-1">
            <button onClick={onBack} className="p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <div className="px-3 py-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full">
              <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">{job.category}</span>
            </div>
          </div>
          <div className="mt-auto">
            <h1 className="text-xl font-black text-white leading-tight drop-shadow-sm mb-2">{job.title}</h1>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 text-[8px] font-black text-white uppercase">{job.status}</span>
              <span className="px-2.5 py-1 bg-green-500/20 backdrop-blur-md rounded-lg border border-green-500/20 text-[8px] font-black text-white uppercase tracking-wider">Rp {job.budget?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 -mt-6 bg-gray-50 rounded-t-[32px] relative z-20 shadow-2xl overflow-hidden">
        <div className="bg-white p-6 pb-8 shadow-sm border-b border-gray-100">
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-1 h-3 bg-blue-500 rounded-full" />
            <h2 className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Deskripsi</h2>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">{job.description}</p>
        </div>

        <div className="p-5 space-y-3">
          {job.status === 'open' && isWorker && !hasBid && (
            <button onClick={() => setShowBidForm(true)} className="w-full h-12 bg-blue-500 text-white rounded-xl font-black text-sm shadow-lg active:scale-95 transition-all">Ambil Kerjaannya</button>
          )}

          {job.status === 'assigned' && isClient && (
            <div className="bg-blue-900 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
              <h3 className="font-black text-sm uppercase mb-4">Amanin Pembayaran</h3>
              <p className="text-[11px] text-blue-100 mb-6">Dana ditahan di sistem sampai kerjaan selesai.</p>
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl mb-6">
                <p className="text-[10px] font-black">Total</p>
                <p className="text-xl font-black">Rp {job.budget?.toLocaleString()}</p>
              </div>
              <button onClick={() => setShowQRIS(true)} className="w-full h-12 bg-white text-blue-900 rounded-2xl font-black text-xs uppercase active:scale-95 transition-all">Bayar Sekarang</button>
            </div>
          )}

          {job.status === 'paid' && (
            <div className="bg-white border-2 border-blue-50 rounded-[32px] p-6 shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Clock className="w-6 h-6 animate-pulse" /></div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm uppercase">Pengerjaan Dimulai</h3>
                  <p className="text-[10px] font-bold text-gray-400">Worker sedang memproses tugas kamu.</p>
                </div>
              </div>
              <div className="space-y-3">
                {isClient ? (
                  <button onClick={handleDone} className="w-full h-14 bg-green-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">Selesai & Bayar</button>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-4 text-center"><p className="text-[11px] text-gray-500 font-medium">Kamu sedang mengerjakan tugas ini.</p></div>
                )}
                <button onClick={onChat} className="w-full h-12 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase"><MessageSquare className="w-4 h-4 mx-auto" /></button>
              </div>
            </div>
          )}

          {isAssigned && (isClient || isSelectedWorker) && job.status !== 'completed' && (
             <button onClick={onChat} className="w-full h-12 bg-white border-2 border-blue-100 text-blue-600 rounded-xl font-black text-sm flex items-center justify-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" /> Chat Personal
             </button>
          )}
        </div>

        {/* Rating Section */}
        {job.status === 'completed' && isClient && (
          <div className="px-5 mb-6">
            <AnimatePresence mode="wait">
              {justSubmittedReview ? (
                <motion.div key="success-rating" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-50 border-2 border-green-100 rounded-[32px] p-8 text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-[24px] flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-green-100"><CheckCircle className="w-8 h-8" /></div>
                  <h3 className="font-black text-gray-900 text-lg mb-1">Berhasil Terkirim!</h3>
                  <p className="text-[11px] text-green-700 font-medium">Makasih sudah ngasih feedback!</p>
                </motion.div>
              ) : reviewData ? (
                <motion.div key="final-rating" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-xl shadow-gray-200/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2"><div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-500"><CheckCircle className="w-5 h-5" /></div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ulasan Kamu</p></div>
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-[8px] font-black text-gray-400 uppercase">Sudah Dinilai</span>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={`w-5 h-5 ${star <= rating ? 'fill-orange-500 text-orange-500' : 'text-gray-100'}`} />))}
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl"><p className="text-xs text-gray-700 font-medium italic">"{review}"</p></div>
                </motion.div>
              ) : (
                <motion.div key="rating-form" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-orange-50 rounded-[32px] p-6 border-2 border-orange-100">
                  <h3 className="font-black text-gray-900 text-center mb-1">Rating & Ulasan</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-5">
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (<button key={star} type="button" onClick={() => setRating(star)} className="p-1"><Star className={`w-8 h-8 ${star <= rating ? 'fill-orange-500 text-orange-500' : 'text-gray-200'}`} /></button>))}
                      </div>
                      <textarea placeholder="Tulis ulasan..." value={review} onChange={(e) => setReview(e.target.value)} className="w-full bg-white border-2 border-orange-100 rounded-2xl p-4 text-xs h-24 outline-none resize-none" />
                      <button type="submit" disabled={submittingReview} className="w-full h-14 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-200 disabled:opacity-50">
                        {submittingReview ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Kirim Rating'}
                      </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Bids List */}
        <div className="p-6">
          <h2 className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-6">List Penawar ({bids.length})</h2>
          <div className="space-y-3">
            {bids.map((bid) => (
              <div key={bid.id} className={`p-4 rounded-2xl border-2 ${job.workerId === bid.workerId ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-50'}`}>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-black text-blue-500 text-xs">{bid.workerName[0]}</div>
                    <div><h4 className="text-xs font-black text-gray-900">{bid.workerName}</h4><div className="flex items-center gap-1 text-[9px] text-orange-500 font-black"><Star className="w-2.5 h-2.5 fill-orange-500" /><span>{bid.workerRating?.toFixed(1)}</span></div></div>
                  </div>
                  <p className="text-base font-black text-blue-600">Rp {bid.price.toLocaleString()}</p>
                </div>
                <p className="text-[11px] text-gray-500 mb-4">"{bid.pitch}"</p>
                {isClient && job.status === 'open' && (
                  <button onClick={() => handleSelectWorker(bid)} className="w-full h-10 bg-gray-900 text-white rounded-xl font-black text-xs uppercase">Pilih Worker</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bid Form Modal */}
      <AnimatePresence>
        {showBidForm && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBidForm(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-md bg-white rounded-t-[40px] shadow-2xl p-8 pb-10">
              <h3 className="font-black text-lg text-gray-900 mb-6">Tawar Kerjaan</h3>
              <form onSubmit={handlePlaceBid} className="space-y-5">
                <input type="number" placeholder="Harga" value={bidPrice} onChange={e => setBidPrice(e.target.value)} className="w-full h-14 bg-gray-50 rounded-2xl px-4 font-black outline-none border-2 border-transparent focus:border-blue-100" />
                <textarea placeholder="Alasan..." value={bidPitch} onChange={e => setBidPitch(e.target.value)} className="w-full bg-gray-50 rounded-2xl p-4 text-xs h-24 outline-none resize-none border-2 border-transparent focus:border-blue-100" />
                <button type="submit" disabled={submittingBid} className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black uppercase shadow-lg active:scale-95">{submittingBid ? '...' : 'Kirim Bid'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQRIS && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-xs rounded-[40px] p-8 text-center">
              <button onClick={() => setShowQRIS(false)} className="absolute top-6 right-6 text-gray-400"><X /></button>
              <h2 className="font-black text-xl mb-6">QRIS PAY</h2>
              <div className="bg-gray-50 p-6 rounded-[32px] mb-6"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png" className="w-full aspect-square object-contain" /></div>
              <p className="text-2xl font-black text-blue-600 mb-8">Rp {job.budget?.toLocaleString()}</p>
              <button onClick={confirmPayment} disabled={confirmingPayment} className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black uppercase">{confirmingPayment ? '...' : 'Saya Sudah Bayar'}</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
