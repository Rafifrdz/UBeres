import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { ArrowLeft, Camera, X } from 'lucide-react';

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

export function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useApp();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(user?.skills || []);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else if (selectedSkills.length < 8) {
      setSelectedSkills([...selectedSkills, skill]);
    } else {
      showToast('Maksimal 8 skill', 'warning');
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      showToast('Nama tidak boleh kosong', 'error');
      return;
    }

    updateUser({
      name: name.trim(),
      bio: bio.trim(),
      skills: user?.role === 'worker' ? selectedSkills : [],
    });

    showToast('Profile berhasil diupdate', 'success');
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-8">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Edit Profile</h1>
      </div>

      <div className="px-6 pt-8 space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <img
              src={user?.avatar}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
            />
            <button className="absolute bottom-0 right-0 w-9 h-9 bg-[#6366F1] rounded-full flex items-center justify-center shadow-lg hover:bg-[#4F46E5] transition-colors">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">Tap to change photo</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[16px] p-5 shadow-sm space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Nama Lengkap *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Masukkan nama kamu"
              className="w-full bg-[#F8F9FB] border-0 rounded-[10px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6366F1] placeholder:text-gray-400"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Ceritain tentang kamu, pengalaman, dan keahlianmu..."
              maxLength={200}
              rows={4}
              className="w-full bg-[#F8F9FB] border-0 rounded-[10px] px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#6366F1] placeholder:text-gray-400"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">Maksimal 200 karakter</p>
              <p className={`text-xs font-medium ${bio.length > 180 ? 'text-orange-600' : 'text-gray-500'}`}>
                {bio.length}/200
              </p>
            </div>
          </div>
        </div>

        {/* Skills Section (Worker only) */}
        {user?.role === 'worker' && (
          <div className="bg-white rounded-[16px] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-gray-900">
                Skills & Expertise
              </label>
              <span className="text-xs text-gray-500">
                {selectedSkills.length}/8
              </span>
            </div>

            {/* Selected Skills */}
            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-100">
                {selectedSkills.map(skill => (
                  <div
                    key={skill}
                    className="bg-[#6366F1] text-white px-4 py-2 rounded-[10px] text-sm font-medium flex items-center gap-2 shadow-sm"
                  >
                    {skill}
                    <button
                      onClick={() => toggleSkill(skill)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Available Skills */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-3">Available Skills</p>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SKILLS.filter(s => !selectedSkills.includes(s)).map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    disabled={selectedSkills.length >= 8}
                    className="bg-[#F8F9FB] border border-gray-200 text-gray-700 px-3 py-2 rounded-[10px] text-sm font-medium hover:border-[#6366F1] hover:bg-blue-50 hover:text-[#6366F1] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="sticky bottom-6 pt-4">
          <button
            onClick={handleSave}
            className="w-full bg-[#6366F1] text-white rounded-[12px] px-6 py-4 font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
