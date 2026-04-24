import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Camera, X } from 'lucide-react';
import { useToast } from '../components/Toast';

const AVAILABLE_SKILLS = [
  'UI/UX Design',
  'Graphic Design',
  'Web Development',
  'Mobile Development',
  'Data Analysis',
  'Content Writing',
  'Translation',
  'Video Editing',
  'Mathematics',
  'Physics',
  'Chemistry',
  'English',
];

export function ProfileSetup() {
  const navigate = useNavigate();
  const { user, updateUser } = useApp();
  const { showToast } = useToast();
  const [name, setName] = useState(user?.displayName || (user as any)?.name || '');
  const [bio, setBio] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const isWorker = user?.role === 'worker';
  const canSubmit = name.trim().length > 0;

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else if (selectedSkills.length < 8) {
      setSelectedSkills([...selectedSkills, skill]);
    } else {
      showToast('Maksimal 8 skill', 'warning');
    }
  };

  const handleSubmit = async () => {
    if (canSubmit) {
      // Perbarui context lokal
      updateUser({ 
        displayName: name,
        name: name, // fallback untuk kompatibilitas jika masih dipakai
        bio,
        skills: isWorker ? selectedSkills : []
      });

      // Jika ada endpoint backend untuk update user (PATCH /users/:uid/portfolio)
      try {
        if (user?.uid) {
          await fetch(`http://localhost:8080/api/users/${user.uid}/portfolio`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              bio, 
              skills: isWorker ? selectedSkills : [],
              // API ini saat ini belum update nama, tapi kita kirim berjaga-jaga
              displayName: name 
            })
          });
        }
      } catch (err) {
        console.error('Failed to update profile to backend:', err);
      }

      navigate('/feed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-8">
      <div className="bg-gray-900 px-6 py-8 text-white mb-6">
        <h1 className="text-2xl font-bold mb-2">Lengkapi Profile</h1>
        <p className="text-white/80">Biar client/worker kenal kamu lebih baik</p>
      </div>

      <div className="px-6 space-y-6">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'default'}`}
              alt="Avatar"
              className="w-[88px] h-[88px] rounded-full border-4 border-white shadow-lg"
            />
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#6366F1] rounded-full flex items-center justify-center shadow-lg">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Lengkap *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Masukkan nama kamu"
            className="w-full bg-white border border-gray-200 rounded-[10px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio {!isWorker && '(Optional)'}
          </label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder={isWorker ? 'Ceritain keahlian dan pengalaman kamu' : 'Ceritain tentang kamu'}
            maxLength={200}
            rows={4}
            className="w-full bg-white border border-gray-200 rounded-[10px] px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
          />
          <div className="text-xs text-gray-500 text-right mt-1">
            {bio.length}/200
          </div>
        </div>

        {/* Skills (Worker only) */}
        {isWorker && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills (Max 8)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedSkills.map(skill => (
                <div
                  key={skill}
                  className="bg-[#6366F1] text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
                >
                  {skill}
                  <button
                    onClick={() => toggleSkill(skill)}
                    className="hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SKILLS.filter(s => !selectedSkills.includes(s)).map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-sm hover:border-[#6366F1] hover:text-[#6366F1] transition-colors"
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full bg-[#6366F1] text-white rounded-[10px] px-6 py-4 font-medium hover:bg-[#4F46E5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Simpan & Mulai
        </button>
      </div>
    </div>
  );
}
