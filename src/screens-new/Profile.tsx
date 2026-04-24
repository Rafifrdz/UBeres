import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BottomNav } from '../components/BottomNav';
import { apiFetch } from '../lib/api';
import { Job } from '../types';
import { Star, StarHalf, Briefcase, DollarSign, Settings as SettingsIcon, ChevronRight, Award, TrendingUp, Target, CheckCircle, Wallet, Clock, Loader, FileText } from 'lucide-react';

export function Profile() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [jobCounts, setJobCounts] = useState({ waiting: 0, ongoing: 0, completed: 0 });

  useEffect(() => {
    if (!user) return;

    apiFetch<{ data: Job[] }>(`/jobs?${user.role === 'client' ? 'clientId' : 'workerId'}=${user.uid}&limit=100`)
      .then(res => {
        const myJobs = res.data || [];
        if (user.role === 'client') {
          setJobCounts({
            waiting: myJobs.filter(j => j.status === 'open' || j.status === 'assigned').length,
            ongoing: myJobs.filter(j => j.status === 'paid' || j.status === 'working' || j.status === 'submitting').length,
            completed: myJobs.filter(j => j.status === 'completed').length
          });
        } else if (user.role === 'worker') {
          setJobCounts({
            waiting: myJobs.filter(j => j.status === 'assigned' || j.status === 'paid').length,
            ongoing: myJobs.filter(j => j.status === 'working' || j.status === 'submitting').length,
            completed: myJobs.filter(j => j.status === 'completed').length
          });
        }
      })
      .catch(console.error);
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20 overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#6366F1] to-[#4F46E5] px-6 pt-6 pb-8 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        {/* Settings Button */}
        <button
          onClick={() => navigate('/settings')}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <SettingsIcon className="w-6 h-6 text-white" />
        </button>

        {/* Avatar & Info */}
        <div className="relative flex flex-col items-center">
          <div className="relative mb-2">
            <img
              src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
              alt={user.displayName || user.name}
              className="w-16 h-16 rounded-full border-4 border-white/20 shadow-xl"
            />
            {user.isVerified && (
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#10B981] rounded-full border-2 border-[#6366F1] flex items-center justify-center">
                <Award className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>

          <h2 className="text-lg font-bold text-white mb-1">{user.name}</h2>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-xs font-medium flex items-center gap-1.5">
              {user.role === 'client' ? (
                <>
                  <Target className="w-3 h-3" />
                  Client
                </>
              ) : (
                <>
                  <Briefcase className="w-3 h-3" />
                  Worker
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => {
                const r = user.rating || 0;
                if (r >= i + 1) {
                  return <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />;
                } else if (r >= i + 0.5) {
                  return <StarHalf key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />;
                } else {
                  return <Star key={i} className="w-3.5 h-3.5 fill-white/20 text-white/30" />;
                }
              })}
            </div>
            <span className="text-white text-sm font-medium">{(user.rating || 0).toFixed(1)}</span>
          </div>

          {user.bio && (
            <p className="text-white/70 text-center max-w-xs text-xs leading-relaxed">
              {user.bio}
            </p>
          )}
        </div>
      </div>

      {/* Wallet Card */}
      <div className="px-5 mt-6 mb-6">
        <div className="bg-gradient-to-br from-[#6366F1] to-[#4F46E5] rounded-[20px] shadow-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-white" />
                <span className="text-white/80 text-sm font-medium">Saldo UBeres</span>
              </div>
              <CheckCircle className="w-5 h-5 text-white/60" />
            </div>

            <p className="text-3xl font-bold text-white mb-6">
              Rp {(user.balance || 0).toLocaleString('id-ID')}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/topup')}
                className="flex-1 bg-white text-[#6366F1] rounded-[12px] py-3 px-4 font-semibold hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Top Up
              </button>
              <button
                onClick={() => navigate('/withdraw')}
                className="flex-1 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-[12px] py-3 px-4 font-semibold hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                Tarik
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Card - Worker Only */}
      {user.role === 'worker' && (
        <div className="px-5 mt-6 mb-6">
          <div className="bg-white rounded-[20px] shadow-lg p-6">
            <div className="grid grid-cols-3 divide-x divide-gray-100">
              <div className="text-center px-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2.5">
                  <Briefcase className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{user.completedTasks}</p>
                <p className="text-xs text-gray-500 font-medium">Tugas Selesai</p>
              </div>

              <div className="text-center px-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2.5">
                  <Star className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {user.rating > 0 ? user.rating.toFixed(1) : '—'}
                </p>
                <p className="text-xs text-gray-500 font-medium">Rating</p>
              </div>

              <div className="text-center px-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2.5">
                  <TrendingUp className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {user.earnings > 0 ? `${Math.round(user.earnings / 1000)}K` : '—'}
                </p>
                <p className="text-xs text-gray-500 font-medium">Earnings</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skills Section (Worker only) */}
      {user.role === 'worker' && user.skills.length > 0 && (
        <div className="px-5 mb-6">
          <div className="bg-white rounded-[18px] p-5 shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-gray-900 rounded-full" />
              Skills & Expertise
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map(skill => (
                <span
                  key={skill}
                  className="px-4 py-2.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-[12px] text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tugas Saya */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">Tugas Saya</h3>
          <button
            onClick={() => navigate(user.role === 'client' ? '/my-posts' : '/my-jobs')}
            className="text-sm text-[#6366F1] font-medium"
          >
            Lihat Semua
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {user.role === 'client' ? (
            <>
              {/* Client: Menunggu */}
              <button
                onClick={() => navigate('/my-posts?tab=waiting')}
                className="bg-white rounded-[16px] p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#6366F1] transition-all active:scale-95 flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-2 relative">
                  <Clock className="w-6 h-6 text-orange-500" />
                  {jobCounts.waiting > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {jobCounts.waiting}
                    </div>
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-900 text-center">Menunggu</span>
                {jobCounts.waiting > 0 && (
                  <span className="text-[10px] text-gray-500 mt-0.5">{jobCounts.waiting} tugas</span>
                )}
              </button>

              {/* Client: Dikerjakan */}
              <button
                onClick={() => navigate('/my-posts?tab=ongoing')}
                className="bg-white rounded-[16px] p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#6366F1] transition-all active:scale-95 flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2 relative">
                  <Loader className="w-6 h-6 text-blue-500" />
                  {jobCounts.ongoing > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {jobCounts.ongoing}
                    </div>
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-900 text-center">Dikerjakan</span>
                {jobCounts.ongoing > 0 && (
                  <span className="text-[10px] text-gray-500 mt-0.5">{jobCounts.ongoing} tugas</span>
                )}
              </button>

              {/* Client: Selesai */}
              <button
                onClick={() => navigate('/my-posts?tab=completed')}
                className="bg-white rounded-[16px] p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#6366F1] transition-all active:scale-95 flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-2 relative">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  {jobCounts.completed > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {jobCounts.completed}
                    </div>
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-900 text-center">Selesai</span>
                {jobCounts.completed > 0 && (
                  <span className="text-[10px] text-gray-500 mt-0.5">{jobCounts.completed} tugas</span>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Worker: Perlu Dikerjakan */}
              <button
                onClick={() => navigate('/my-jobs?tab=waiting')}
                className="bg-white rounded-[16px] p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#6366F1] transition-all active:scale-95 flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-2 relative">
                  <FileText className="w-6 h-6 text-orange-500" />
                  {jobCounts.waiting > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {jobCounts.waiting}
                    </div>
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-900 text-center">Perlu Dikerjakan</span>
                {jobCounts.waiting > 0 && (
                  <span className="text-[10px] text-gray-500 mt-0.5">{jobCounts.waiting} tugas</span>
                )}
              </button>

              {/* Worker: Sedang Dikerjakan */}
              <button
                onClick={() => navigate('/my-jobs?tab=ongoing')}
                className="bg-white rounded-[16px] p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#6366F1] transition-all active:scale-95 flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2 relative">
                  <Loader className="w-6 h-6 text-blue-500" />
                  {jobCounts.ongoing > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {jobCounts.ongoing}
                    </div>
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-900 text-center">Sedang Dikerjakan</span>
                {jobCounts.ongoing > 0 && (
                  <span className="text-[10px] text-gray-500 mt-0.5">{jobCounts.ongoing} tugas</span>
                )}
              </button>

              {/* Worker: Selesai */}
              <button
                onClick={() => navigate('/my-jobs?tab=completed')}
                className="bg-white rounded-[16px] p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#6366F1] transition-all active:scale-95 flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-2 relative">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  {jobCounts.completed > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {jobCounts.completed}
                    </div>
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-900 text-center">Selesai</span>
                {jobCounts.completed > 0 && (
                  <span className="text-[10px] text-gray-500 mt-0.5">{jobCounts.completed} tugas</span>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
