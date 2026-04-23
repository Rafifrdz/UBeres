import React from 'react';
import { motion } from 'motion/react';
import { Search, MessageSquare, CheckCircle2, Clock } from 'lucide-react';

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
}

export default function ChatList({ onSelectChat }: ChatListProps) {
  const chats = [
    {
      id: '1',
      name: 'Muhammad Rafi',
      lastMessage: 'Oke bro, nanti aku kirim updatenya jam 5 ya!',
      time: '12:45',
      unread: 2,
      avatar: 'R',
      status: 'online'
    },
    {
      id: '2',
      name: 'BEM FILKOM',
      lastMessage: 'Pembayaran sudah dikonfirmasi ya, silakan diproses.',
      time: 'Kemarin',
      unread: 0,
      avatar: 'B',
      status: 'offline'
    },
    {
      id: '3',
      name: 'Sarah UB',
      lastMessage: 'Bisa bantu translate jurnal ini nggak?',
      time: 'Senin',
      unread: 0,
      avatar: 'S',
      status: 'online'
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden h-full">
      <header className="px-8 pt-10 pb-4">
        <h1 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">Pesan</h1>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Cari percakapan..." 
            className="w-full h-12 bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl pl-11 pr-4 text-xs font-medium outline-none transition-all shadow-sm focus:ring-4 focus:ring-blue-500/5"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="space-y-1">
          {chats.map((chat) => (
            <motion.button
              key={chat.id}
              whileHover={{ x: 4 }}
              onClick={() => onSelectChat(chat.id)}
              className="w-full p-4 rounded-[28px] flex items-center gap-4 hover:bg-blue-50/50 transition-all group border-2 border-transparent hover:border-blue-50"
            >
              <div className="relative">
                <div className="w-14 h-14 bg-blue-100 rounded-[22px] flex items-center justify-center font-black text-blue-600 text-xl shadow-sm">
                  {chat.avatar}
                </div>
                {chat.status === 'online' && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-4 border-white rounded-full" />
                )}
              </div>

              <div className="flex-1 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-black text-gray-900 text-sm leading-none">{chat.name}</h3>
                  <span className={`text-[9px] font-bold ${chat.unread > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                    {chat.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-[11px] line-clamp-1 flex-1 pr-4 ${chat.unread > 0 ? 'text-gray-900 font-bold' : 'text-gray-400 font-medium'}`}>
                    {chat.lastMessage}
                  </p>
                  {chat.unread > 0 ? (
                    <div className="bg-blue-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
                      {chat.unread}
                    </div>
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {chats.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <MessageSquare className="w-12 h-12 mb-4" />
            <p className="text-sm font-bold">Belum ada pesan masuk</p>
          </div>
        )}
      </div>
    </div>
  );
}
