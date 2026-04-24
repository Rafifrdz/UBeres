import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { storage, Message, generateId, statusConfig } from '../utils-new/storage';
import { ArrowLeft, Send, Paperclip, Image as ImageIcon, FileText, Download, Check, CheckCheck, MoreVertical, Info } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useToast } from '../components/Toast';
import { BottomSheet } from '../components/BottomSheet';

export function ChatDetail() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useApp();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const job = jobId ? storage.getJobs().find(j => j.id === jobId) : null;
  const otherUserId = user?.role === 'client' ? job?.workerId : job?.clientId;

  // Initialize with mock messages if empty
  useEffect(() => {
    if (!jobId || !user) return;

    const currentJob = storage.getJobs().find(j => j.id === jobId);
    if (!currentJob) return;

    const currentOtherUserId = user.role === 'client' ? currentJob.workerId : currentJob.clientId;
    let jobMessages = storage.getMessages(jobId);

    // Add mock messages for demo if empty
    if (jobMessages.length === 0) {
      const mockMessages: Message[] = [
        {
          id: generateId(),
          jobId,
          senderId: currentOtherUserId || 'other',
          content: 'Halo! Terima kasih sudah memilih bid saya 🙏',
          type: 'text',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: generateId(),
          jobId,
          senderId: 'system',
          content: `Bid telah diterima. Status: ${statusConfig[currentJob.status]?.label}`,
          type: 'system',
          createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: generateId(),
          jobId,
          senderId: user.uid,
          content: 'Sama-sama! Kapan bisa mulai kerjakan?',
          type: 'text',
          createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: generateId(),
          jobId,
          senderId: currentOtherUserId || 'other',
          content: 'Bisa mulai hari ini kok. File requirement-nya bisa dikirim?',
          type: 'text',
          createdAt: new Date(Date.now() - 21 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: generateId(),
          jobId,
          senderId: user.uid,
          content: 'Oke siap, ini saya kirim file brief-nya ya',
          type: 'text',
          createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: generateId(),
          jobId,
          senderId: user.uid,
          content: 'Brief_Project.pdf',
          type: 'file',
          fileUrl: 'https://example.com/brief.pdf',
          createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: generateId(),
          jobId,
          senderId: currentOtherUserId || 'other',
          content: 'Oke noted, saya cek dulu ya. Estimasi selesai besok sore',
          type: 'text',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ];

      mockMessages.forEach(msg => storage.addMessage(msg));
      jobMessages = mockMessages;
    }

    setMessages(jobMessages);
  }, [jobId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);

  const handleSend = () => {
    if (!inputMessage.trim() || !user || !jobId) return;

    const newMessage: Message = {
      id: generateId(),
      jobId,
      senderId: user.uid,
      content: inputMessage.trim(),
      type: 'text',
      createdAt: new Date().toISOString(),
    };

    storage.addMessage(newMessage);
    setMessages([...messages, newMessage]);
    setInputMessage('');

    // Simulate typing response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply: Message = {
        id: generateId(),
        jobId,
        senderId: otherUserId || 'other',
        content: 'Oke siap! 👍',
        type: 'text',
        createdAt: new Date().toISOString(),
      };
      storage.addMessage(reply);
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachment = () => {
    showToast('Feature coming soon', 'info');
  };

  const formatDateDivider = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Hari Ini';
    if (isYesterday(date)) return 'Kemarin';
    return format(date, 'd MMMM yyyy', { locale: localeId });
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach(message => {
      const date = format(new Date(message.createdAt), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col max-w-[430px] mx-auto">
      {/* Header */}
      <div className="bg-white px-5 py-3.5 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors active:bg-gray-100">
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserId}`}
              alt="User"
              className="w-11 h-11 rounded-full ring-2 ring-gray-100"
            />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#6366F1] border-2 border-white rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#6366F1] text-[15px]">
              {user?.role === 'client' ? 'Worker' : 'Client'} UB
            </h3>
            <p className="text-xs text-gray-500 truncate font-medium">
              {isTyping ? 'sedang mengetik...' : job?.title}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowInfo(true)}
          className="p-2 hover:bg-gray-50 rounded-full transition-colors active:bg-gray-100"
        >
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Job Status Banner */}
      {job && (
        <div className="px-4 py-2.5 border-b bg-white border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[job.status]?.color}`}>
                {statusConfig[job.status]?.label}
              </span>
              <span className="text-xs text-gray-600">
                Budget: Rp {job.budget.toLocaleString('id-ID')}
              </span>
            </div>
            <button
              onClick={() => navigate(`/job/${jobId}`)}
              className="text-xs font-medium text-gray-900 hover:underline"
            >
              Lihat Detail
            </button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {Object.entries(messageGroups).map(([date, msgs]) => (
          <div key={date}>
            {/* Date Divider */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-white shadow-sm text-gray-600 text-xs px-4 py-1.5 rounded-full font-medium">
                {formatDateDivider(date)}
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-3">
              {msgs.map((message, index) => {
                const isOwn = message.senderId === user?.uid;
                const isSystem = message.type === 'system';
                const isFile = message.type === 'file';
                const prevMessage = index > 0 ? msgs[index - 1] : null;
                const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;

                if (isSystem) {
                  return (
                    <div key={message.id} className="flex justify-center my-3">
                      <div className="bg-[#EEF2FF] border border-[#C7D2FE] text-[#4F46E5] text-xs px-4 py-2 rounded-full max-w-xs text-center font-medium">
                        {message.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isOwn && (
                      <div className="w-8 h-8 flex-shrink-0">
                        {showAvatar && (
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.senderId}`}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                      </div>
                    )}

                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
                      {isFile ? (
                        <div
                          className={`rounded-[16px] p-3 ${
                            isOwn
                              ? 'bg-[#6366F1] text-white'
                              : 'bg-white text-gray-900 shadow-sm border border-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isOwn ? 'bg-white/20' : 'bg-gray-100'
                            }`}>
                              {message.content.endsWith('.pdf') ? (
                                <FileText className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-gray-700'}`} />
                              ) : (
                                <ImageIcon className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-gray-700'}`} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{message.content}</p>
                              <p className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                                {(Math.random() * 500 + 100).toFixed(0)} KB
                              </p>
                            </div>
                            <button className={`p-2 rounded-lg ${isOwn ? 'hover:bg-white/20' : 'hover:bg-gray-100'}`}>
                              <Download className={`w-4 h-4 ${isOwn ? 'text-white' : 'text-gray-600'}`} />
                            </button>
                          </div>
                          <div className={`flex items-center justify-between mt-2 pt-2 border-t ${
                            isOwn ? 'border-white/20' : 'border-gray-100'
                          }`}>
                            <p className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                              {format(new Date(message.createdAt), 'HH:mm')}
                            </p>
                            {isOwn && (
                              <CheckCheck className="w-4 h-4 text-white/70" />
                            )}
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`rounded-[16px] px-4 py-2.5 ${
                            isOwn
                              ? 'bg-[#6366F1] text-white rounded-br-sm'
                              : 'bg-white text-gray-900 shadow-sm border border-gray-100 rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                            {message.content}
                          </p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <p className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                              {format(new Date(message.createdAt), 'HH:mm')}
                            </p>
                            {isOwn && (
                              <CheckCheck className="w-3.5 h-3.5 text-white/70" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {isOwn && <div className="w-8" />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-2 items-end">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserId}`}
              alt="Avatar"
              className="w-8 h-8 rounded-full"
            />
            <div className="bg-white shadow-sm border border-gray-100 rounded-[16px] rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-3.5 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] safe-area-pb">
        <div className="flex items-end gap-2.5">
          <button
            onClick={handleAttachment}
            className="p-3 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 active:bg-gray-200"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ketik pesan..."
              rows={1}
              className="w-full bg-[#F8F9FB] border-0 rounded-[14px] px-4 py-3.5 text-[15px] resize-none focus:outline-none focus:ring-2 focus:ring-[#6366F1] max-h-32 placeholder:text-gray-400"
              style={{ minHeight: '48px' }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            className="p-3.5 bg-[#6366F1] text-white rounded-full hover:bg-[#4F46E5] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 transition-all active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Info Bottom Sheet */}
      <BottomSheet isOpen={showInfo} onClose={() => setShowInfo(false)}>
        <div className="px-6 pb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Info Chat</h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserId}`}
                alt="User"
                className="w-14 h-14 rounded-full"
              />
              <div>
                <h4 className="font-semibold text-[#6366F1]">
                  {user?.role === 'client' ? 'Worker' : 'Client'} UB
                </h4>
                <p className="text-sm text-gray-600">Online</p>
              </div>
            </div>

            {job && (
              <div className="bg-[#F8F9FB] rounded-[12px] p-4">
                <h5 className="text-xs font-medium text-gray-500 mb-2">Tugas</h5>
                <p className="font-medium text-[#6366F1] mb-1">{job.title}</p>
                <p className="text-sm text-gray-600 mb-2">{job.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>Budget: Rp {job.budget.toLocaleString('id-ID')}</span>
                  <span>•</span>
                  <span>Deadline: {format(new Date(job.deadline), 'd MMM', { locale: localeId })}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => navigate(`/job/${jobId}`)}
              className="w-full bg-[#6366F1] text-white rounded-[12px] py-3 font-medium hover:bg-[#4F46E5] transition-colors"
            >
              Lihat Detail Tugas
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
