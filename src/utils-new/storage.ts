// Mock data storage utilities
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: 'client' | 'worker';
  bio: string;
  skills: string[];
  rating: number;
  completedTasks: number;
  earnings: number;
  balance: number;
  isVerified: boolean;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: string;
  status: 'open' | 'assigned' | 'paid' | 'working' | 'submitting' | 'completed';
  clientId: string;
  workerId?: string;
  createdAt: string;
  bidCount: number;
}

export interface Bid {
  id: string;
  jobId: string;
  workerId: string;
  amount: number;
  pitch: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Message {
  id: string;
  jobId: string;
  senderId: string;
  content: string;
  type: 'text' | 'system' | 'file';
  fileUrl?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'bid_received' | 'bid_accepted' | 'payment' | 'message' | 'rating' | 'result_submitted';
  title: string;
  message: string;
  jobId?: string;
  read: boolean;
  createdAt: string;
}

export interface Rating {
  id: string;
  jobId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  review: string;
  tags: string[];
  createdAt: string;
}

const STORAGE_KEYS = {
  USER: 'uberes_user',
  JOBS: 'uberes_jobs',
  BIDS: 'uberes_bids',
  MESSAGES: 'uberes_messages',
  NOTIFICATIONS: 'uberes_notifications',
  RATINGS: 'uberes_ratings',
};

export const storage = {
  getUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  setUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  getJobs: (): Job[] => {
    const data = localStorage.getItem(STORAGE_KEYS.JOBS);
    return data ? JSON.parse(data) : [];
  },

  setJobs: (jobs: Job[]) => {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  },

  addJob: (job: Job) => {
    const jobs = storage.getJobs();
    jobs.push(job);
    storage.setJobs(jobs);
  },

  updateJob: (jobId: string, updates: Partial<Job>) => {
    const jobs = storage.getJobs();
    const index = jobs.findIndex(j => j.id === jobId);
    if (index !== -1) {
      jobs[index] = { ...jobs[index], ...updates };
      storage.setJobs(jobs);
    }
  },

  getBids: (): Bid[] => {
    const data = localStorage.getItem(STORAGE_KEYS.BIDS);
    return data ? JSON.parse(data) : [];
  },

  setBids: (bids: Bid[]) => {
    localStorage.setItem(STORAGE_KEYS.BIDS, JSON.stringify(bids));
  },

  addBid: (bid: Bid) => {
    const bids = storage.getBids();
    bids.push(bid);
    storage.setBids(bids);

    // Update job bid count
    const jobs = storage.getJobs();
    const job = jobs.find(j => j.id === bid.jobId);
    if (job) {
      job.bidCount = (job.bidCount || 0) + 1;
      storage.setJobs(jobs);
    }
  },

  getMessages: (jobId?: string): Message[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const messages = data ? JSON.parse(data) : [];
    return jobId ? messages.filter((m: Message) => m.jobId === jobId) : messages;
  },

  setMessages: (messages: Message[]) => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  },

  addMessage: (message: Message) => {
    const messages = storage.getMessages();
    messages.push(message);
    storage.setMessages(messages);
  },

