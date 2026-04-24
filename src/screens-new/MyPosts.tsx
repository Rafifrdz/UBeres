import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../lib/api';
import { storage, Job, statusConfig } from '../utils-new/storage';
import { BottomNav } from '../components/BottomNav';
import { EmptyState } from '../components/EmptyState';
import { Briefcase, Plus, Clock, Loader, CheckCircle, ArrowLeft } from 'lucide-react';

type TabType = 'waiting' | 'ongoing' | 'completed';

export function MyPosts() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabFromUrl || 'waiting');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobCounts, setJobCounts] = useState({ waiting: 0, ongoing: 0, completed: 0 });

  // Redirect worker to my-jobs
  useEffect(() => {
    if (user?.role === 'worker') {
      navigate('/my-jobs');
    }
  }, [user, navigate]);

  useEffect(() => {
    loadJobs();
  }, [user, activeTab]);

  const loadJobs = async () => {
    if (!user) return;
    
    try {
      const response = await apiFetch<{ data: Job[] }>(`/jobs?clientId=${user.uid}&limit=100`);
      const myJobs = response.data || [];

      // Count jobs for each tab
      const waitingJobs = myJobs.filter(j => j.status === 'open' || j.status === 'assigned');
      const ongoingJobs = myJobs.filter(j => j.status === 'paid' || j.status === 'working' || j.status === 'submitting');
      const completedJobs = myJobs.filter(j => j.status === 'completed');

      setJobCounts({
        waiting: waitingJobs.length,
        ongoing: ongoingJobs.length,
        completed: completedJobs.length
      });

      let filtered: Job[] = [];
      switch (activeTab) {
        case 'waiting':
          filtered = waitingJobs;
          break;
        case 'ongoing':
          filtered = ongoingJobs;
          break;
        case 'completed':
          filtered = completedJobs;
          break;
      }

      setJobs(filtered);
    } catch (error) {
      console.error('Failed to load my posts:', error);
    }
  };

  const getStatusSteps = () => {
    return ['open', 'assigned', 'paid', 'working', 'submitting', 'completed'];
  };

  const getCurrentStepIndex = (status: string) => {
    return getStatusSteps().indexOf(status);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="px-5 pt-4 pb-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Tugas Saya</h1>
        </div>

        {/* Tabs - Shopee Style */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('waiting')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-all relative ${
              activeTab === 'waiting' ? 'text-[#6366F1]' : 'text-gray-600'
            }`}
          >
            <Clock className={`w-4 h-4 ${activeTab === 'waiting' ? 'text-[#6366F1]' : 'text-gray-400'}`} />
            <span className="text-sm font-semibold">Menunggu</span>
            {jobCounts.waiting > 0 && (
              <span className={`min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 ${
                activeTab === 'waiting'
                  ? 'bg-[#6366F1] text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {jobCounts.waiting}
              </span>
            )}
            {activeTab === 'waiting' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366F1]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('ongoing')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-all relative ${
              activeTab === 'ongoing' ? 'text-[#6366F1]' : 'text-gray-600'
            }`}
          >
            <Loader className={`w-4 h-4 ${activeTab === 'ongoing' ? 'text-[#6366F1]' : 'text-gray-400'}`} />
            <span className="text-sm font-semibold">Dikerjakan</span>
            {jobCounts.ongoing > 0 && (
              <span className={`min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 ${
                activeTab === 'ongoing'
                  ? 'bg-[#6366F1] text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {jobCounts.ongoing}
              </span>
            )}
            {activeTab === 'ongoing' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366F1]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-all relative ${
              activeTab === 'completed' ? 'text-[#6366F1]' : 'text-gray-600'
            }`}
          >
            <CheckCircle className={`w-4 h-4 ${activeTab === 'completed' ? 'text-[#6366F1]' : 'text-gray-400'}`} />
            <span className="text-sm font-semibold">Selesai</span>
            {jobCounts.completed > 0 && (
              <span className={`min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 ${
                activeTab === 'completed'
                  ? 'bg-[#6366F1] text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {jobCounts.completed}
              </span>
            )}
            {activeTab === 'completed' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366F1]" />
            )}
          </button>
        </div>
      </div>

      {/* Job List */}
      <div className="px-5 pt-4">
        {jobs.length === 0 ? (
          <EmptyState
            icon={
              activeTab === 'waiting' ? <Clock className="w-16 h-16" /> :
              activeTab === 'ongoing' ? <Loader className="w-16 h-16" /> :
              <CheckCircle className="w-16 h-16" />
            }
            title={
              activeTab === 'waiting' ? 'Belum ada tugas menunggu' :
              activeTab === 'ongoing' ? 'Belum ada tugas dikerjakan' :
              'Belum ada tugas selesai'
            }
            description={activeTab === 'waiting' ? 'Post tugas pertamamu sekarang' : 'Tugas yang sedang dalam proses akan muncul di sini'}
            action={
              activeTab === 'waiting' ? (
                <button
                  onClick={() => navigate('/post-job')}
                  className="flex items-center gap-2 bg-[#6366F1] text-white px-6 py-3 rounded-[12px] font-semibold hover:bg-[#4F46E5] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Post Tugas
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div
                key={job.id}
                onClick={() => navigate(`/job/${job.id}`)}
                className="bg-white rounded-[18px] p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all active:scale-[0.98]"
              >
                {/* Status Badge */}
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${statusConfig[job.status]?.color}`}>
                  {statusConfig[job.status]?.label}
                </span>

                {/* Title & Description */}
                <h3 className="text-base font-semibold text-[#6366F1] mb-2">{job.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">{job.description}</p>

                {/* Status Pipeline */}
                <div className="mb-4">
                  <div className="flex items-center gap-1">
                    {getStatusSteps().map((step, index) => {
                      const currentIndex = getCurrentStepIndex(job.status);
                      const isCompleted = index <= currentIndex;
                      const isCurrent = index === currentIndex;

                      return (
                        <div
                          key={step}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            isCompleted
                              ? isCurrent
                                ? 'bg-[#6366F1]'
                                : 'bg-gray-1000'
                              : 'bg-gray-200'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Budget</p>
                    <p className="text-sm font-semibold text-gray-900">Rp {job.budget.toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Deadline</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(job.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Bids</p>
                    <p className="text-sm font-semibold text-gray-900">{job.bidCount}</p>
                  </div>
                </div>

                {/* Actions for Client */}
                <div className="flex gap-2">
                  {job.status === 'open' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/job/${job.id}`);
                      }}
                      className="flex-1 bg-[#6366F1] text-white rounded-[12px] py-3 text-sm font-semibold hover:bg-[#4F46E5] transition-colors"
                    >
                      Lihat Bid ({job.bidCount})
                    </button>
                  )}
                  {job.status === 'assigned' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/payment/${job.id}`);
                      }}
                      className="flex-1 bg-green-600 text-white rounded-[12px] py-3 text-sm font-semibold hover:bg-green-700 transition-colors"
                    >
                      Bayar Sekarang
                    </button>
                  )}
                  {job.status === 'submitting' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/job/${job.id}`);
                      }}
                      className="flex-1 bg-orange-600 text-white rounded-[12px] py-3 text-sm font-semibold hover:bg-orange-700 transition-colors"
                    >
                      Review Hasil
                    </button>
                  )}
                  {(job.status === 'paid' || job.status === 'working') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/chat/${job.id}`);
                      }}
                      className="flex-1 bg-[#F1F3F7] text-gray-700 rounded-[12px] py-3 text-sm font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Chat dengan Worker
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 left-0 right-0 max-w-[430px] mx-auto px-6 pointer-events-none z-10">
        <button
          onClick={() => navigate('/post-job')}
          className="ml-auto bg-[#6366F1] text-white p-4 rounded-full shadow-lg hover:bg-[#4F46E5] transition-all hover:scale-110 active:scale-95 pointer-events-auto flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
