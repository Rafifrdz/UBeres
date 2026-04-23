import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { Settings, Bookmark, History, CreditCard, HelpCircle, LogOut, Star, Edit3, ClipboardList, Wallet, ChevronLeft, ChevronRight, Plus, ArrowUpRight, ArrowDownLeft, Clock, MessageCircle, Mail, Phone, Globe, CheckCircle2, ShieldCheck, Layout, Code2, Palette, Image as ImageIcon } from 'lucide-react';

interface ProfileProps {
  user: UserProfile;
  onLogout: () => void;
  onSettings: () => void;
  onViewMyJobs: () => void;
}

type ProfileSubScreen = 'main' | 'wallet' | 'support' | 'payments' | 'work-history' | 'saved-jobs' | 'portfolio';

export default function Profile({ user, onLogout, onSettings, onViewMyJobs }: ProfileProps) {
  const [activeSub, setActiveSub] = useState<ProfileSubScreen>('main');

  const handleBack = () => setActiveSub('main');

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden h-full">
      <AnimatePresence mode="wait">
        {activeSub === 'main' && (
          <motion.div 
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-y-auto pb-24"
          >
            <header className="bg-white p-6 pb-8 flex flex-col items-center relative rounded-b-[32px] shadow-sm">
              <button 
                onClick={onSettings}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-blue-500 transition-all"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <div className="w-20 h-20 rounded-3xl bg-blue-100 p-0.5 border-4 border-white shadow-lg mb-4 overflow-hidden relative">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-blue-500 text-2xl">
                    {user.displayName[0]}
                  </div>
                )}
                {user.role === 'worker' && (
                  <div className="absolute bottom-1 right-1 bg-blue-600 rounded-full p-1 border-2 border-white shadow-lg">
                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 mb-1">
                <h1 className="text-xl font-black text-gray-900">{user.displayName}</h1>
                {user.role === 'worker' && (
                  <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                    <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Verified Worker</span>
                  </div>
                )}
              </div>
              
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
                <button className="flex-1 h-12 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 text-sm shadow-xl shadow-gray-200 active:scale-95 transition-all">
                  <Edit3 className="w-4 h-4" />
                  Edit Profil
                </button>
              </div>
            </header>

            <main className="p-5 space-y-5">
              <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
                <button 
                  onClick={() => setActiveSub('wallet')}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50"
                >
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
                
                {user.role === 'worker' ? (
                  <>
                    <button 
                      onClick={() => setActiveSub('portfolio')}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
                          <Layout className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-gray-700 text-sm">Portofolio & Skill</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>

                    <button 
                      onClick={() => setActiveSub('work-history')}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500">
                          <History className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-gray-700 text-sm">Riwayat Beresin</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                    
                    <button 
                      onClick={() => setActiveSub('saved-jobs')}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500">
                          <Bookmark className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-gray-700 text-sm">Kerjaan Simpanan</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={onViewMyJobs}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
                          <ClipboardList className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-gray-700 text-sm">Riwayat Posting</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                    
                    <button 
                      onClick={() => setActiveSub('payments')}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center text-teal-500">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-gray-700 text-sm">Metode Pembayaran</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                  </>
                )}
              </div>

              <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
                <button 
                  onClick={() => setActiveSub('support')}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-gray-700 text-sm">Bantuan & Support</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
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
        )}

        {activeSub !== 'main' && (
          <motion.div 
            key="sub"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col bg-white"
          >
            <header className="px-6 pt-10 pb-6 flex items-center gap-4 sticky top-0 bg-white/80 backdrop-blur-xl z-30">
              <button 
                onClick={handleBack}
                className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100 active:scale-90 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-black text-gray-900">
                {activeSub === 'wallet' ? 'Saldo & Dompet' : 
                 activeSub === 'support' ? 'Bantuan & Support' : 
                 activeSub === 'payments' ? 'Metode Pembayaran' :
                 activeSub === 'work-history' ? 'Riwayat Beresin' : 
                 activeSub === 'portfolio' ? 'Portofolio' : 'Kerjaan Simpanan'}
              </h1>
            </header>

            <div className="flex-1 overflow-y-auto px-6 pb-10">
              {activeSub === 'wallet' && <WalletView />}
              {activeSub === 'support' && <SupportView />}
              {activeSub === 'payments' && <PaymentView />}
              {activeSub === 'work-history' && <WorkHistoryView />}
              {activeSub === 'saved-jobs' && <SavedJobsView />}
              {activeSub === 'portfolio' && <PortfolioView />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PortfolioView() {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('Mahasiswa FILKOM yang hobi ngulik UI/UX dan Mobile Development. Udah ngerjain 50+ project di kampus maupun freelance.');
  const [skills, setSkills] = useState(['UI/UX Design', 'React Native', 'Laravel', 'Copywriting', 'Logo Design']);
  const [projects, setProjects] = useState([
    {
      title: 'Mobile App Banking',
      category: 'Design',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Landing Page Event',
      category: 'Koding',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Branding Logo Shop',
      category: 'Design',
      image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'UI Kit Dashboard',
      category: 'Design',
      image: 'https://images.unsplash.com/photo-1581291518155-d36809312952?auto=format&fit=crop&w=400&q=80',
    }
  ]);

  const addProject = () => {
    setProjects([...projects, {
      title: 'Proyek Baru',
      category: 'Lainnya',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80'
    }]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 relative">
      <button 
        onClick={() => setIsEditing(!isEditing)}
        className={`fixed bottom-24 right-6 w-12 h-12 rounded-full shadow-2xl flex items-center justify-center z-50 transition-all active:scale-90 ${
          isEditing ? 'bg-green-500 text-white' : 'bg-gray-900 text-white'
        }`}
      >
        {isEditing ? <CheckCircle2 className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
      </button>

      {/* Top Profile Section */}
      <div className="flex flex-col items-center text-center px-2">
        <div className="w-24 h-24 rounded-[32px] bg-gradient-to-tr from-blue-500 to-indigo-600 p-1 mb-4 shadow-xl shadow-blue-100 relative group">
          <div className="w-full h-full rounded-[28px] bg-white p-0.5 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80" 
              alt="Worker" 
              className="w-full h-full object-cover rounded-[26px]"
            />
          </div>
          {isEditing && (
            <div className="absolute inset-0 bg-black/40 rounded-[32px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div className="w-full px-4">
            <input 
              value="Muhammad Rafi"
              readOnly
              className="w-full text-center font-black text-gray-900 bg-transparent border-b border-gray-200 pb-1 mb-2 outline-none"
            />
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full text-[11px] text-gray-500 font-medium leading-relaxed text-center bg-blue-50/50 rounded-xl p-3 border border-blue-100 outline-none resize-none h-20"
            />
          </div>
        ) : (
          <>
            <h3 className="text-lg font-black text-gray-900">Muhammad Rafi</h3>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-2 px-6 italic">
              "{bio}"
            </p>
          </>
        )}
      </div>

      <div className="space-y-4 px-1">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Keahlian (Skills)</h3>
          {isEditing && (
            <button className="text-[9px] font-black text-blue-500 uppercase tracking-widest">+ Tambah</button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, idx) => (
            <div key={idx} className="relative group">
              <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-wider block">
                {skill}
              </span>
              {isEditing && (
                <button 
                  onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform"
                >
                  <Plus className="w-2.5 h-2.5 rotate-45" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 px-1">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hasil Kerja (Portfolio)</h3>
          {isEditing && (
            <button 
              onClick={addProject}
              className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Tambah Baru
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 pb-10">
          {projects.map((p, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: isEditing ? 0 : -4 }}
              className="group relative"
            >
              <div className="w-full aspect-[4/5] rounded-[24px] overflow-hidden border border-gray-100 shadow-sm mb-2 relative">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-center justify-center p-4 ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                   {isEditing ? (
                     <button 
                       onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                       className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90"
                     >
                        <LogOut className="w-5 h-5 rotate-45" />
                     </button>
                   ) : (
                     <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
                       <Plus className="w-4 h-4" />
                     </div>
                   )}
                </div>
              </div>
              <div className="px-1">
                {isEditing ? (
                  <input 
                    value={p.title}
                    onChange={(e) => {
                      const newProjects = [...projects];
                      newProjects[idx].title = e.target.value;
                      setProjects(newProjects);
                    }}
                    className="w-full font-black text-gray-900 text-[11px] leading-tight bg-blue-50 rounded px-1 outline-none"
                  />
                ) : (
                  <h4 className="font-black text-gray-900 text-[11px] leading-tight line-clamp-1">{p.title}</h4>
                )}
                <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mt-0.5">{p.category}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Review List Section (Moved to Portfolio for Workers Only) */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-black text-gray-900 text-sm">Apa Kata Client?</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Reviews & Reputasi</p>
          </div>
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
            <Star className="w-5 h-5 fill-orange-500" />
          </div>
        </div>

        <div className="space-y-4">
          {[
            { name: 'Andi Pratama', rating: 5, comment: 'Pengerjaan cepat banget, hasil logo sesuai request. Rekomen banget buat jasa desain!', date: '2 hari yang lalu' },
            { name: 'Siti Aminah', rating: 4, comment: 'Tugas skripsi bab 1-3 dibantu beresin, komunikasinya enak dan tepat waktu.', date: '1 minggu yang lalu' },
            { name: 'Raka Wijaya', rating: 5, comment: 'Joki push rank-nya GG WP! Dari Epic ke Mythic cuma semalam. Gak pake lama.', date: '2 minggu yang lalu' }
          ].map((review, i) => (
            <div key={i} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600 uppercase">
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-900 leading-none">{review.name}</p>
                    <p className="text-[8px] text-gray-400 font-bold mt-0.5">{review.date}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="w-2.5 h-2.5 fill-orange-500 text-orange-500" />
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-gray-600 font-medium leading-relaxed italic">"{review.comment}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkHistoryView() {
  const history = [
    { title: 'Bantu Ngerjain Tugas Kalkulus', client: 'Muhammad Rafi', date: '22 Apr', status: 'Selesai', budget: 50000 },
    { title: 'Desain Poster UKM', client: 'BEM FILKOM', date: '18 Apr', status: 'Selesai', budget: 120000 },
    { title: 'Koding Website Landing Page', client: 'Kahfi', date: '15 Apr', status: 'Diproses', budget: 350000 },
  ];

  return (
    <div className="space-y-4">
      {history.map((h, idx) => (
        <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
          <div className="flex justify-between items-start">
            <h4 className="font-black text-gray-900 text-xs flex-1 pr-4">{h.title}</h4>
            <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${h.status === 'Selesai' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
              {h.status}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200/50 pt-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[10px] font-black text-gray-400">
                {h.client[0]}
              </div>
              <p className="text-[10px] text-gray-500 font-bold">{h.client}</p>
            </div>
            <p className="text-xs font-black text-gray-900">Rp {h.budget.toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SavedJobsView() {
  const saved = [
    { title: 'Butuh Jasa Translate Jurnal', client: 'Sarah', budget: 75000, category: 'Tugas' },
    { title: 'Cari Jasa Video Editing Reels', client: 'Aris', budget: 150000, category: 'Editing' },
  ];

  return (
    <div className="space-y-4">
      {saved.map((s, idx) => (
        <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{s.category}</span>
            </div>
            <h4 className="font-black text-gray-900 text-xs mb-1">{s.title}</h4>
            <p className="text-[10px] text-blue-600 font-black">Rp {s.budget.toLocaleString()}</p>
          </div>
          <button className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm">
            <Bookmark className="w-4 h-4 fill-orange-500" />
          </button>
        </div>
      ))}
      {saved.length === 0 && (
        <div className="py-20 text-center">
          <Bookmark className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-sm font-bold text-gray-400">Belum ada kerjaan disimpan</p>
        </div>
      )}
    </div>
  );
}

function WalletView() {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawStep, setWithdrawStep] = useState<'form' | 'success'>('form');
  
  const transactions = [
    { type: 'out', title: 'Tarik Saldo ke OVO', date: 'Hari ini, 12:45', amount: -100000 },
    { type: 'in', title: 'Hasil Jasa Koding', date: '24 Apr, 01:20', amount: 150000 },
    { type: 'in', title: 'Top Up via OVO', date: '22 Apr, 15:45', amount: 500000 },
    { type: 'out', title: 'Bayar Jasa Desain', date: '20 Apr, 10:12', amount: -75000 },
  ];

  const handleWithdraw = () => {
    if (!withdrawAmount) return;
    setWithdrawStep('success');
  };

  return (
    <div className="space-y-8">
      <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Total Saldo UBeres</p>
        <h2 className="text-4xl font-black mb-6">Rp 450.000</h2>
        
        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 mb-6">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-60 text-blue-100">Saldo Tertahan (Escrow)</p>
            <ShieldCheck className="w-3 h-3 text-blue-200" />
          </div>
          <p className="text-lg font-black">Rp 120.000</p>
          <p className="text-[8px] font-medium text-blue-200 mt-1">Dana aman di sistem sampai kerjaan selesai.</p>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 h-12 bg-white text-blue-600 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Top Up
          </button>
          <button 
            onClick={() => {
              setWithdrawStep('form');
              setShowWithdraw(true);
            }}
            className="flex-1 h-12 bg-white/20 backdrop-blur-md rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-white/30 transition-all active:scale-95"
          >
            <ArrowUpRight className="w-4 h-4" /> Tarik
          </button>
        </div>
      </div>

      <div className="space-y-4 pb-20">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Riwayat Transaksi</h3>
        <div className="space-y-3">
          {transactions.map((t, idx) => (
            <div key={idx} className="p-4 bg-white rounded-2xl flex items-center justify-between border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'in' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {t.type === 'in' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-[11px] mb-0.5">{t.title}</h4>
                  <p className="text-[9px] text-gray-400 font-bold">{t.date}</p>
                </div>
              </div>
              <p className={`font-black text-xs ${t.type === 'in' ? 'text-green-600' : 'text-gray-900'}`}>
                {t.type === 'in' ? '+' : ''}{t.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdraw && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWithdraw(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-white rounded-t-[40px] shadow-2xl p-8 pb-10"
            >
              <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8" />
              
              {withdrawStep === 'form' ? (
                <>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                      <ArrowUpRight className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-gray-900 tracking-tight">Tarik Saldo</h2>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Dana cair dalam 1-5 menit</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Nominal Penarikan</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">Rp</span>
                        <input 
                          type="number"
                          placeholder="0"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl pl-12 pr-4 h-14 font-black text-lg outline-none transition-all"
                        />
                      </div>
                      <div className="flex justify-between px-1">
                        <p className="text-[9px] font-bold text-gray-400">Saldo Tersedia: Rp 450.000</p>
                        <button 
                          onClick={() => setWithdrawAmount('450000')}
                          className="text-[9px] font-black text-blue-500 uppercase"
                        >
                          Tarik Semua
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Tujuan Pencairan</label>
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-gray-900">OVO / 0812 **** 7890</p>
                            <p className="text-[9px] font-bold text-blue-400 uppercase">Akun Utama</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-blue-300" />
                      </div>
                    </div>

                    <button 
                      disabled={!withdrawAmount || Number(withdrawAmount) < 10000}
                      onClick={handleWithdraw}
                      className="w-full h-14 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50 mt-4"
                    >
                      Konfirmasi Penarikan
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-center py-4">
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 bg-green-500 rounded-[28px] flex items-center justify-center text-white mb-6 shadow-xl shadow-green-100"
                  >
                    <CheckCircle2 className="w-10 h-10" />
                  </motion.div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Penarikan Berhasil!</h2>
                  <p className="text-xs text-gray-500 font-medium px-10 mb-8">Dana sebesar <span className="font-black text-gray-900">Rp {Number(withdrawAmount).toLocaleString()}</span> sedang dikirim ke OVO kamu.</p>
                  
                  <button 
                    onClick={() => setShowWithdraw(false)}
                    className="w-full h-14 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                  >
                    Mantap Bro!
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SupportView() {
  const faqs = [
    { q: 'Gimana cara dapet worker?', a: 'Post kerjaan kamu dulu, nanti worker bakal ngebid. Kamu tinggal pilih yang cocok!' },
    { q: 'Aman nggak bayar di sini?', a: 'Sangat aman! Saldo cuma bakal diterusin ke worker kalau kamu udah klik Beresin.' },
    { q: 'Gimana kalau worker kabur?', a: 'Jangan khawatir, tim UBeres bakal bantu mediasi dan balikin saldo kamu.' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3">
        <button className="p-5 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col items-center gap-3 transition-all active:scale-95">
          <MessageCircle className="w-6 h-6 text-blue-500" />
          <span className="text-[10px] font-black text-blue-600 uppercase">Live Chat</span>
        </button>
        <button className="p-5 bg-green-50 rounded-3xl border border-green-100 flex flex-col items-center gap-3 transition-all active:scale-95">
          <Phone className="w-6 h-6 text-green-500" />
          <span className="text-[10px] font-black text-green-600 uppercase">Hubungi WA</span>
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Pertanyaan Umum (FAQ)</h3>
        <div className="space-y-3">
          {faqs.map((f, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <h4 className="font-black text-gray-900 text-xs mb-2">{f.q}</h4>
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PaymentView() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="p-4 bg-gray-50 rounded-[24px] border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <WalletIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-xs mb-0.5">OVO</h4>
              <p className="text-[10px] text-gray-500 font-medium">0812 **** 7890</p>
            </div>
          </div>
          <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">Utama</span>
        </div>

        <div className="p-4 bg-gray-50 rounded-[24px] border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-xs mb-0.5">BCA Virtual Account</h4>
              <p className="text-[10px] text-gray-500 font-medium">8077 **** 1234</p>
            </div>
          </div>
        </div>
      </div>

      <button className="w-full h-14 bg-gray-900 text-white rounded-[24px] font-black text-xs flex items-center justify-center gap-2 mt-4">
        <Plus className="w-4 h-4" /> Tambah Metode Baru
      </button>
    </div>
  );
}

function WalletIcon(props: any) {
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
