import React, { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { motion } from 'motion/react';
import { ChevronLeft, Info, AlertCircle, Loader2 } from 'lucide-react';
import { handleFirestoreError } from '../lib/utils';

interface PostJobProps {
  onBack: () => void;
  onSuccess: () => void;
}

const categories = ['Tugas', 'Desain', 'Koding', 'Editing', 'Lainnya'];

export default function PostJob({ onBack, onSuccess }: PostJobProps) {
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
    if (!auth.currentUser || !formData.title || !formData.description) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'jobs'), {
        ...formData,
        budget: parseInt(formData.budget) || 0,
        clientId: auth.currentUser.uid,
        status: 'open',
        bidCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      onSuccess();
    } catch (error: any) {
      console.error("Gagal posting kerjaan:", error);
      alert(`Gagal posting kerjaan: ${error.message}\n\nPastikan Firestore sudah di-aktifkan di Console.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex-1 flex flex-col bg-white overflow-y-auto"
    >
      <header className="px-4 pt-5 pb-1 flex items-center gap-3">
        <button onClick={onBack} className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-4 h-4 text-gray-900" />
        </button>
        <h1 className="text-base font-black text-gray-900">Butuh Bantuan</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-24">
        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Judul Kerjaan</label>
          <input 
            required
            placeholder="Contoh: Bantu Desain Logo UMKM"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full h-10 bg-gray-50 rounded-lg px-4 text-gray-900 border-none focus:ring-2 focus:ring-blue-100 transition-all text-xs"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Kategori</label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFormData({...formData, category: cat})}
                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                  formData.category === cat 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-100' 
                    : 'bg-gray-50 text-gray-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Deskripsi Detail</label>
          <textarea 
            required
            rows={3}
            placeholder="Jelasin bantuan apa yang kamu butuhin..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full bg-gray-50 rounded-lg p-4 text-gray-900 border-none focus:ring-2 focus:ring-blue-100 transition-all resize-none text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Budget (Rp)</label>
            <input 
              type="number"
              placeholder="Contoh: 50.000"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
              className="w-full h-10 bg-gray-50 rounded-lg px-4 text-gray-900 border-none focus:ring-2 focus:ring-blue-100 transition-all font-bold text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Deadline</label>
            <input 
              type="date"
              required
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              className="w-full h-10 bg-gray-50 rounded-lg px-4 text-gray-900 border-none focus:ring-2 focus:ring-blue-100 transition-all text-xs font-bold"
            />
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-2xl flex gap-3 items-start">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed font-medium">
            Pembayaran akan ditaruh di sistem <b>Escrow</b> sampai kerjaan selesai. Tenang, uang kamu aman!
          </p>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-blue-500 text-white rounded-xl font-black text-sm shadow-md shadow-blue-100 hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Posting Kerjaan"}
        </button>
      </form>
    </motion.div>
  );
}
