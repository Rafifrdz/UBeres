import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../lib/api';
import { categoryColors } from '../utils-new/storage';
import { useToast } from '../components/Toast';
import { ArrowLeft, Sparkles, Calendar, X, Plus } from 'lucide-react';

const CATEGORIES = ['Umum', 'Coding', 'Penulisan', 'Desain', 'Bahasa'];
const BUDGET_SUGGESTIONS = [50000, 100000, 150000, 200000, 300000];

export function PostJob() {
  const navigate = useNavigate();
  const { user } = useApp();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Umum');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [agreeEthics, setAgreeEthics] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async () => {
    if (!user || !title || !category || !description || !budget || !deadline || !agreeEthics) {
      showToast('Lengkapi semua field', 'error');
      return;
    }

    try {
      setIsUploading(true);
      let imageUrls: string[] = [];

      if (selectedFiles.length > 0) {
        showToast('Sedang mengupload gambar...', 'info');
        
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
          throw new Error('Cloudinary config missing di .env');
        }

        imageUrls = await Promise.all(
          selectedFiles.map(async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', uploadPreset);
            
            const res = await fetch(
              `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
              { method: 'POST', body: formData }
            );
            
            if (!res.ok) throw new Error('Gagal upload ke Cloudinary');
            const data = await res.json();
            return data.secure_url;
          })
        );
      }

      const response = await apiFetch<{ data: any }>('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          category,
          budget: parseInt(budget),
          deadline: new Date(deadline).toISOString(),
          isAnonymous,
          images: imageUrls,
          clientId: user.uid,
          clientName: user.displayName,
          clientPhotoURL: user.photoURL,
        }),
      });

      showToast('Tugas berhasil dipublikasikan!', 'success');
      navigate('/my-jobs');
    } catch (error: any) {
      console.error('Failed to post job:', error);
      showToast(error.message || 'Gagal mempublikasikan tugas', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const canProceedStep1 = title && category && description;
  const canProceedStep2 = budget && deadline;
  const canSubmit = agreeEthics;

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-8">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4 sticky top-0 z-10 border-b border-gray-100 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-gray-900">Post Tugas Baru</h1>
          <p className="text-xs text-gray-500">Step {step} of 3</p>
        </div>
      </div>

      <div className="px-6">
        {/* Step Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-[#6366f2]' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Tugas *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Contoh: Desain Logo untuk Startup Edutech"
                className="w-full bg-white border border-gray-200 rounded-[10px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-3 rounded-[10px] text-sm font-medium transition-all ${
                      category === cat
                        ? 'bg-[#6366f2]/10 border-2 border-[#6366f2] text-[#6366f2]'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Deskripsi *
                </label>
                <button className="text-xs text-gray-900 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Polish
                </button>
              </div>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Jelaskan detail tugas, requirement, dan deliverable yang diharapkan..."
                rows={6}
                className="w-full bg-white border border-gray-200 rounded-[10px] px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Lampiran Gambar (Opsional)
                </label>
                <span className="text-xs text-gray-400">{selectedFiles.length} / 3</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {selectedFiles.map((file, i) => (
                  <div key={i} className="relative aspect-square rounded-[12px] overflow-hidden border border-gray-200">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {selectedFiles.length < 3 && (
                  <label className="aspect-square rounded-[12px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <Plus className="w-6 h-6 text-gray-400" />
                    <span className="text-[10px] text-gray-400 mt-1">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={e => {
                        const files = Array.from(e.target.files || []);
                        setSelectedFiles(prev => [...prev, ...files].slice(0, 3));
                      }}
                    />
                  </label>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Maksimal 3 foto, ukuran per foto max 2MB</p>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="w-full bg-[#6366f2] text-white rounded-[10px] py-4 font-medium hover:bg-[#4F46E5] disabled:opacity-50"
            >
              Lanjut
            </button>
          </div>
        )}

        {/* Step 2: Budget & Deadline */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget *
              </label>
              <div className="relative mb-3">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <input
                  type="number"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-gray-200 rounded-[10px] pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {BUDGET_SUGGESTIONS.map(amount => (
                  <button
                    key={amount}
                    onClick={() => setBudget(amount.toString())}
                    className="px-3 py-1.5 bg-[#F1F3F7] text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    Rp {amount.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  min={getMinDate()}
                  className="w-full bg-white border border-gray-200 rounded-[10px] pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border-2 border-gray-200 text-gray-700 rounded-[10px] py-4 font-medium hover:bg-gray-50"
              >
                Kembali
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="flex-1 bg-[#6366f2] text-white rounded-[10px] py-4 font-medium hover:bg-[#4F46E5] disabled:opacity-50"
              >
                Lanjut
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Confirm */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-[16px] p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Preview</h3>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Judul</p>
                  <p className="font-medium text-[#6366F1]">{title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Kategori</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${categoryColors[category]}`}>
                    {category}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Deskripsi</p>
                  <p className="text-sm text-gray-700">{description}</p>
                </div>
                {selectedFiles.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Lampiran</p>
                    <div className="flex gap-2">
                      {selectedFiles.map((file, i) => (
                        <div key={i} className="w-12 h-12 rounded-[8px] overflow-hidden border border-gray-100">
                          <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Budget</p>
                    <p className="font-medium text-gray-700">Rp {parseInt(budget || '0').toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Deadline</p>
                    <p className="font-medium text-gray-900">
                      {deadline && new Date(deadline).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeEthics}
                onChange={e => setAgreeEthics(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-[#6366F1]"
              />
              <span className="text-sm text-gray-700">
                Saya menyatakan bahwa tugas ini adalah tugas etis dan tidak melanggar peraturan akademik UB
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={e => setIsAnonymous(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-[#6366F1] focus:ring-[#6366F1]"
              />
              <span className="text-sm text-gray-700">
                <span className="font-medium text-gray-900 block mb-0.5">Sembunyikan Identitas (Anonim)</span>
                Nama dan fotomu tidak akan ditampilkan ke publik. Hanya bisa dilihat setelah kamu memilih worker.
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border-2 border-gray-200 text-gray-700 rounded-[10px] py-4 font-medium hover:bg-gray-50"
              >
                Kembali
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || isUploading}
                className="flex-1 bg-[#6366f2] text-white rounded-[10px] py-4 font-medium hover:bg-[#4F46E5] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {isUploading ? 'Mengupload...' : 'Publikasikan'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
