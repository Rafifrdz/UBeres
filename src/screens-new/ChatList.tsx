import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../lib/api';
import { MessageCircle, Search, ChevronRight, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { BottomNav } from '../components/BottomNav';
import { Loading } from '../components/Loading';

export function ChatList() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [chats, setChats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      // Ambil daftar job di mana user terlibat (client atau worker)
      // Kita bisa menggunakan API /jobs dengan filter clientId atau workerId
      const fetchChats = async () => {
        try {
          setIsLoading(true);
          const [clientJobs, workerJobs] = await Promise.all([
            apiFetch<any>(`/jobs?clientId=${user.uid}`),
            apiFetch<any>(`/jobs?workerId=${user.uid}`)
          ]);

          const allJobs = [...(clientJobs.data || []), ...(workerJobs.data || [])];
          
          // Filter hanya job yang sudah ada worker terpilih (assigned)
          const activeChats = allJobs.filter(job => job.workerId);
          
          // Urutkan berdasarkan yang terbaru
          activeChats.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          
          setChats(activeChats);
        } catch (error) {
          console.error('Failed to fetch chats:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchChats();
    }
  }, [user]);

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user?.role === 'client' ? chat.workerName : chat.clientName)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-8 pb-4 shadow-sm sticky top-0 z-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Pesan</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari percakapan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#6366F1] transition-all"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="px-4 mt-4">
        {isLoading ? (
          <div className="py-20">
            <Loading label="Memuat pesan..." />
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Belum ada pesan</h3>
            <p className="text-sm text-gray-500 max-w-[200px] mt-1">
              Mulai chat dengan worker atau client setelah tawaran diterima.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChats.map((chat) => {
              const otherName = user?.role === 'client' ? chat.workerName || 'Worker' : chat.clientName || 'Client';
              return (
                <motion.div
                  key={chat.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/chat/${chat.id}`)}
                  className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-50 cursor-pointer hover:border-blue-100 transition-all"
                >
                  <div className="relative">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${otherName}`}
                      alt="Avatar"
                      className="w-14 h-14 rounded-full bg-gray-50"
                    />
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className="font-bold text-gray-900 truncate">{otherName}</h3>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        Baru saja
                      </span>
                    </div>
                    <p className="text-[13px] text-[#6366F1] font-medium truncate mb-1">
                      {chat.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate italic">
                      Klik untuk mulai mengobrol...
                    </p>
                  </div>
                  
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
