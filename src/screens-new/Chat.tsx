import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../lib/api';
import { io, Socket } from 'socket.io-client';
import { ArrowLeft, Send, Image as ImageIcon, MoreVertical, ShieldCheck, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Message {
  id?: string;
  jobId: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export function Chat() {
  const { jobId } = useParams();
  const { user } = useApp();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [jobInfo, setJobInfo] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Socket
  useEffect(() => {
    const newSocket = io('http://localhost:8080'); // Sesuaikan dengan URL server
    setSocket(newSocket);

    if (jobId) {
      newSocket.emit('join_room', jobId);
    }

    newSocket.on('receive_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      newSocket.close();
    };
  }, [jobId]);

  // Load History & Job Info
  useEffect(() => {
    if (jobId && user) {
      // Get Job Info
      apiFetch<any>(`/jobs/${jobId}`)
        .then(res => setJobInfo(res.data))
        .catch(err => console.error('Failed to load job:', err));

      // Get History
      apiFetch<{ data: Message[] }>(`/jobs/${jobId}/messages?actorId=${user.uid}`)
        .then(res => setMessages(res.data || []))
        .catch(err => console.error('Failed to load messages:', err));
    }
  }, [jobId, user]);

  // Scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !socket || !user || !jobId) return;

    const messageData = {
      jobId,
      senderId: user.uid,
      text: newMessage,
    };

    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  const otherPartyName = user?.role === 'client' ? jobInfo?.workerName || 'Worker' : jobInfo?.clientName || 'Client';

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FB] overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 z-20 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        
        <div className="flex-1 flex items-center gap-3">
          <div className="relative">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${otherPartyName}`}
              className="w-10 h-10 rounded-full border-2 border-gray-50"
              alt="Avatar"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h2 className="font-bold text-sm text-gray-900 leading-tight">{otherPartyName}</h2>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-500 font-medium truncate max-w-[150px]">
                {jobInfo?.title || 'Memuat tugas...'}
              </span>
            </div>
          </div>
        </div>

        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreVertical className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Escrow Banner */}
      <div className="bg-blue-50/50 px-4 py-2 flex items-center justify-center gap-2 border-b border-blue-100/30">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
        <span className="text-[10px] text-blue-600 font-medium">Pembayaran aman melalui sistem Escrow UBeres</span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === user?.uid;
          const showTime = index === 0 || 
            new Date(msg.createdAt).getTime() - new Date(messages[index-1].createdAt).getTime() > 300000;

          return (
            <div key={index} className="space-y-2">
              {showTime && (
                <div className="flex justify-center my-4">
                  <span className="bg-gray-200/50 text-gray-500 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {format(new Date(msg.createdAt), 'HH:mm', { locale: id })}
                  </span>
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm relative ${
                  isMe 
                    ? 'bg-[#6366F1] text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-50'
                }`}>
                  <p className="text-[13px] leading-relaxed">{msg.text}</p>
                </div>
              </motion.div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-100 p-4 pb-8 md:pb-4">
        <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-100 focus-within:border-blue-300 focus-within:bg-white transition-all">
          <button className="text-gray-400 hover:text-blue-500 transition-colors">
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ketik pesan..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm py-2"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className={`p-2 rounded-xl transition-all ${
              newMessage.trim() 
                ? 'bg-[#6366F1] text-white shadow-lg shadow-blue-200' 
                : 'text-gray-300'
            }`}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
          <Clock className="w-3 h-3" /> Aktif hari ini • Enkripsi ujung ke ujung
        </p>
      </div>
    </div>
  );
}
