import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

import { GoogleLogin } from '@react-oauth/google';
import { apiFetch } from '../lib/api';

export function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);
      const response = await apiFetch<{ user: any, isNewUser: boolean }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ 
          credential: credentialResponse.credential,
          role: 'client' // Default role, will be selectable in next screen
        }),
      });

      login(response.user);
      
      if (response.isNewUser) {
        navigate('/role-selection');
      } else {
        navigate('/feed');
      }
    } catch (error: any) {
      console.error('Google Auth Failed', error);
      alert(`Login Google Gagal: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col">
      {/* Hero Illustration - 40% */}
      <div className="h-[40vh] bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white px-6">
          <div className="w-28 h-28 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-5 mx-auto">
            <Sparkles className="w-16 h-16 text-white" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome to UBeres</h2>
          <p className="text-white/80 text-base">Marketplace Tugas UB</p>
        </div>
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex-1 -mt-8 px-6"
      >
        <div className="bg-white rounded-[20px] shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
            Masuk ke Akun
          </h3>
          <p className="text-[15px] text-gray-500 mb-8 text-center">
            Gunakan email UB untuk login
          </p>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert('Login Google Gagal')}
              useOneTap
              theme="outline"
              size="large"
              width="100%"
            />
          </div>

          <p className="text-xs text-gray-500 text-center mt-6 leading-relaxed">
            Dengan masuk, kamu setuju dengan Ketentuan Layanan dan Kebijakan Privasi UBeres
          </p>
        </div>
      </motion.div>
    </div>
  );
}
