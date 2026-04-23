import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { ChatMessage, UserProfile, Job } from '../types';
import { motion } from 'motion/react';
import { ChevronLeft, Send, Paperclip, Loader2 } from 'lucide-react';
import { handleFirestoreError } from '../lib/utils';

interface ChatProps {
  jobId: string;
  user: UserProfile;
  onBack: () => void;
}

export default function Chat({ jobId, user, onBack }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const jobRef = doc(db, 'jobs', jobId);
    getDoc(jobRef).then(d => {
      if (d.exists()) setJob({ id: d.id, ...d.data() } as Job);
    });

    const messagesRef = collection(db, 'jobs', jobId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [jobId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText('');
    
    try {
      await addDoc(collection(db, 'jobs', jobId, 'messages'), {
        jobId,
        senderId: user.uid,
        text,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, 'create', `jobs/${jobId}/messages`);
    }
  };

  if (loading || !job) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const otherPersonName = user.uid === job.clientId ? 'Worker' : 'Client';

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="flex-1 flex flex-col bg-white"
    >
      <header className="px-6 py-5 flex items-center gap-4 bg-white border-b border-gray-100 shadow-sm z-10">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-blue-500 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center font-bold text-blue-600">
            {otherPersonName[0]}
          </div>
          <div>
            <h1 className="text-base font-black text-gray-900 leading-tight">{otherPersonName}</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{job.title}</p>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === user.uid;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-3xl ${
                isMe 
                  ? 'bg-blue-500 text-white rounded-tr-none shadow-lg shadow-blue-100' 
                  : 'bg-gray-100 text-gray-800 rounded-tl-none shadow-sm'
              }`}>
                <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                <p className={`text-[10px] mt-1 font-bold ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                  {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-gray-100 flex items-center gap-3 pb-8">
        <button type="button" className="p-3 text-gray-400 hover:text-blue-500 bg-gray-50 rounded-2xl transition-all">
          <Paperclip className="w-5 h-5" />
        </button>
        <input 
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Tulis pesan..."
          className="flex-1 h-12 bg-gray-50 rounded-2xl px-5 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <button 
          type="submit"
          className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-600 active:scale-95 transition-all"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </motion.div>
  );
}
