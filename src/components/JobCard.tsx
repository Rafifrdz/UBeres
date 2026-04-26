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
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all active:scale-[0.98] flex flex-col h-full"
    >
      {/* Featured Image - Only if exists */}
      {job.images && job.images.length > 0 ? (
        <div className="relative aspect-square bg-gray-50">
          <img
            src={job.images[0]}
            alt={job.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${categoryColors[job.category] || 'bg-gray-100 text-gray-900'} shadow-sm`}>
              {job.category}
            </span>
          </div>
        </div>
      ) : (
        /* No Image State - Show category badge at top of content */
        <div className="p-2.5 pb-0">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${categoryColors[job.category] || 'bg-gray-100 text-gray-900'}`}>
            {job.category}
          </span>
        </div>
      )}

      <div className="p-2.5 flex flex-col flex-1">
        {/* Title - Larger & Bolder */}
        <h3 className="text-[15px] font-bold text-gray-800 line-clamp-2 leading-tight mb-1">
          {job.title}
        </h3>

        {/* Price - Smaller */}
        <div className="text-[13px] font-semibold text-[#6366F1] mb-1.5">
          Rp {(job.budget || 0).toLocaleString('id-ID')}
        </div>

        {/* Uploader - New Section */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <img
            src={job.isAnonymous ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=anon&backgroundColor=b6e3f4' : (job.clientPhotoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${job.clientId}`)}
            alt="Uploader"
            className="w-4 h-4 rounded-full object-cover ring-1 ring-gray-100"
          />
          <span className="text-[11px] text-gray-500 truncate font-medium">
            {job.isAnonymous ? 'Anonim' : (job.clientName || 'User')}
          </span>
        </div>

        {/* Footer Info - Compact */}
        <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{job.bidCount} bid</span>
          </div>
        </div>
      </div>
    </div>
  );
}
