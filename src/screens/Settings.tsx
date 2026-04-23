import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, User, Bell, MapPin, CreditCard, Globe, Lock, ShieldCheck, Info, ChevronRight, Save, Plus, Trash2, Shield, Eye, EyeOff } from 'lucide-react';

interface SettingsProps {
  onBack: () => void;
}

type SubScreen = 'main' | 'personal' | 'security' | 'address' | 'notifications' | 'payment';

export default function Settings({ onBack }: SettingsProps) {
  const [activeSub, setActiveSub] = useState<SubScreen>('main');

  const handleBack = () => {
    if (activeSub === 'main') {
      onBack();
    } else {
      setActiveSub('main');
    }
  };

  const sections = [
    {
      title: 'Akun',
      items: [
        { icon: User, label: 'Informasi Pribadi', color: 'text-blue-500', bg: 'bg-blue-50', sub: 'personal' },
        { icon: Lock, label: 'Keamanan & Sandi', color: 'text-purple-500', bg: 'bg-purple-50', sub: 'security' },
        { icon: MapPin, label: 'Alamat Tersimpan', color: 'text-orange-500', bg: 'bg-orange-50', sub: 'address' },
      ]
    },
    {
      title: 'Preferensi',
      items: [
        { icon: Bell, label: 'Notifikasi', color: 'text-pink-500', bg: 'bg-pink-50', sub: 'notifications' },
        { icon: Globe, label: 'Bahasa & Wilayah', color: 'text-teal-500', bg: 'bg-teal-50' },
        { icon: CreditCard, label: 'Metode Pembayaran', color: 'text-indigo-500', bg: 'bg-indigo-50', sub: 'payment' },
      ]
    },
    {
      title: 'Lainnya',
      items: [
        { icon: ShieldCheck, label: 'Privasi & Ketentuan', color: 'text-green-500', bg: 'bg-green-50' },
        { icon: Info, label: 'Tentang UBeres', color: 'text-gray-500', bg: 'bg-gray-50' },
      ]
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden h-full">
      <header className="px-6 pt-10 pb-6 flex items-center gap-4 sticky top-0 bg-white/80 backdrop-blur-xl z-30">
        <button 
          onClick={handleBack}
          className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100 active:scale-90 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black text-gray-900">
          {activeSub === 'main' ? 'Pengaturan' : 
           activeSub === 'personal' ? 'Info Pribadi' :
           activeSub === 'security' ? 'Keamanan' :
           activeSub === 'address' ? 'Alamat' :
           activeSub === 'notifications' ? 'Notifikasi' : 'Pembayaran'}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto pb-10">
        <AnimatePresence mode="wait">
          {activeSub === 'main' && (
            <motion.main 
              key="main"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="px-6 space-y-8"
            >
              {sections.map((section, idx) => (
                <div key={idx} className="space-y-4">
                  <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">{section.title}</h2>
                  <div className="bg-gray-50/50 rounded-[32px] border border-gray-100 overflow-hidden">
                    {section.items.map((item, itemIdx) => (
                      <button 
                        key={itemIdx}
                        onClick={() => item.sub && setActiveSub(item.sub as SubScreen)}
                        className={`w-full p-4 flex items-center justify-between hover:bg-white transition-all group ${itemIdx !== section.items.length - 1 ? 'border-b border-gray-100' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <item.icon className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-gray-700 text-sm">{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-4 pb-10">
                <button className="w-full h-14 bg-red-50 text-red-500 rounded-[24px] font-black text-xs uppercase tracking-widest border border-red-100 active:scale-95 transition-all">
                  Hapus Akun Permanen
                </button>
              </div>
            </motion.main>
          )}

          {activeSub === 'personal' && <PersonalSettings />}
          {activeSub === 'security' && <SecuritySettings />}
          {activeSub === 'address' && <AddressSettings />}
          {activeSub === 'notifications' && <NotificationSettings />}
          {activeSub === 'payment' && <PaymentSettings />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PersonalSettings() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="px-6 space-y-6"
    >
      <div className="space-y-4">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-blue-100 rounded-[32px] relative group cursor-pointer overflow-hidden mb-4">
            <div className="w-full h-full flex items-center justify-center text-blue-500 font-black text-3xl">R</div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Plus className="text-white w-6 h-6" />
            </div>
          </div>
          <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Ganti Foto</button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-2">Nama Lengkap</label>
            <input type="text" defaultValue="Muhammad Rafi" className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 font-bold text-gray-900 outline-none focus:border-blue-500 focus:bg-white transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-2">Email Kampus</label>
            <input type="email" defaultValue="rafi@student.ub.ac.id" className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 font-bold text-gray-900 outline-none focus:border-blue-500 focus:bg-white transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-2">No. WhatsApp</label>
            <input type="tel" defaultValue="081234567890" className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 font-bold text-gray-900 outline-none focus:border-blue-500 focus:bg-white transition-all" />
          </div>
        </div>

        <button className="w-full h-14 bg-blue-500 text-white rounded-[24px] font-black text-sm shadow-xl shadow-blue-100 flex items-center justify-center gap-2 mt-8">
          <Save className="w-4 h-4" />
          Simpan Perubahan
        </button>
      </div>
    </motion.div>
  );
}

function SecuritySettings() {
  const [showPw, setShowPw] = useState(false);
  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="px-6 space-y-6"
    >
      <div className="p-5 bg-blue-50 rounded-[24px] border border-blue-100 flex gap-4">
        <Shield className="w-6 h-6 text-blue-500 flex-shrink-0" />
        <div>
          <h4 className="font-black text-blue-900 text-xs mb-1">Keamanan Akun</h4>
          <p className="text-[10px] text-blue-700 leading-relaxed font-medium">Gunakan kata sandi yang kuat dan jangan bagikan kode OTP ke siapapun.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-2">Kata Sandi Lama</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 font-bold outline-none focus:border-blue-500 transition-all" />
            <button onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-2">Kata Sandi Baru</label>
          <input type="password" className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 font-bold outline-none focus:border-blue-500 transition-all" />
        </div>
      </div>

      <button className="w-full h-14 bg-gray-900 text-white rounded-[24px] font-black text-sm flex items-center justify-center gap-2 mt-8">
        Update Kata Sandi
      </button>
    </motion.div>
  );
}

function AddressSettings() {
  const addresses = [
    { label: 'Kos Sekarang', detail: 'Jl. Watumujur No. 12, Lowokwaru', icon: MapPin },
    { label: 'Kampus (FILKOM)', detail: 'Gedung G Lt. 2, UB Kediri', icon: MapPin },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="px-6 space-y-6"
    >
      <div className="space-y-3">
        {addresses.map((addr, idx) => (
          <div key={idx} className="p-4 bg-gray-50 rounded-[24px] border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm">
                <addr.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-gray-900 text-xs mb-0.5">{addr.label}</h4>
                <p className="text-[10px] text-gray-500 font-medium">{addr.detail}</p>
              </div>
            </div>
            <button className="p-2 text-gray-300 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button className="w-full h-14 bg-white border-2 border-dashed border-gray-200 rounded-[24px] font-black text-gray-400 text-xs flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" />
        Tambah Lokasi Baru
      </button>
    </motion.div>
  );
}

function NotificationSettings() {
  const settings = [
    { label: 'Status Kerjaan', desc: 'Dapet update pas status kerjaan berubah', active: true },
    { label: 'Pesan Baru', desc: 'Notif pas ada chat masuk dari worker', active: true },
    { label: 'Tawaran Baru', desc: 'Notif pas ada worker ngebid di kerjaan kamu', active: false },
    { label: 'Promo UBeres', desc: 'Info diskon dan voucher khusus mahasiswa', active: true },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="px-6 space-y-4"
    >
      {settings.map((s, idx) => (
        <div key={idx} className="p-4 bg-gray-50 rounded-[24px] border border-gray-100 flex items-center justify-between">
          <div className="max-w-[70%]">
            <h4 className="font-black text-gray-900 text-xs mb-0.5">{s.label}</h4>
            <p className="text-[9px] text-gray-400 font-medium leading-relaxed">{s.desc}</p>
          </div>
          <button className={`w-12 h-6 rounded-full relative transition-colors ${s.active ? 'bg-blue-500' : 'bg-gray-200'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${s.active ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      ))}
    </motion.div>
  );
}

function PaymentSettings() {
  const methods = [
    { label: 'OVO', detail: '0812 **** 7890', icon: Wallet, color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: CreditCard, label: 'BCA Virtual Account', detail: '8077 **** 1234', color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="px-6 space-y-6"
    >
      <div className="space-y-3">
        {methods.map((m, idx) => (
          <div key={idx} className="p-4 bg-gray-50 rounded-[24px] border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${m.bg} ${m.color} rounded-xl flex items-center justify-center shadow-sm`}>
                <m.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-gray-900 text-xs mb-0.5">{m.label}</h4>
                <p className="text-[10px] text-gray-500 font-medium">{m.detail}</p>
              </div>
            </div>
            <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-2">Utama</button>
          </div>
        ))}
      </div>

      <button className="w-full h-14 bg-gray-900 text-white rounded-[24px] font-black text-xs flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" />
        Tambah Metode Pembayaran
      </button>
    </motion.div>
  );
}

function Wallet(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  );
}
