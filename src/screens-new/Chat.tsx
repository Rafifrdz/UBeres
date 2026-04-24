import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { storage, generateId } from '../utils-new/storage';
import { BottomNav } from '../components/BottomNav';
import { EmptyState } from '../components/EmptyState';
import { MessageCircle, Search, Pin, MoreVertical } from 'lucide-react';
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export function Chat() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Create mock chat jobs for testing if user has no chats
  useEffect(() => {
    if (!user) return;

    const allJobs = storage.getJobs();
    const userJobs = user.role === 'client'
      ? allJobs.filter(j => j.clientId === user.uid && j.workerId)
      : allJobs.filter(j => j.workerId === user.uid);

    // If no chats exist, create mock ones
    if (userJobs.length === 0) {
      const mockWorkerId = 'mock_worker_' + Date.now();
      const mockClientId = 'mock_client_' + Date.now();

      const mockJob1 = {
        id: 'chat_job_1_' + generateId(),
        title: 'Desain Logo untuk Startup Edutech',
        description: 'Butuh desain logo modern untuk aplikasi edukasi. Prefer warna biru/hijau.',
        category: 'Desain',
        budget: 150000,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'working' as const,
        clientId: user.role === 'client' ? user.uid : mockClientId,
        workerId: user.role === 'worker' ? user.uid : mockWorkerId,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        bidCount: 5,
      };

      const mockJob2 = {
        id: 'chat_job_2_' + generateId(),
        title: 'Translate Paper Bahasa Inggris ke Indonesia',
        description: 'Paper tentang machine learning, 15 halaman.',
        category: 'Bahasa',
        budget: 200000,
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'working' as const,
        clientId: user.role === 'client' ? user.uid : mockClientId,
        workerId: user.role === 'worker' ? user.uid : mockWorkerId,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        bidCount: 3,
      };

      storage.addJob(mockJob1);
      storage.addJob(mockJob2);

      // Add mock messages
      const otherUserId1 = user.role === 'client' ? mockJob1.workerId : mockJob1.clientId;
      const otherUserId2 = user.role === 'client' ? mockJob2.workerId : mockJob2.clientId;

      const mockMessages1 = [
        {
          id: generateId(),
          jobId: mockJob1.id,
          senderId: otherUserId1!,
          content: 'Halo! Terima kasih sudah pilih bid saya. Saya sudah mulai riset untuk logo-nya',
          type: 'text' as const,
          createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: generateId(),
          jobId: mockJob1.id,
          senderId: 'system',
          content: 'Bid telah diterima. Status: Dikerjakan',
          type: 'system' as const,
          createdAt: new Date(Date.now() - 35 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: generateId(),
          jobId: mockJob1.id,
          senderId: user.uid,
          content: 'Oke siap! Kalau butuh info tambahan bisa tanya ya',
          type: 'text' as const,
          createdAt: new Date(Date.now() - 34 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: generateId(),
          jobId: mockJob1.id,
          senderId: otherUserId1!,
          content: 'Draft_Logo_v1.pdf',
          type: 'file' as const,
          fileUrl: 'https://example.com/draft1.pdf',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ];

      const mockMessages2 = [
        {
          id: generateId(),
          jobId: mockJob2.id,
          senderId: otherUserId2!,
          content: 'Hai! Saya sudah download paper-nya. Kira-kira ada istilah khusus yang perlu saya perhatikan?',
          type: 'text' as const,
          createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: generateId(),
          jobId: mockJob2.id,
          senderId: 'system',
          content: 'Bid telah diterima. Status: Dikerjakan',
          type: 'system' as const,
          createdAt: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: generateId(),
          jobId: mockJob2.id,
          senderId: user.uid,
          content: 'Untuk istilah ML kayak "neural network" pakai istilah baku aja ya',
          type: 'text' as const,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
      ];

      mockMessages1.forEach(msg => storage.addMessage(msg));
      mockMessages2.forEach(msg => storage.addMessage(msg));
    }
  }, [user]);

  // Get user's jobs and create chat items
  const allJobs = storage.getJobs();
  const userJobs = user?.role === 'client'
    ? allJobs.filter(j => j.clientId === user.uid && j.workerId)
    : allJobs.filter(j => j.workerId === user?.uid);

  const chats = userJobs.map(job => {
    const messages = storage.getMessages(job.id);
    const lastMessage = messages[messages.length - 1];
    const unreadCount = messages.filter(m =>
      m.senderId !== user?.uid &&
      new Date(m.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
    ).length;

    return {
      id: job.id,
      jobTitle: job.title,
      otherUserId: user?.role === 'client' ? job.workerId : job.clientId,
      lastMessage: lastMessage?.content || 'Belum ada pesan',
      lastMessageTime: lastMessage?.createdAt || job.createdAt,
      lastMessageType: lastMessage?.type || 'text',
      unread: unreadCount,
      isPinned: false,
      isOnline: Math.random() > 0.5, // Mock online status
    };
  });

  const filteredChats = chats.filter(chat =>
    searchQuery
      ? chat.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Kemarin';
    } else {
      return format(date, 'd MMM');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20">
      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold mb-4">Chat</h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari chat..."
            className="w-full bg-[#F8F9FB] rounded-[12px] pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6366F1] placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="px-4 pt-2">
        {filteredChats.length === 0 ? (
          <EmptyState
            icon={<MessageCircle className="w-16 h-16" />}
            title={searchQuery ? 'Chat tidak ditemukan' : 'Belum ada chat'}
            description={
              searchQuery
                ? 'Coba kata kunci lain'
                : 'Chat akan muncul setelah kamu terima bid atau bid kamu diterima'
            }
          />
        ) : (
          <div className="space-y-1">
            {filteredChats.map(chat => (
              <div
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`)}
                className="bg-white rounded-[16px] p-4 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all active:scale-[0.99]"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar with online indicator */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.otherUserId}`}
                      alt="User"
                      className="w-14 h-14 rounded-full"
                    />
                    {chat.isOnline && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#6366F1] border-2 border-white rounded-full" />
                    )}
                    {chat.unread > 0 && (
                      <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-[#6366F1] text-white text-xs rounded-full flex items-center justify-center px-1.5 font-medium">
                        {chat.unread > 9 ? '9+' : chat.unread}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <h3 className={`font-semibold truncate ${
                          chat.unread > 0 ? 'text-[#6366F1]' : 'text-[#818CF8]'
                        }`}>
                          {user?.role === 'client' ? 'Worker' : 'Client'} UB
                        </h3>
                        {chat.isPinned && (
                          <Pin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mb-1.5 truncate">{chat.jobTitle}</p>

                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate flex-1 ${
                        chat.unread > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'
                      }`}>
                        {chat.lastMessageType === 'file' && '📎 '}
                        {chat.lastMessageType === 'system' && '🔔 '}
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>

                  {/* Options */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
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
