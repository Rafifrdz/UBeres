import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../lib/api';
import { storage, Job, statusConfig } from '../utils-new/storage';
import { BottomNav } from '../components/BottomNav';
import { EmptyState } from '../components/EmptyState';
import { Briefcase, FileText, Loader, CheckCircle, ArrowLeft } from 'lucide-react';

type TabType = 'waiting' | 'ongoing' | 'completed';

export function MyJobs() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabFromUrl || 'waiting');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobCounts, setJobCounts] = useState({ waiting: 0, ongoing: 0, completed: 0 });

  // Redirect client to feed (they shouldn't access My Jobs)
  useEffect(() => {
    if (user?.role === 'client') {
      navigate('/feed');
    }
  }, [user, navigate]);

  useEffect(() => {
    loadJobs();
  }, [user, activeTab]);

  const loadJobs = async () => {
    if (!user) return;
    
    try {
      const response = await apiFetch<{ data: Job[] }>(`/jobs?workerId=${user.uid}&limit=100`);
      const myJobs = response.data || [];

      // Count jobs for each tab
      const waitingJobs = myJobs.filter(j => j.status === 'assigned' || j.status === 'paid');
      const ongoingJobs = myJobs.filter(j => j.status === 'working' || j.status === 'submitting');
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
      console.error('Failed to load my jobs:', error);
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
            <FileText className={`w-4 h-4 ${activeTab === 'waiting' ? 'text-[#6366F1]' : 'text-gray-400'}`} />
            <span className="text-sm font-semibold">Perlu Dikerjakan</span>
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
            <span className="text-sm font-semibold">Sedang Dikerjakan</span>
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
      <div className="px-6 pt-4">
        {jobs.length === 0 ? (
          <EmptyState
            icon={
              activeTab === 'waiting' ? <FileText className="w-16 h-16" /> :
              activeTab === 'ongoing' ? <Loader className="w-16 h-16" /> :
              <CheckCircle className="w-16 h-16" />
            }
            title={
              activeTab === 'waiting' ? 'Belum ada tugas perlu dikerjakan' :
              activeTab === 'ongoing' ? 'Belum ada tugas sedang dikerjakan' :
              'Belum ada tugas selesai'
            }
            description="Mulai bid di Feed untuk mendapatkan tugas"
          />
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div
                key={job.id}
                onClick={() => navigate(`/job/${job.id}`)}
                className="bg-white rounded-[16px] p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                {/* Status Badge */}
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${statusConfig[job.status].color}`}>
                  {statusConfig[job.status].label}
                </span>

                {/* Title & Description */}
                <h3 className="font-semibold text-[#6366F1] mb-2">{job.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{job.description}</p>

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
                          className={`h-1 flex-1 rounded-full ${
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

                {/* Actions for Worker */}
                <div className="flex gap-2">
                  {job.status === 'paid' && (
                    <button
                      onClick={() => navigate(`/job/${job.id}`)}
                      className="flex-1 bg-[#6366F1] text-white rounded-[12px] py-3 text-sm font-semibold hover:bg-[#4F46E5] transition-colors"
                    >
                      Mulai Kerjakan
                    </button>
                  )}
                  {job.status === 'working' && (
                    <button
                      onClick={() => navigate(`/submit-result/${job.id}`)}
                      className="flex-1 bg-[#6366F1] text-white rounded-[12px] py-3 text-sm font-semibold hover:bg-[#4F46E5] transition-colors"
                    >
                      Submit Hasil
                    </button>
                  )}
                  {job.status === 'assigned' && (
                    <button
                      onClick={() => navigate(`/chat/${job.id}`)}
                      className="flex-1 bg-[#F1F3F7] text-gray-700 rounded-[12px] py-3 text-sm font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Chat dengan Client
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
