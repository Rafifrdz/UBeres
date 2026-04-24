import { useNavigate, useParams } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { Star, StarHalf, Briefcase, TrendingUp, ArrowLeft, MessageCircle, Award, Target } from 'lucide-react';

import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { UserProfile } from '../types';

export function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      Promise.all([
        apiFetch<{ data: UserProfile }>(`/users/${userId}`),
        apiFetch<{ data: any[] }>(`/users/${userId}/reviews`)
      ])
        .then(([userRes, reviewsRes]) => {
          setUser(userRes.data);
          setReviews(reviewsRes.data || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <p className="text-gray-500">Memuat profil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <p className="text-gray-500">User tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-br from-[#6366F1] to-[#4F46E5] px-6 pt-6 pb-8 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        {/* Avatar & Info */}
        <div className="relative flex flex-col items-center">
          <div className="relative mb-2">
            <img
              src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
              alt={user.displayName}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`;
              }}
              className="w-16 h-16 rounded-full border-4 border-white/20 shadow-xl object-cover"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#10B981] rounded-full border-2 border-[#6366F1] flex items-center justify-center">
              <Award className="w-2.5 h-2.5 text-white" />
            </div>
          </div>

          <h2 className="text-lg font-bold text-white mb-1">{user.displayName}</h2>

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

          <p className="text-white/70 text-center max-w-xs text-xs leading-relaxed mb-2">
            {user.bio || 'Belum ada bio.'}
          </p>

          <p className="text-white/50 text-[10px]">Bergabung {new Date(user.createdAt).getFullYear()}</p>
        </div>
      </div>

      {/* Stats Card */}
      <div className="px-6 mt-6 mb-6">
        <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <div className="text-center px-2">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Briefcase className="w-5 h-5 text-gray-900" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-0.5">{user.totalRatings || 0}</p>
              <p className="text-xs text-gray-500">Ulasan</p>
            </div>

            <div className="text-center px-2">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-0.5">
                {(user.rating || 0).toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">Rating</p>
            </div>

            <div className="text-center px-2">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-0.5">98%</p>
              <p className="text-xs text-gray-500">Success Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      {(user.skills && user.skills.length > 0) && (
        <div className="px-6 mb-6">
          <div className="bg-white rounded-[16px] p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-gray-900 rounded-full" />
              Skills & Expertise
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map(skill => (
                <span
                  key={skill}
                  className="px-3 py-2 bg-gray-100 border border-gray-200 text-gray-700 rounded-[10px] text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-[16px] p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-gray-900 rounded-full" />
            Reviews Terbaru
          </h3>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Belum ada ulasan.</p>
            ) : (
              reviews.map((review) => (
                <div key={review._id || review.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <img
                      src={review.reviewerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.reviewerId}`}
                      alt={review.reviewerName}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.reviewerId}`;
                      }}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 text-sm">{review.reviewerName}</h4>
                        <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex items-center gap-0.5 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < (review.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Contact Button */}
      {user.role === 'worker' && (
        <div className="px-6 mb-6">
          <button className="w-full bg-[#6366F1] text-white rounded-[12px] px-6 py-4 font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Hubungi Worker
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
