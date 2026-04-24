import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Clock, Users } from 'lucide-react';
import { Job } from '../types';

const categoryColors: Record<string, string> = {
  'Semua': 'bg-gray-100 text-gray-700',
  'Desain': 'bg-blue-100 text-blue-700',
  'Coding': 'bg-purple-100 text-purple-700',
  'Penulisan': 'bg-green-100 text-green-700',
  'Umum': 'bg-amber-100 text-amber-700',
  'Bahasa': 'bg-rose-100 text-rose-700',
};
import { useNavigate } from 'react-router-dom';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const navigate = useNavigate();
  const isUrgent = new Date(job.deadline).getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000;

  const timeAgo = formatDistanceToNow(new Date(job.createdAt), {
    addSuffix: true,
    locale: localeId,
  });

  return (
    <div
      onClick={() => navigate(`/job/${job.id}`)}
      className="bg-white rounded-[18px] p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all active:scale-[0.98]"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[job.category]}`}>
              {job.category}
            </span>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>
          <h3 className="text-base font-semibold text-[#6366F1] line-clamp-2 leading-snug">{job.title}</h3>
        </div>
        <img
          src={job.isAnonymous ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=anon&backgroundColor=b6e3f4' : (job.clientPhotoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${job.clientId}`)}
          alt="Client"
          onError={(e) => {
            if (!job.isAnonymous) {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${job.clientId}`;
            }
          }}
          className="w-12 h-12 rounded-full flex-shrink-0 ring-2 ring-gray-100 object-cover"
        />
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">{job.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
            Rp {(job.budget || 0).toLocaleString('id-ID')}
          </div>
          <div className={`flex items-center gap-1 text-sm ${isUrgent ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
            <Clock className="w-4 h-4" />
            {new Date(job.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span className="font-medium">{job.bidCount}</span>
        </div>
      </div>
    </div>
  );
}
