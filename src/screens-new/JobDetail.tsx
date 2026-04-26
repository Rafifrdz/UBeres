import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../lib/api';
import { Job, Bid } from '../types';
import { BottomSheet } from '../components/BottomSheet';
import { Loading } from '../components/Loading';
import { useToast } from '../components/Toast';
import { ArrowLeft, Calendar, DollarSign, Tag, Users, Sparkles, MessageCircle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const statusConfig: Record<string, { color: string; label: string }> = {
  open: { color: 'bg-blue-100 text-blue-700', label: 'Terbuka' },
  assigned: { color: 'bg-amber-100 text-amber-700', label: 'Ditugaskan' },
  paid: { color: 'bg-green-100 text-green-700', label: 'Dibayar' },
  working: { color: 'bg-indigo-100 text-indigo-700', label: 'Dikerjakan' },
  submitting: { color: 'bg-purple-100 text-purple-700', label: 'Menunggu Review' },
  completed: { color: 'bg-gray-100 text-gray-700', label: 'Selesai' },
};

const categoryColors: Record<string, string> = {
  'Semua': 'bg-gray-100 text-gray-700',
  'Desain': 'bg-blue-100 text-blue-700',
  'Coding': 'bg-purple-100 text-purple-700',
  'Penulisan': 'bg-green-100 text-green-700',
  'Umum': 'bg-amber-100 text-amber-700',
  'Bahasa': 'bg-rose-100 text-rose-700',
};

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useApp();
  const { showToast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [showBidSheet, setShowBidSheet] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidPitch, setBidPitch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBidForConfirm, setSelectedBidForConfirm] = useState<Bid | null>(null);
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadJobAndBids();
    }
  }, [id]);

  const loadJobAndBids = async () => {
    try {
      const jobResponse = await apiFetch<{ data: Job }>(`/jobs/${id}`);
      setJob(jobResponse.data);

      const bidsResponse = await apiFetch<{ data: Bid[] }>(`/jobs/${id}/bids`);
      setBids(bidsResponse.data || []);
    } catch (error) {
      console.error('Failed to load job details:', error);
      showToast('Gagal memuat detail tugas', 'error');
    }
  };

  const handleSubmitBid = async () => {
    if (!user || !job || !bidAmount || !bidPitch || bidPitch.length < 10) {
      showToast('Lengkapi semua field (Pitch min 10 karakter)', 'error');
      return;
    }

    const existingBid = bids.find(b => b.workerId === user.uid);
    if (existingBid) {
      showToast('Kamu sudah memasukkan bid', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiFetch<{ data: Bid }>(`/jobs/${job.id}/bids`, {
        method: 'POST',
        body: JSON.stringify({
          workerId: user.uid,
          workerName: user.displayName,
          price: parseInt(bidAmount),
          deliveryDays: 3,
          pitch: bidPitch,
        }),
      });

      setBids([...bids, response.data]);
      setShowBidSheet(false);
      setBidAmount('');
      setBidPitch('');
      showToast('Bid berhasil dikirim!', 'success');
    } catch (error: any) {
      console.error('Failed to submit bid:', error);
      showToast(error.message || 'Gagal mengirim bid', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvgBid = () => {
    if (bids.length === 0) return 0;
    return Math.round(bids.reduce((sum, bid) => sum + (bid.price || 0), 0) / bids.length);
  };

  const getCompetitivePercentage = () => {
    const avg = getAvgBid();
    if (!bidAmount || avg === 0) return 0;
    return Math.round(((parseInt(bidAmount) - avg) / avg) * 100);
  };

  const handleSelectWorker = async (bid: Bid) => {
    try {
      setIsSubmitting(true);
      await apiFetch(`/jobs/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          actorId: user?.uid, 
          status: 'assigned', 
          workerId: bid.workerId 
        }),
      });
      showToast(`Berhasil memilih ${bid.workerName}!`, 'success');
      setShowConfirmSheet(false);
      loadJobAndBids(); // Refresh data
    } catch (error: any) {
      console.error('Failed to select worker:', error);
      showToast(error.message || 'Gagal memilih worker', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-6">
        <Loading label="Mengambil detail tugas..." />
      </div>
    );
  }

  const isClient = user?.uid === job.clientId;
  const isWorker = user?.role === 'worker';
  const userBid = bids.find(b => b.workerId === user?.uid);

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-24">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4 sticky top-0 z-10 border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-semibold text-gray-900">Detail Tugas</h1>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Status & Title */}
        <div>
          <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${statusConfig[job.status].color}`}>
            {statusConfig[job.status].label}
          </span>
          <h2 className="text-xl font-bold text-gray-900 mt-2 mb-3">{job.title}</h2>

          {/* Client Info */}
          <div className="flex items-center gap-2.5">
            <img
              src={job.isAnonymous ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=anon&backgroundColor=b6e3f4' : (job.clientPhotoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${job.clientId}`)}
              alt="Client"
              className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-100"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">{job.isAnonymous ? 'Klien Anonim' : (job.clientName || 'Client UB')}</p>
              <p className="text-[11px] text-gray-500">
                Dibuat {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: localeId })}
              </p>
            </div>
          </div>
        </div>

        {/* AI Summary - More compact */}
        <div className="bg-[#6366F1]/5 border border-[#6366F1]/10 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#6366F1]" />
            <span className="text-[11px] font-bold text-[#6366F1] tracking-wider">AI Insight</span>
          </div>
          <p className="text-[13px] text-gray-700 leading-relaxed">
            {job.aiInsight ? (
              job.aiInsight
            ) : (
              <>
                Tugas ini membutuhkan <span className="font-semibold">{job.category}</span> dengan budget <span className="font-semibold text-[#6366F1]">Rp {job.budget.toLocaleString('id-ID')}</span>.
                Target selesai: {new Date(job.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}.
              </>
            )}
          </p>
        </div>

        {/* Stats Grid - Smaller cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-50">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold tracking-wider">Budget</span>
            </div>
            <p className="text-[15px] font-bold text-[#6366F1]">
              Rp {job.budget.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-50">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold tracking-wider">Deadline</span>
            </div>
            <p className="text-[15px] font-bold text-gray-800">
              {new Date(job.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-50">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <Tag className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold tracking-wider">Kategori</span>
            </div>
            <p className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${categoryColors[job.category]}`}>
              {job.category}
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-50">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <Users className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold tracking-wider">Bids</span>
            </div>
            <p className="text-[15px] font-bold text-gray-800">{bids.length}</p>
          </div>
        </div>

        {/* Description - Tighter padding */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-50">
          <h3 className="text-xs font-bold text-gray-400 tracking-wider mb-2">Deskripsi Tugas</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
        </div>

        {/* Images */}
        {job.images && job.images.length > 0 && (
          <div className="bg-white rounded-[16px] p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Lampiran Gambar</h3>
            <div className="grid grid-cols-2 gap-2">
              {job.images.map((img, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-[12px] overflow-hidden border border-gray-100 cursor-pointer"
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img}
                    alt={`Lampiran ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bids List */}
        {bids.length > 0 && (
          <div className="bg-white rounded-[16px] p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Bid ({bids.length})</h3>
            <div className="space-y-3">
              {bids.map(bid => (
                <div key={bid.id} className="border border-gray-100 rounded-[10px] p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${bid.workerId}`}
                        alt="Worker"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${bid.workerId}`;
                        }}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{bid.workerName || 'Worker UB'}</p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true, locale: localeId })}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      Rp {(bid.price || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{bid.pitch}</p>
                  
                  {isClient && job.status === 'open' && (
                    <button
                      onClick={() => {
                        setSelectedBidForConfirm(bid);
                        setShowConfirmSheet(true);
                      }}
                      className="w-full py-2 bg-[#6366F1] text-white text-xs font-bold rounded-lg hover:bg-[#4F46E5] transition-all active:scale-[0.98]"
                    >
                      Pilih Worker
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      {isWorker && job.status === 'open' && !userBid && (
        <div className="fixed bottom-0.5 left-0 right-0 z-20 pointer-events-none px-4">
          <div className="max-w-[430px] mx-auto bg-white/80 backdrop-blur-lg border border-white/50 p-4 rounded-2xl shadow-xl shadow-black/5 flex gap-3 pointer-events-auto">
            <button
              onClick={() => navigate(`/chat/${job.id}`)}
              className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
            >
              <MessageCircle className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={() => setShowBidSheet(true)}
              className="flex-1 bg-[#6366F1] text-white rounded-xl py-3 font-semibold hover:bg-[#4F46E5] transition-all shadow-md shadow-[#6366F1]/20 active:scale-[0.98]"
            >
              Buat Penawaran
            </button>
          </div>
        </div>
      )}

      {/* Bid Bottom Sheet */}
      <BottomSheet isOpen={showBidSheet} onClose={() => setShowBidSheet(false)}>
        <div className="px-6 pb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Buat Penawaran</h3>

          <div className="space-y-4">
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harga Penawaran
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={e => setBidAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-gray-200 rounded-[10px] pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                />
              </div>
              {bidAmount && getAvgBid() > 0 && (
                <p className={`text-xs mt-1 ${getCompetitivePercentage() < 0 ? 'text-gray-600' : 'text-orange-600'}`}>
                  {getCompetitivePercentage() < 0 ? `${Math.abs(getCompetitivePercentage())}% lebih murah` : `${getCompetitivePercentage()}% lebih mahal`} dari rata-rata
                </p>
              )}
            </div>

            {/* Pitch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pitch (Min 10 karakter)
              </label>
              <textarea
                value={bidPitch}
                onChange={e => setBidPitch(e.target.value)}
                placeholder="Jelaskan kenapa kamu cocok untuk tugas ini..."
                rows={5}
                className="w-full bg-white border border-gray-200 rounded-[10px] px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              />
              <p className="text-xs text-gray-500 text-right mt-1">{bidPitch.length}/10</p>
            </div>

            <button
              onClick={handleSubmitBid}
              disabled={isSubmitting || !bidAmount || bidPitch.length < 10}
              className="w-full bg-[#6366F1] text-white rounded-[10px] py-3 font-medium hover:bg-[#4F46E5] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Penawaran'}
            </button>
          </div>
        </div>
      </BottomSheet>
      
      {/* Selection Confirmation Bottom Sheet */}
      <BottomSheet isOpen={showConfirmSheet} onClose={() => setShowConfirmSheet(false)}>
        <div className="px-6 pb-8 text-center">
          <div className="w-20 h-20 bg-[#6366F1]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-[#6366F1]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Pilih Worker?</h3>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Apakah kamu yakin ingin memilih <span className="font-bold text-gray-900">{selectedBidForConfirm?.workerName}</span> untuk mengerjakan tugas ini?
          </p>

          <div className="space-y-3">
            <button
              onClick={() => selectedBidForConfirm && handleSelectWorker(selectedBidForConfirm)}
              disabled={isSubmitting}
              className="w-full bg-[#6366F1] text-white rounded-xl py-3.5 font-bold shadow-lg shadow-[#6366F1]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Ya, Pilih Sekarang'
              )}
            </button>
            <button
              onClick={() => setShowConfirmSheet(false)}
              disabled={isSubmitting}
              className="w-full bg-white border border-gray-200 text-gray-600 rounded-xl py-3.5 font-semibold hover:bg-gray-50 transition-all"
            >
              Batal
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImage}
            alt="Preview Full"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
