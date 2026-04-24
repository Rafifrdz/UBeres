import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  ArrowLeft,
  User,
  MapPin,
  Shield,
  Globe,
  Palette,
  Bell,
  Lock,
  HelpCircle,
  FileText,
  ChevronRight,
  Moon,
  Sun,
  RefreshCw,
  Share2,
  LogOut
} from 'lucide-react';
import { useState } from 'react';

export function Settings() {
  const navigate = useNavigate();
  const { user, logout, setUserRole } = useApp();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showSwitchRoleDialog, setShowSwitchRoleDialog] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchRole = () => {
    setUserRole(user.role === 'client' ? 'worker' : 'client');
    window.location.reload();
  };

  const SETTINGS_SECTIONS = [
    {
      title: 'Akun',
      items: [
        {
          id: 'edit-profile',
          icon: User,
          label: 'Edit Profile',
          subtitle: 'Ubah nama, bio, dan foto profil',
          action: () => navigate('/edit-profile')
        },
        {
          id: 'switch-role',
          icon: RefreshCw,
          label: 'Switch Role',
          subtitle: user.role === 'client' ? 'Jadi Worker' : 'Jadi Client',
          action: () => setShowSwitchRoleDialog(true)
        },
        {
          id: 'location',
          icon: MapPin,
          label: 'Lokasi',
          subtitle: 'Malang, Jawa Timur',
          action: () => {}
        },
        {
          id: 'account-settings',
          icon: Shield,
          label: 'Keamanan Akun',
          subtitle: 'Password, verifikasi 2FA',
          action: () => {}
        },
      ]
    },
    {
      title: 'Preferensi',
      items: [
        {
          id: 'language',
          icon: Globe,
          label: 'Bahasa',
          subtitle: 'Bahasa Indonesia',
          action: () => {}
        },
        {
          id: 'theme',
          icon: isDarkMode ? Moon : Sun,
          label: 'Tema',
          subtitle: isDarkMode ? 'Mode Gelap' : 'Mode Terang',
          action: () => setIsDarkMode(!isDarkMode),
          hasToggle: true
        },
        {
          id: 'notifications',
          icon: Bell,
          label: 'Notifikasi',
          subtitle: 'Atur preferensi notifikasi',
          action: () => {}
        },
      ]
    },
    {
      title: 'Privasi & Keamanan',
      items: [
        {
          id: 'privacy',
          icon: Lock,
          label: 'Privasi',
          subtitle: 'Kontrol siapa yang bisa melihat profil',
          action: () => {}
        },
      ]
    },
    {
      title: 'Lainnya',
      items: [
        {
          id: 'share',
          icon: Share2,
          label: 'Share Profile',
          subtitle: 'Bagikan profil kamu',
          action: () => {}
        },
        {
          id: 'help',
          icon: HelpCircle,
          label: 'Bantuan & Dukungan',
          subtitle: 'FAQ, hubungi kami',
          action: () => {}
        },
        {
          id: 'terms',
          icon: FileText,
          label: 'Syarat & Ketentuan',
          subtitle: 'Kebijakan privasi, syarat layanan',
          action: () => {}
        },
        {
          id: 'logout',
          icon: LogOut,
          label: 'Logout',
          subtitle: 'Keluar dari akun',
          action: () => setShowLogoutDialog(true),
          isDanger: true
        },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-6">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Pengaturan</h1>
      </div>

      {/* User Info */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-[16px] p-4 flex items-center gap-4 shadow-sm">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-16 h-16 rounded-full"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{user?.name}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="mt-1">
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                {user?.role === 'client' ? 'Client' : 'Worker'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="px-6 space-y-6">
        {SETTINGS_SECTIONS.map((section, sectionIdx) => (
          <div key={section.title}>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
              {section.title}
            </h4>
            <div className="bg-white rounded-[18px] shadow-sm border border-gray-100 overflow-hidden">
              {section.items.map((item, itemIdx) => {
                const IconComponent = item.icon;
                const isLast = itemIdx === section.items.length - 1;

                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className={`w-full p-4 flex items-center justify-between transition-colors ${
                      item.isDanger
                        ? 'hover:bg-red-50 active:bg-red-100'
                        : 'hover:bg-gray-50 active:bg-gray-100'
                    } ${!isLast ? 'border-b border-gray-100' : ''}`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
                        item.isDanger ? 'bg-red-50' : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`w-5 h-5 ${
                          item.isDanger ? 'text-red-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className={`text-[15px] font-semibold ${
                          item.isDanger ? 'text-red-600' : 'text-gray-900'
                        }`}>{item.label}</span>
                        {item.subtitle && (
                          <span className="text-xs text-gray-500 mt-0.5">{item.subtitle}</span>
                        )}
                      </div>
                    </div>

                    {item.hasToggle ? (
                      <div className={`w-12 h-6 rounded-full transition-colors ${
                        isDarkMode ? 'bg-[#6366F1]' : 'bg-gray-200'
                      }`}>
                        <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                          isDarkMode ? 'ml-6' : 'ml-0.5'
                        }`} />
                      </div>
                    ) : (
                      <ChevronRight className={`w-5 h-5 ${
                        item.isDanger ? 'text-red-400' : 'text-gray-400'
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* App Version */}
      <div className="px-6 mt-8 mb-6">
        <p className="text-center text-xs text-gray-400">
          UBeres v1.0.0
        </p>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={showSwitchRoleDialog}
        title="Switch Role"
        message={`Switch role menjadi ${user.role === 'client' ? 'Worker' : 'Client'}?`}
        confirmText="Ya, Switch"
        onConfirm={handleSwitchRole}
        onCancel={() => setShowSwitchRoleDialog(false)}
      />

      <ConfirmDialog
        isOpen={showLogoutDialog}
        title="Logout"
        message="Yakin ingin logout dari aplikasi?"
        confirmText="Ya, Logout"
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />
    </div>
  );
}
