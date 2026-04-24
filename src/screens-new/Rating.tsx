import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { storage, generateId } from '../utils-new/storage';
import { useToast } from '../components/Toast';
import { ArrowLeft, Star } from 'lucide-react';
import { motion } from 'motion/react';

const RATING_LABELS = ['Sangat kecewa', 'Kurang puas', 'Cukup baik', 'Bagus', 'Luar biasa'];

const QUICK_TAGS = [
  'Responsif',
  'Profesional',
  'Cepat',
  'Komunikatif',
  'Hasil memuaskan',
  'Sesuai brief',
  'Rekomendasi',
  'Akan repeat order',
];

export function Rating() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useApp();
  const { showToast } = useToast();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!user || !jobId || rating === 0) {
      showToast('Pilih rating terlebih dahulu', 'error');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const newRating = {
        id: generateId(),
        jobId,
        fromUserId: user.uid,
        toUserId: 'other_user', // In real app, get from job data
        rating,
        review,
        tags: selectedTags,
        createdAt: new Date().toISOString(),
      };

      storage.addRating(newRating);
      showToast('Rating berhasil dikirim!', 'success');
      navigate('/my-jobs');
    }, 1000);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-8">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4 sticky top-0 z-10 border-b border-gray-100 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-semibold text-gray-900">Beri Rating</h1>
      </div>

      <div className="px-6 space-y-8">
        {/* Confetti Animation Area */}
        {rating === 5 && (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-6xl mb-2"
            >
              🎉
            </motion.div>
          </div>
        )}

        {/* Stars */}
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Bagaimana pengalamanmu?
          </h2>
          <p className="text-gray-500 mb-6">
            Rating kamu akan membantu orang lain
          </p>

          <div className="flex items-center justify-center gap-3 mb-3">
            {[1, 2, 3, 4, 5].map(value => (
              <motion.button
                key={value}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-12 h-12 transition-all ${
                    value <= displayRating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </motion.button>
            ))}
          </div>

          {displayRating > 0 && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium text-gray-700"
            >
              {RATING_LABELS[displayRating - 1]}
            </motion.p>
          )}
        </div>

        {/* Quick Tags */}
        {rating > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Quick Tags (Optional)
            </h3>
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-[#6366F1] text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-[#6366F1]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Review Text */}
        {rating > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Tulis Review (Optional)
            </h3>
            <textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder="Ceritakan pengalamanmu lebih detail..."
              rows={5}
              className="w-full bg-white border border-gray-200 rounded-[10px] px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            />
          </motion.div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className="w-full bg-[#6366F1] text-white rounded-[10px] py-4 font-medium hover:bg-[#4F46E5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Mengirim...' : 'Kirim Rating'}
        </button>
      </div>
    </div>
  );
}