  getNotifications: (userId?: string): Notification[] => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifications = data ? JSON.parse(data) : [];
    return userId ? notifications.filter((n: Notification) => n.userId === userId) : notifications;
  },

  setNotifications: (notifications: Notification[]) => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },

  addNotification: (notification: Notification) => {
    const notifications = storage.getNotifications();
    notifications.push(notification);
    storage.setNotifications(notifications);
  },

  markNotificationRead: (notificationId: string) => {
    const notifications = storage.getNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      storage.setNotifications(notifications);
    }
  },

  getRatings: (): Rating[] => {
    const data = localStorage.getItem(STORAGE_KEYS.RATINGS);
    return data ? JSON.parse(data) : [];
  },

  setRatings: (ratings: Rating[]) => {
    localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(ratings));
  },

  addRating: (rating: Rating) => {
    const ratings = storage.getRatings();
    ratings.push(rating);
    storage.setRatings(ratings);
  },

  initializeMockData: () => {
    // Only initialize if no data exists
    if (!storage.getUser() && storage.getJobs().length === 0) {
      // Add mock jobs
      const mockJobs: Job[] = [
        {
          id: '1',
          title: 'Desain Logo untuk Startup Edutech',
          description: 'Butuh desain logo modern untuk aplikasi edukasi. Prefer warna biru/hijau. File final: AI, PNG, SVG.',
          category: 'Desain',
          budget: 150000,
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'working',
          clientId: 'client1',
          workerId: 'worker1',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          bidCount: 5,
        },
        {
          id: '2',
          title: 'Translate Paper Bahasa Inggris ke Indonesia',
          description: 'Paper tentang machine learning, 15 halaman. Butuh yang paham istilah teknis.',
          category: 'Bahasa',
          budget: 200000,
          deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'working',
          clientId: 'client2',
          workerId: 'worker2',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          bidCount: 3,
        },
        {
          id: '3',
          title: 'Fix Bug di Website React',
          description: 'Ada bug di form validation. Stack: React, TypeScript, Tailwind. Link repo akan dikasih kalau diterima.',
          category: 'Coding',
          budget: 100000,
          deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'open',
          clientId: 'client1',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          bidCount: 8,
        },
        {
          id: '4',
          title: 'Solve Soal Kalkulus Integral',
          description: '10 soal integral trigonometri. Butuh step-by-step solution.',
          category: 'Matematika',
          budget: 75000,
          deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          status: 'open',
          clientId: 'client3',
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          bidCount: 12,
        },
        {
          id: '5',
          title: 'Bikin Landing Page Sederhana',
          description: 'Landing page untuk jualan produk. Responsive, 1 halaman aja. Kirim Figma design dulu.',
          category: 'Desain',
          budget: 300000,
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'open',
          clientId: 'client2',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          bidCount: 6,
        },
      ];
      storage.setJobs(mockJobs);

      // Add mock messages for jobs with assigned workers
      const mockMessages: Message[] = [
        // Messages for Job 1 (Desain Logo)
        {
          id: generateId(),
          jobId: '1',
          senderId: 'worker1',
          content: 'Halo! Terima kasih sudah pilih bid saya. Saya sudah mulai riset untuk logo-nya',
          type: 'text',
          createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: generateId(),
          jobId: '1',
          senderId: 'system',
          content: 'Bid telah diterima. Status: Dikerjakan',
          type: 'system',
          createdAt: new Date(Date.now() - 35 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: generateId(),
          jobId: '1',
          senderId: 'client1',
          content: 'Oke siap! Kalau butuh info tambahan bisa tanya ya',
          type: 'text',
          createdAt: new Date(Date.now() - 34 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: generateId(),
          jobId: '1',
          senderId: 'worker1',
          content: 'Draft_Logo_v1.pdf',
          type: 'file',
          fileUrl: 'https://example.com/draft1.pdf',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: generateId(),
          jobId: '1',
          senderId: 'worker1',
          content: 'Ini draft pertama kak, ada 3 konsep. Mana yang paling cocok?',
          type: 'text',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: generateId(),
          jobId: '1',
          senderId: 'client1',
          content: 'Wah bagus! Aku suka yang konsep kedua. Bisa dikembangin lagi ga?',
          type: 'text',
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: generateId(),
          jobId: '1',
          senderId: 'worker1',
          content: 'Siap! Aku revisi dulu ya, nanti sore aku kirim lagi',
          type: 'text',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },

        // Messages for Job 2 (Translate Paper)
        {
          id: generateId(),
          jobId: '2',
          senderId: 'worker2',
          content: 'Hai kak! Saya sudah download paper-nya. Kira-kira ada istilah khusus yang perlu saya perhatikan?',
          type: 'text',
          createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: generateId(),
          jobId: '2',
          senderId: 'system',
          content: 'Bid telah diterima. Status: Dikerjakan',
          type: 'system',
          createdAt: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: generateId(),
          jobId: '2',
          senderId: 'client2',
          content: 'Iya, untuk istilah ML kayak "neural network", "gradient descent" dll, pakai istilah baku aja ya. Jangan diterjemahkan',
          type: 'text',
          createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: generateId(),
          jobId: '2',
          senderId: 'worker2',
          content: 'Oke noted kak! Saya maintain istilah teknis dalam bahasa Inggris. Progress saat ini udah 60% nih',
          type: 'text',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: generateId(),
          jobId: '2',
          senderId: 'client2',
          content: 'Wah cepat banget! Thanks ya 🙏',
          type: 'text',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: generateId(),
          jobId: '2',
          senderId: 'worker2',
          content: 'Sama-sama kak! Target besok pagi bisa selesai',
          type: 'text',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
      ];
      storage.setMessages(mockMessages);
    }
  },

  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Category colors - Minimal elegant palette
export const categoryColors: Record<string, string> = {
  'Semua': 'bg-gray-100 text-gray-700',
  'Desain': 'bg-gray-100 text-gray-700',
  'Coding': 'bg-gray-100 text-gray-700',
  'Penulisan': 'bg-gray-100 text-gray-700',
  'Matematika': 'bg-gray-100 text-gray-700',
  'Bahasa': 'bg-gray-100 text-gray-700',
};

// Status colors and labels - Minimal elegant palette
export const statusConfig: Record<string, { color: string; label: string }> = {
  open: { color: 'bg-gray-100 text-gray-700', label: 'Terbuka' },
  assigned: { color: 'bg-gray-100 text-gray-700', label: 'Ditugaskan' },
  paid: { color: 'bg-gray-100 text-gray-700', label: 'Dibayar' },
  working: { color: 'bg-gray-100 text-gray-700', label: 'Dikerjakan' },
  submitting: { color: 'bg-gray-100 text-gray-700', label: 'Menunggu Review' },
  completed: { color: 'bg-gray-100 text-gray-700', label: 'Selesai' },
};
