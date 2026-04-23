import React, { useState } from 'react';
import { apiFetch } from '../lib/api';
import { motion } from 'motion/react';
import { ChevronLeft, Info, Loader2, AlertCircle, ShieldCheck, Ghost, EyeOff, DollarSign, Search, CheckCircle2, X } from 'lucide-react';
import { UserProfile } from '../types';

interface PostJobProps {
  user: UserProfile;
  onBack: () => void;
  onSuccess: () => void;
}

const categories = ['IT', 'Desain', 'Tugas', 'Game', 'Lainnya'];

export default function PostJob({ user, onBack, onSuccess }: PostJobProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    category: 'IT',
    keywords: '',
    isAnonymous: false,
    isFixedPrice: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        clientId: user.uid,
        clientName: formData.isAnonymous ? 'Anonim' : user.displayName,
        clientPhotoURL: formData.isAnonymous ? '' : user.photoURL,
        budget: Number(formData.budget),
        isFixedPrice: formData.isFixedPrice,
      };

      await apiFetch('/jobs', {
        method: 'POST',
        headers: {
          'x-user-id': user.uid,
        },
        body: JSON.stringify(payload),
      });
      onSuccess();
    } catch (error: any) {
      console.error("Gagal posting kerjaan:", error);
      alert(`Gagal posting kerjaan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex-1 flex flex-col bg-gray-50 overflow-y-auto pb-24"
    >
      <header className="px-5 pt-6 pb-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-b-[32px] shadow-lg relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex items-center gap-3">
          <button onClick={onBack} className="p-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl hover:bg-white/20 transition-all active:scale-95">
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <div>
            <p className="text-[8px] text-blue-200 font-black uppercase tracking-[0.2em] mb-0.5">Butuh bantuan apa?</p>
            <h1 className="text-lg font-black text-white leading-none">Posting Kerjaan</h1>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-5 -mt-5 space-y-4 relative z-20">
        {user.uid.startsWith('local-') && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-[24px] p-5 flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-orange-900 text-sm">Mode Guest Terbatas</h3>
              <p className="text-[10px] text-orange-700 font-medium leading-relaxed">Kamu harus login pakai akun Google biar bisa posting kerjaan dan dapet worker beneran.</p>
            </div>
            <button 
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-200"
            >
              Login Sekarang
            </button>
          </div>
        )}
        <div className={`bg-white rounded-[24px] p-5 shadow-xl shadow-blue-500/5 border border-gray-100 space-y-4 ${user.uid.startsWith('local-') ? 'opacity-40 pointer-events-none' : ''}`}>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Judul Kerjaan</label>
            <input 
              required
              placeholder="Contoh: Bantu Desain Logo UMKM"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full h-11 bg-gray-50/50 rounded-xl px-4 text-gray-900 border-2 border-transparent focus:border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-[11px] font-medium outline-none"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Keahlian / Keywords</label>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, keywords: '' })}
                className="text-[10px] font-black text-blue-500 uppercase tracking-widest"
              >
                Clear
              </button>
            </div>
            
            <div className="bg-white border-2 border-gray-100 focus-within:border-blue-500/20 focus-within:ring-4 focus-within:ring-blue-500/5 rounded-2xl p-2 min-h-[56px] transition-all shadow-sm">
              <div className="flex flex-wrap gap-2">
                {formData.keywords.split(',').map(s => s.trim()).filter(s => s).map((tag, idx) => (
                  <motion.span 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={`${tag}-${idx}`} 
                    className="px-2.5 py-1.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-2 shadow-sm"
                  >
                    {tag}
                    <button 
                      type="button"
                      onClick={() => {
                        const current = formData.keywords.split(',').map(s => s.trim()).filter(s => s);
                        const next = current.filter((_, i) => i !== idx);
                        setFormData({ ...formData, keywords: next.join(', ') });
                      }}
                      className="hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </motion.span>
                ))}
                <input 
                  type="text"
                  placeholder={formData.keywords ? "" : "Ketik keahlian & tekan Enter..."}
                  className="flex-1 bg-transparent border-none outline-none text-xs font-medium h-9 px-2 min-w-[120px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const val = e.currentTarget.value.trim();
                      if (val) {
                        const current = formData.keywords.split(',').map(s => s.trim()).filter(s => s);
                        if (!current.includes(val)) {
                          setFormData({ ...formData, keywords: [...current, val].join(', ') });
                        }
                        e.currentTarget.value = '';
                      }
                    } else if (e.key === 'Backspace' && !e.currentTarget.value) {
                      const current = formData.keywords.split(',').map(s => s.trim()).filter(s => s);
                      if (current.length > 0) {
                        const next = current.slice(0, -1);
                        setFormData({ ...formData, keywords: next.join(', ') });
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="px-2 flex items-center gap-2">
              <Info className="w-3 h-3 text-blue-500" />
              <p className="text-[8px] text-gray-400 font-medium leading-relaxed italic">
                Tekan <span className="font-black text-gray-600">ENTER</span> atau <span className="font-black text-gray-600">KOMA</span> buat nambahin keahlian.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Deskripsi Detail</label>
            <textarea 
              required
              rows={3}
              placeholder="Jelasin bantuan apa yang kamu butuhin secara detail..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-gray-50/50 rounded-xl p-4 text-gray-900 border-2 border-transparent focus:border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all resize-none text-[11px] font-medium outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Budget (Rp)</label>
              <input 
                type="number"
                placeholder="50.000"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                className="w-full h-11 bg-gray-50/50 rounded-xl px-4 text-gray-900 border-2 border-transparent focus:border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-black text-[11px] outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Deadline</label>
              <input 
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                className="w-full h-11 bg-gray-50/50 rounded-xl px-4 text-gray-900 border-2 border-transparent focus:border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-[11px] font-black outline-none"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-[24px] border border-blue-100 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-black text-blue-900 leading-tight">Harga Pas (Fix)</p>
              <p className="text-[9px] text-blue-400 font-bold">Worker nggak bisa ngebid harga lain</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setFormData({...formData, isFixedPrice: !formData.isFixedPrice})}
            className={`w-12 h-6 rounded-full transition-all relative ${formData.isFixedPrice ? 'bg-blue-500' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isFixedPrice ? 'right-1' : 'left-1'}`} />
          </button>
        </div>

        <div className={`p-4 bg-white rounded-[24px] border border-gray-100 flex items-center justify-between shadow-sm ${user.uid.startsWith('local-') ? 'opacity-40 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.isAnonymous ? 'bg-gray-900 text-white' : 'bg-blue-50 text-blue-500'}`}>
              {formData.isAnonymous ? <Ghost className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none mb-1">Post Anonim</p>
              <p className="text-[9px] text-gray-400 font-medium">Sembunyikan identitas asli kamu</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setFormData({...formData, isAnonymous: !formData.isAnonymous})}
            className={`w-12 h-6 rounded-full relative transition-colors ${formData.isAnonymous ? 'bg-gray-900' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isAnonymous ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        <div className="p-4 bg-blue-50/50 rounded-[24px] border border-blue-100/50 flex gap-3 items-start">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-200">
            <Info className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-0.5">Informasi Escrow</p>
            <p className="text-[10px] text-blue-700 leading-relaxed font-bold">
              Pembayaran akan ditaruh di sistem <span className="text-blue-900 font-black underline decoration-blue-300 decoration-1">Escrow</span> sampai kerjaan selesai.
            </p>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-[20px] font-black text-sm shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Posting Sekarang</span>
              <div className="bg-white/20 p-1 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
