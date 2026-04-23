import React, { useState } from 'react';
import { apiFetch } from '../lib/api';
import { motion } from 'motion/react';
import { ChevronLeft, Info, Loader2, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface PostJobProps {
  user: UserProfile;
  onBack: () => void;
  onSuccess: () => void;
}

const categories = ['Tugas', 'Desain', 'Koding', 'Editing', 'Lainnya'];

export default function PostJob({ user, onBack, onSuccess }: PostJobProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    category: 'Tugas',
    deadline: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    setLoading(true);
    try {
      await apiFetch('/jobs', {
        method: 'POST',
        headers: {
          'x-user-id': user.uid,
        },
        body: JSON.stringify({
        ...formData,
        budget: parseInt(formData.budget) || 0,
        clientId: user.uid,
        clientName: user.displayName,
        clientPhotoURL: user.photoURL,
        }),
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
        <div className="bg-white rounded-[24px] p-5 shadow-xl shadow-blue-500/5 border border-gray-100 space-y-4">
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

          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Pilih Kategori</label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({...formData, category: cat})}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                    formData.category === cat 
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-200' 
                      : 'bg-gray-50 text-gray-400 border border-transparent hover:border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
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
