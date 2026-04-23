import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserRole } from '../types';
import { CheckCircle2, Search, Briefcase, ChevronRight } from 'lucide-react';

interface OnboardingProps {
  onLogin: () => void;
  onComplete: (role: UserRole) => void | Promise<void>;
}

const slides = [
  {
    title: "Beresin Tugas Cepet",
    desc: "Cari temen kampus yang jago buat bantu beresin tugas, desain, sampe kodingan kamu.",
    icon: <Search className="w-16 h-16 text-blue-500" />,
  },
  {
    title: "Cuan Sambil Kuliah",
    desc: "Manfaatin skill kamu buat dapet duit tambahan dengan bantuin temen yang butuh.",
    icon: <Briefcase className="w-16 h-16 text-blue-500" />,
  },
  {
    title: "Aman & Terpercaya",
    desc: "Pake sistem rekber biar bayarnya tenang. Uang baru cair pas kerjaan udah beres.",
    icon: <CheckCircle2 className="w-16 h-16 text-blue-500" />,
  }
];

export default function Onboarding({ onLogin, onComplete }: OnboardingProps) {
  const [slide, setSlide] = useState(0);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const next = () => {
    if (slide < slides.length - 1) {
      setSlide(slide + 1);
    } else {
      setShowRoleSelection(true);
    }
  };

  const handleRoleSelect = async (role: UserRole) => {
    setIsLoading(true);
    try {
      await onComplete(role);
    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (showRoleSelection) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col items-center justify-center p-8 bg-white"
      >
        <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">Kamu Siapa?</h2>
        <p className="text-gray-500 mb-12 text-center">Pilih peran kamu di UB BERES</p>
        
        <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
          <button 
            onClick={() => handleRoleSelect('client')}
            disabled={isLoading}
            className="group p-5 border-2 border-gray-100 hover:border-blue-500 rounded-3xl transition-all text-left bg-white hover:bg-blue-50 disabled:opacity-50"
          >
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl mb-1">Butuh Bantuan</h3>
            <p className="text-sm text-gray-500">Aku mau posting kerjaan buat dibantuin</p>
          </button>

          <button 
            onClick={() => handleRoleSelect('worker')}
            disabled={isLoading}
            className="group p-5 border-2 border-gray-100 hover:border-blue-500 rounded-3xl transition-all text-left bg-white hover:bg-blue-50 disabled:opacity-50"
          >
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl mb-1">Cari Kerjaan</h3>
            <p className="text-sm text-gray-500">Aku mau nyari cuan dari bantuin temen</p>
          </button>
        </div>
        {isLoading && (
          <div className="mt-8 flex items-center gap-2 text-blue-500 font-medium animate-pulse">
            <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            Memproses...
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col bg-white"
    >
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <motion.div 
          key={slide}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-10"
        >
          {slides[slide].icon}
        </motion.div>
        
        <motion.div 
          key={`text-${slide}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl font-black text-gray-900 mb-3">{slides[slide].title}</h1>
          <p className="text-gray-500 leading-relaxed max-w-[280px] mx-auto text-sm">{slides[slide].desc}</p>
        </motion.div>
      </div>

      <div className="p-8 flex flex-col items-center">
        <div className="flex gap-2 mb-6">
          {slides.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-6 bg-blue-500' : 'w-1.5 bg-gray-200'}`} />
          ))}
        </div>

        <button 
          onClick={next}
          className="w-full h-12 bg-blue-500 text-white rounded-2xl font-bold text-base flex items-center justify-center shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-95 transition-all"
        >
          Lanjut <ChevronRight className="ml-2 w-4 h-4" />
        </button>

        <button 
          onClick={onLogin}
          className="mt-6 text-gray-400 font-medium hover:text-blue-500"
        >
          Lewati dan masuk cepat
        </button>
      </div>
    </motion.div>
  );
}
