import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { storage, Notification } from '../utils-new/storage';
import { EmptyState } from '../components/EmptyState';
import { Bell, DollarSign, MessageCircle, Star, FileCheck, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NOTIFICATION_ICONS = {
  bid_received: UserCheck,
  bid_accepted: FileCheck,
  payment: DollarSign,
  message: MessageCircle,
  rating: Star,
  result_submitted: FileCheck,
};

const NOTIFICATION_COLORS = {
  bid_received: 'bg-gray-100 text-gray-700',
  bid_accepted: 'bg-green-100 text-gray-600',
  payment: 'bg-purple-100 text-gray-600',
  message: 'bg-orange-100 text-orange-600',
  rating: 'bg-yellow-100 text-yellow-600',
  result_submitted: 'bg-pink-100 text-pink-600',
};

export function Notifications() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      const userNotifications = storage.getNotifications(user.uid);
      setNotifications(userNotifications.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    }
  }, [user]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      storage.markNotificationRead(notification.id);
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    }

    if (notification.jobId) {
      navigate(`/job/${notification.jobId}`);
    }
  };

  const handleDismiss = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-8">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4 sticky top-0 z-10 border-b border-gray-100 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-semibold text-gray-900">Notifikasi</h1>
      </div>

      {/* Notifications List */}
      <div className="px-6">
        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-16 h-16" />}
            title="Belum ada notifikasi"
            description="Notifikasi akan muncul di sini"
          />
        ) : (
          <div className="space-y-2">
            {notifications.map(notification => {
              const Icon = NOTIFICATION_ICONS[notification.type];
              const colorClass = NOTIFICATION_COLORS[notification.type];

              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-white rounded-[16px] p-4 cursor-pointer hover:shadow-md transition-shadow ${
                    !notification.read ? 'border-l-4 border-[#6366F1]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm mb-1 ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: localeId,
                        })}
                      </span>
                    </div>

                    {!notification.read && (
                      <div className="w-2 h-2 bg-[#6366F1] rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
