import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Bell, MessageSquare, Briefcase, Star, Info, CheckCircle2, Clock } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface NotificationsProps {
  onBack: () => void;
  onAction: (jobId: string) => void;
}

const notifications = [
  {
    id: '1',
    type: 'bid',
    title: 'Ada Tawaran Baru!',
    message: 'Worker **Budi** baru saja memberikan penawaran Rp 50.000 di kerjaan **Bantu Tugas Kalkulus**.',
    time: '2 menit yang lalu',
    unread: true,
    jobId: 'job-123'
  },
  {
    id: '2',
    type: 'chat',
    title: 'Pesan Baru',
    message: 'Client **Siti** mengirimkan pesan di chat kerjaan **Desain Logo UKM**.',
    time: '15 menit yang lalu',
    unread: true,
    jobId: 'job-456'
  },
  {
    id: '3',
    type: 'status',
    title: 'Kerjaan Selesai',
    message: 'Hore! Client sudah mengkonfirmasi bahwa kerjaan **Input Data** sudah selesai. Saldo Rp 30.000 masuk ke dompetmu.',
    time: '1 jam yang lalu',
    unread: false,
    jobId: 'job-789'
  },
  {
    id: '4',
    type: 'info',
    title: 'Tips UBeres',
    message: 'Lengkapi profilmu biar makin dipercaya sama client dan dapet banyak kerjaan!',
    time: '3 jam yang lalu',
    unread: false
  }
];

export default function Notifications({ onBack, onAction }: NotificationsProps) {
  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden h-full">
      <header className="px-6 pt-10 pb-6 flex items-center gap-4 bg-white border-b border-gray-50">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100 active:scale-90 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black text-gray-900">Notifikasi</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-10 space-y-3">
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => n.jobId && onAction(n.jobId)}
            className={`p-4 rounded-3xl border-2 transition-all cursor-pointer ${
              n.unread ? 'bg-blue-50/50 border-blue-100 shadow-sm' : 'bg-white border-gray-50'
            }`}
          >
            <div className="flex gap-4">
              <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center ${
                n.type === 'bid' ? 'bg-purple-100 text-purple-600' :
                n.type === 'chat' ? 'bg-blue-100 text-blue-600' :
                n.type === 'status' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
              }`}>
                {n.type === 'bid' ? <Briefcase className="w-5 h-5" /> :
                 n.type === 'chat' ? <MessageSquare className="w-5 h-5" /> :
                 n.type === 'status' ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-black text-gray-900 text-sm leading-tight">{n.title}</h4>
                  {n.unread && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />}
                </div>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-2">
                  {n.message.split('**').map((text, i) => (
                    i % 2 === 1 ? <span key={i} className="font-black text-gray-900">{text}</span> : text
                  ))}
                </p>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-gray-300" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase">{n.time}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {notifications.length === 0 && (
          <div className="py-10 text-center">
            <div className="w-64 h-64 mx-auto -mb-10">
              <DotLottieReact
                src="https://lottie.host/e2b69438-e670-4c07-889a-05186b515904/P8HqXoZlXm.lottie"
                loop
                autoplay
              />
            </div>
            <h3 className="font-black text-gray-900 text-lg">Semua sudah beres!</h3>
            <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mt-2">Nanti kalau ada info baru bakal muncul di sini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
