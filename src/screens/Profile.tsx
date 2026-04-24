import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Job } from '../types';
import { Settings, Bookmark, History, CreditCard, HelpCircle, LogOut, Star, Edit3, ClipboardList, Wallet, ChevronLeft, ChevronRight, Plus, ArrowUpRight, ArrowDownLeft, MessageCircle, Phone, CheckCircle2, ShieldCheck, Layout, Loader2 } from 'lucide-react';
import { apiFetch } from '../lib/api';

interface ProfileProps {
  user: UserProfile;
  onLogout: () => void;
  onSettings: () => void;
  onViewMyJobs: () => void;
}

type ProfileSubScreen = 'main' | 'wallet' | 'support' | 'payments' | 'work-history' | 'saved-jobs' | 'portfolio';

export default function Profile({ user, onLogout, onSettings, onViewMyJobs }: ProfileProps) {
  const [activeSub, setActiveSub] = useState<ProfileSubScreen>('main');
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{ data: UserProfile }>(`/users/${user.uid}`);
      setUserData(response.data);
    } catch (error) {
      console.error('Fetch profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user.uid]);

  const handleBack = () => {
    setActiveSub('main');
    fetchUserData();
  };

  const displayUser = userData || user;

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
              <button onClick={onSettings} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-blue-500 transition-all">
                <Settings className="w-5 h-5" />
              </button>
              
              <div className="w-20 h-20 rounded-3xl bg-blue-100 p-0.5 border-4 border-white shadow-lg mb-4 overflow-hidden relative">
                {displayUser.photoURL ? <img src={displayUser.photoURL} alt={displayUser.displayName} className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" /> : <div className="w-full h-full flex items-center justify-center font-black text-blue-500 text-2xl">{displayUser.displayName[0]}</div>}
                {displayUser.role === 'worker' && <div className="absolute bottom-1 right-1 bg-blue-600 rounded-full p-1 border-2 border-white shadow-lg"><CheckCircle2 className="w-2.5 h-2.5 text-white" /></div>}
              </div>

              <div className="flex items-center gap-1.5 mb-1">
                <h1 className="text-xl font-black text-gray-900">{displayUser.displayName}</h1>
                {displayUser.role === 'worker' && <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100"><ShieldCheck className="w-3 h-3 text-blue-600" /><span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Verified Worker</span></div>}
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-black uppercase rounded-lg">{displayUser.role}</span>
                <div className="flex items-center gap-1 text-xs font-black text-orange-500 bg-orange-50 px-3 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-orange-500" />
                  <span>{displayUser.rating?.toFixed(1) || '5.0'}</span>
                </div>
              </div>

              <div className="flex w-full gap-4 max-w-xs">
                <button className="flex-1 h-12 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 text-sm shadow-xl active:scale-95 transition-all"><Edit3 className="w-4 h-4" />Edit Profil</button>
              </div>
            </header>

            <main className="p-5 space-y-5">
              <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
                <button onClick={() => setActiveSub('wallet')} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500"><CreditCard className="w-4 h-4" /></div>
                    <span className="font-bold text-gray-700 text-sm">Saldo & Dompet</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Saldo Kamu</p>
                    <p className="text-xs font-black text-blue-600">Rp {(displayUser.balance || 0).toLocaleString()}</p>
                  </div>
                </button>
                
                {displayUser.role === 'worker' ? (
                  <>
                    <button onClick={() => setActiveSub('portfolio')} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 border-b border-gray-50">
                      <div className="flex items-center gap-3"><div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500"><Layout className="w-4 h-4" /></div><span className="font-bold text-gray-700 text-sm">Portofolio & Skill</span></div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                    <button onClick={() => setActiveSub('work-history')} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 border-b border-gray-50">
                      <div className="flex items-center gap-3"><div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500"><History className="w-4 h-4" /></div><span className="font-bold text-gray-700 text-sm">Riwayat Beresin</span></div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={onViewMyJobs} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 border-b border-gray-50">
                      <div className="flex items-center gap-3"><div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500"><ClipboardList className="w-4 h-4" /></div><span className="font-bold text-gray-700 text-sm">Riwayat Posting</span></div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                  </>
                )}
              </div>

              <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
                <button onClick={onLogout} className="w-full p-4 flex items-center justify-between hover:bg-red-50 group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center text-red-400"><LogOut className="w-4 h-4" /></div>
                    <span className="font-bold text-red-500 text-sm">Keluar Akun</span>
                  </div>
                </button>
              </div>
            </main>
          </motion.div>
        )}

        {activeSub !== 'main' && (
          <motion.div key="sub" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1 flex flex-col bg-white">
            <header className="px-6 pt-10 pb-6 flex items-center gap-4 sticky top-0 bg-white/80 backdrop-blur-xl z-30">
              <button onClick={handleBack} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100"><ChevronLeft className="w-5 h-5" /></button>
              <h1 className="text-xl font-black text-gray-900">
                {activeSub === 'wallet' ? 'Saldo & Dompet' : 
                 activeSub === 'work-history' ? 'Riwayat Beresin' : 
                 activeSub === 'portfolio' ? 'Portofolio' : 'Kembali'}
              </h1>
            </header>

            <div className="flex-1 overflow-y-auto px-6 pb-10">
              {activeSub === 'wallet' && <WalletView user={displayUser} onUpdate={fetchUserData} />}
              {activeSub === 'work-history' && <WorkHistoryView user={displayUser} />}
              {activeSub === 'portfolio' && <PortfolioView user={displayUser} onUpdate={fetchUserData} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PortfolioView({ user, onUpdate }: { user: UserProfile, onUpdate: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(user.bio || '');
  const [skills, setSkills] = useState<string[]>(user.skills || []);
  const [projects, setProjects] = useState<any[]>(user.portfolio || []);
  const [reviews, setReviews] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await apiFetch<{ data: any[] }>(`/users/${user.uid}/reviews`);
        setReviews(res.data || []);
      } catch (e) {}
    };
    fetchReviews();
  }, [user.uid]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiFetch(`/users/${user.uid}/portfolio`, {
        method: 'PATCH',
        body: JSON.stringify({ bio, skills, portfolio: projects })
      });
      setIsEditing(false);
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className={`fixed bottom-24 right-6 w-12 h-12 rounded-full shadow-2xl flex items-center justify-center z-50 transition-all ${isEditing ? 'bg-green-500 text-white' : 'bg-gray-900 text-white'}`}>
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditing ? <CheckCircle className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />)}
      </button>

      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-[32px] bg-gradient-to-tr from-blue-500 to-indigo-600 p-1 mb-4 shadow-xl">
          <div className="w-full h-full rounded-[28px] bg-white p-0.5 overflow-hidden">
            <img src={user.photoURL || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80"} className="w-full h-full object-cover rounded-[26px]" />
          </div>
        </div>
        {isEditing ? (
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full text-xs text-center bg-gray-50 rounded-xl p-3 h-20 outline-none" placeholder="Tulis bio kamu..." />
        ) : (
          <p className="text-xs text-gray-500 italic px-4">"{bio || 'Belum ada bio'}"</p>
        )}
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div><h3 className="font-black text-gray-900 text-sm">Rating & Ulasan</h3><p className="text-[10px] text-gray-400 font-bold uppercase">Reputasi Kamu</p></div>
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500"><Star className="w-5 h-5 fill-orange-500" /></div>
        </div>
        <div className="space-y-4">
          {reviews.map((r, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[8px] font-black text-blue-600 uppercase overflow-hidden">
                     {r.reviewerPhoto ? <img src={r.reviewerPhoto} className="w-full h-full object-cover" /> : r.reviewerName[0]}
                   </div>
                   <p className="text-[10px] font-black text-gray-900">{r.reviewerName}</p>
                </div>
                <div className="flex gap-0.5">
                   {[...Array(5)].map((_, j) => <Star key={j} className={`w-2.5 h-2.5 ${j < r.rating ? 'fill-orange-500 text-orange-500' : 'text-gray-200'}`} />)}
                </div>
              </div>
              <p className="text-[10px] text-gray-600 italic leading-relaxed">"{r.comment}"</p>
              <p className="text-[7px] text-gray-400 font-bold mt-1 text-right">{new Date(r.updatedAt || r.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
          {reviews.length === 0 && <p className="text-center py-6 text-[10px] font-bold text-gray-300 uppercase">Belum ada ulasan</p>}
        </div>
      </div>
    </div>
  );
}

function WalletView({ user, onUpdate }: { user: UserProfile, onUpdate: () => void }) {
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [submitting, setSubmitting] = useState(false);
  
  const handleAction = async (type: 'topup' | 'withdraw') => {
    if (!amount || Number(amount) < 10000) return;
    try {
      setSubmitting(true);
      await apiFetch(`/users/${user.uid}/${type}`, { method: 'POST', body: JSON.stringify({ amount: Number(amount) }) });
      setStep('success');
      onUpdate();
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-8">
      <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] text-white shadow-xl relative overflow-hidden">
        <p className="text-[10px] font-black uppercase opacity-60 mb-2 tracking-widest">Saldo UBeres</p>
        <h2 className="text-4xl font-black mb-6">Rp {(user.balance || 0).toLocaleString()}</h2>
        <div className="p-4 bg-white/10 rounded-2xl border border-white/10 mb-6">
          <p className="text-[9px] font-black uppercase opacity-60">Escrow</p>
          <p className="text-lg font-black">Rp {(user.escrow || 0).toLocaleString()}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setStep('form'); setShowTopUp(true); }} className="flex-1 h-12 bg-white text-blue-600 rounded-2xl font-black text-xs">Top Up</button>
          <button onClick={() => { setStep('form'); setShowWithdraw(true); }} className="flex-1 h-12 bg-white/20 rounded-2xl font-black text-xs text-white">Tarik</button>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Riwayat Transaksi</h3>
        {(user.transactions || []).slice().reverse().map((t: any, i: number) => (
          <div key={i} className="p-4 bg-white rounded-2xl flex items-center justify-between border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'in' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {t.type === 'in' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
              </div>
              <div><h4 className="font-black text-gray-900 text-[11px] mb-0.5">{t.title}</h4><p className="text-[9px] text-gray-400">{new Date(t.date).toLocaleDateString()}</p></div>
            </div>
            <p className={`font-black text-xs ${t.type === 'in' ? 'text-green-600' : 'text-gray-900'}`}>{t.type === 'in' ? '+' : '-'}{t.amount.toLocaleString()}</p>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {(showTopUp || showWithdraw) && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowTopUp(false); setShowWithdraw(false); }} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-md bg-white rounded-t-[40px] p-8 pb-10">
              {step === 'form' ? (
                <div className="space-y-6">
                  <h2 className="text-xl font-black text-gray-900">{showTopUp ? 'Top Up' : 'Tarik Saldo'}</h2>
                  <input type="number" placeholder="Nominal" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-gray-50 border-2 rounded-2xl p-4 font-black outline-none" />
                  <button onClick={() => handleAction(showTopUp ? 'topup' : 'withdraw')} className="w-full h-14 bg-gray-900 text-white rounded-2xl font-black uppercase">{submitting ? '...' : 'Konfirmasi'}</button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-black mb-8">Berhasil!</h2>
                  <button onClick={() => { setShowTopUp(false); setShowWithdraw(false); }} className="w-full h-14 bg-gray-900 text-white rounded-2xl font-black uppercase">Mantap!</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WorkHistoryView({ user }: { user: UserProfile }) {
  const [history, setHistory] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiFetch<{ data: Job[] }>(`/jobs?workerId=${user.uid}&status=completed`).then(res => { setHistory(res.data); setLoading(false); });
  }, [user.uid]);
  if (loading) return <div className="py-20 text-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" /></div>;
  return (
    <div className="space-y-4">
      {history.map((h, i) => (
        <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
          <div><h4 className="font-black text-gray-900 text-xs">{h.title}</h4><p className="text-[10px] text-gray-400">{h.clientName}</p></div>
          <p className="text-xs font-black text-blue-600">Rp {h.budget?.toLocaleString()}</p>
        </div>
      ))}
      {history.length === 0 && <p className="text-center py-10 text-[10px] font-bold text-gray-300 uppercase">Belum ada riwayat</p>}
    </div>
  );
}
