import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Send, Plus, MoreVertical, ShieldCheck, Check } from 'lucide-react';

interface ChatDetailProps {
  chatId: string;
  onBack: () => void;
}

export default function ChatDetail({ chatId, onBack }: ChatDetailProps) {
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', text: 'Halo bro! Mau tanya soal tugas kalkulusnya', sender: 'other', time: '12:40' },
    { id: '2', text: 'Halo! Iya silakan, ada yang bingung di bagian mana?', sender: 'me', time: '12:42' },
    { id: '3', text: 'Itu yang bagian integral lipat dua, aku masih agak bingung nentuin batasnya.', sender: 'other', time: '12:45' },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      text: msg,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setMsg('');
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden">
      <header className="px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100 active:scale-90 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center font-black text-blue-600 text-sm">
              R
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-sm leading-tight">Muhammad Rafi</h3>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Online</span>
              </div>
            </div>
          </div>
        </div>
        <button className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-50">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
        {/* Safety Badge */}
        <div className="flex justify-center">
          <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-100 px-4 py-2 rounded-2xl flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-blue-500" />
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-wider">Transaksi Aman via UBeres Escrow</p>
          </div>
        </div>

        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-4 rounded-[24px] shadow-sm relative ${
              m.sender === 'me' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
            }`}>
              <p className="text-[11px] font-medium leading-relaxed">{m.text}</p>
              <div className={`flex items-center gap-1 mt-1 justify-end opacity-60`}>
                <span className="text-[8px] font-bold uppercase">{m.time}</span>
                {m.sender === 'me' && <Check className="w-2.5 h-2.5" />}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <footer className="p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 sticky bottom-0 z-50">
        <form onSubmit={handleSend} className="flex items-center gap-3 bg-gray-50 p-2 rounded-[28px] border border-gray-100 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
          <button type="button" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm">
            <Plus className="w-5 h-5" />
          </button>
          <input 
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 bg-transparent border-none outline-none text-xs font-medium px-2"
          />
          <button 
            type="submit"
            disabled={!msg.trim()}
            className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-100 active:scale-90 transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </footer>
    </div>
  );
}
