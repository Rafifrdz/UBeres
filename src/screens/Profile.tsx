import React from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { Settings, Bookmark, History, CreditCard, HelpCircle, LogOut, Star, Edit3 } from 'lucide-react';

interface ProfileProps {
  user: UserProfile;
  onLogout: () => void;
}

export default function Profile({ user, onLogout }: ProfileProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col bg-gray-50 overflow-y-auto pb-24"
    >
      <header className="bg-white p-6 pb-8 flex flex-col items-center relative rounded-b-[32px] shadow-sm">
        <button className="absolute top-6 right-6 p-2 text-gray-400 hover:text-blue-500 transition-all">
          <Settings className="w-5 h-5" />
        </button>
        
        <div className="w-20 h-20 rounded-3xl bg-blue-100 p-0.5 border-4 border-white shadow-lg mb-4 overflow-hidden">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-black text-blue-500 text-2xl">
              {user.displayName[0]}
            </div>
          )}
        </div>

        <h1 className="text-xl font-black text-gray-900 mb-1">{user.displayName}</h1>
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
            {user.role}
          </span>
          <div className="flex items-center gap-1 text-xs font-black text-orange-500 bg-orange-50 px-3 py-1 rounded-lg">
            <Star className="w-3.5 h-3.5 fill-orange-500" />
            <span>{user.rating?.toFixed(1) || '5.0'}</span>
          </div>
        </div>

        <div className="flex w-full gap-4 max-w-xs">
          <button className="flex-1 h-12 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 text-sm">
            <Edit3 className="w-4 h-4" />
            Edit Profil
          </button>
        </div>
      </header>

      <main className="p-5 space-y-5">
        <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="font-bold text-gray-700 text-sm">Saldo & Dompet</span>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Saldo Kamu</p>
              <p className="text-xs font-black text-blue-600">Rp 450.000</p>
            </div>
          </button>
          
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500">
                <History className="w-4 h-4" />
              </div>
              <span className="font-bold text-gray-700 text-sm">Riwayat Beresin</span>
            </div>
          </button>
          
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500">
                <Bookmark className="w-4 h-4" />
              </div>
              <span className="font-bold text-gray-700 text-sm">Kerjaan Simpanan</span>
            </div>
          </button>
        </div>

        <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="font-bold text-gray-700 text-sm">Bantuan & Support</span>
            </div>
          </button>

          <button 
            onClick={onLogout}
            className="w-full p-4 flex items-center justify-between hover:bg-red-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center text-red-400 group-hover:text-red-500 transition-colors">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="font-bold text-red-500 text-sm transition-colors">Keluar Akun</span>
            </div>
          </button>
        </div>

        <div className="text-center p-8">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">UB BERES v1.0.0</p>
          <p className="text-[10px] text-gray-300 font-bold mt-1">Dibuat khusus buat Mahasiswa UB</p>
        </div>
      </main>
    </motion.div>
  );
}
