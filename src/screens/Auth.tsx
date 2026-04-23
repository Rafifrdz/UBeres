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

      <div className="w-full max-w-[320px] space-y-3">
        {/* Google Login Wrapper */}
        <div className="w-full">
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={() => {
              console.log('Login Failed');
              alert('Login Google Gagal');
            }}
            useOneTap
            theme="outline"
            size="large"
            shape="pill"
            width="320"
          />
        </div>

        <button 
          onClick={onLogin}
          className="w-full h-[40px] border border-gray-200 rounded-full flex items-center justify-center gap-3 font-medium text-gray-600 hover:bg-gray-50 active:scale-95 transition-all bg-white text-sm"
        >
          <UserCircle2 className="w-4 h-4 text-blue-500/80" />
          Masuk Cepat (Guest)
        </button>

        <div className="pt-4 flex items-center gap-4 w-full">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Atau</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="flex gap-2 w-full">
          <button className="flex-1 h-10 border border-gray-100 rounded-full font-bold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all bg-white text-[10px]">
            Email
          </button>
          <button className="flex-1 h-10 border border-gray-100 rounded-full font-bold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all bg-white text-[10px]">
            WhatsApp
          </button>
        </div>
      </div>
    </motion.div>
  );
}
