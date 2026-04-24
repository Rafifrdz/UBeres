import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { Target, Briefcase } from 'lucide-react';

export function RoleSelection() {
  const navigate = useNavigate();
  const { updateUser } = useApp();
  const [selectedRole, setSelectedRole] = useState<'client' | 'worker' | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      updateUser({ role: selectedRole });
      navigate('/profile-setup');
    }
  };

  const roles = [
    {
      value: 'client' as const,
      Icon: Target,
      title: 'CLIENT',
      description: 'Saya ingin mencari worker untuk menyelesaikan tugas',
      benefits: ['Post unlimited jobs', 'Choose the best worker', 'Secure payment'],
    },
    {
      value: 'worker' as const,
      Icon: Briefcase,
      title: 'WORKER',
      description: 'Saya ingin mengerjakan tugas dan mendapatkan bayaran',
      benefits: ['Browse available jobs', 'Bid on projects', 'Earn money'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] px-6 py-12">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold mb-2">
            Pilih Role Kamu
          </h1>
          <p className="text-[15px] text-gray-500">
            Kamu bisa switch role kapan saja di profile
          </p>
        </motion.div>

        <div className="space-y-4 mb-8">
          {roles.map((role, index) => {
            const IconComponent = role.Icon;
            return (
              <motion.button
                key={role.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedRole(role.value)}
                className={`w-full bg-white rounded-[20px] p-6 text-left transition-all active:scale-98 ${
                  selectedRole === role.value
                    ? 'border-2 border-[#6366F1] shadow-lg shadow-blue-50'
                    : 'border-2 border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-7 h-7 text-gray-700" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">
                      {role.title}
                    </h3>
                    <p className="text-[15px] text-gray-600 mb-3 leading-relaxed">
                      {role.description}
                    </p>
                    <ul className="space-y-1.5">
                      {role.benefits.map(benefit => (
                        <li key={benefit} className="text-sm text-gray-500 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className="w-full bg-[#6366F1] text-white rounded-[14px] px-6 py-4 text-base font-semibold hover:bg-[#4F46E5] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
        >
          Lanjutkan
        </button>
      </div>
    </div>
  );
}
