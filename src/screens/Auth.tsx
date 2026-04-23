import React from 'react';
import { motion } from 'motion/react';
import { GoogleLogin } from '@react-oauth/google';
import { UserCircle2 } from 'lucide-react';

interface AuthProps {
  onLogin: () => void;
  onGoogleSuccess: (credentialResponse: any) => void;
}

export default function Auth({ onLogin, onGoogleSuccess }: AuthProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center p-8 bg-white"
    >
      <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-blue-100">
        <span className="text-4xl font-black text-white italic">UB</span>
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Selamat Datang!</h1>
      <p className="text-gray-500 mb-12 text-center max-w-xs">Beresin tugas kampus jadi makin gampang di UB BERES.</p>

      <div className="w-full flex justify-center mb-4">
        <GoogleLogin
          onSuccess={onGoogleSuccess}
          onError={() => {
            console.log('Login Failed');
            alert('Login Google Gagal');
          }}
          useOneTap
          theme="outline"
          size="large"
          shape="circle"
          width="320"
        />
      </div>

      <button 
        onClick={onLogin}
        className="w-full h-14 border-2 border-gray-100 rounded-3xl flex items-center justify-center gap-3 font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
      >
        <UserCircle2 className="w-6 h-6 text-blue-500" />
        Masuk Cepat (Guest)
      </button>

      <div className="mt-8 flex items-center gap-4 w-full">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Atau via</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <div className="flex gap-4 mt-8 w-full">
        <button className="flex-1 h-14 border-2 border-gray-100 rounded-3xl font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all">
          Email
        </button>
        <button className="flex-1 h-14 border-2 border-gray-100 rounded-3xl font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all">
          WhatsApp
        </button>
      </div>
    </motion.div>
  );
}
