import { motion } from 'motion/react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function Loading({ size = 'md', label = 'Memuat...' }: LoadingProps) {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-[3px]',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Background Ring */}
        <div className={`${sizes[size]} border-[#6366f2]/10 rounded-full`} />
        
        {/* Spinning Indicator */}
        <motion.div
          className={`absolute inset-0 ${sizes[size]} border-t-[#6366f2] border-r-transparent border-b-transparent border-l-transparent rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
        />
      </div>
      {label && (
        <p className="text-[13px] font-medium text-[#6366f2]/40 animate-pulse tracking-tight text-center">
          {label}
        </p>
      )}
    </div>
  );
}

export function FullScreenLoading({ label }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[999] bg-white/98 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="text-center">
        <Loading size="lg" label={label} />
        <div className="mt-8">
          <h2 className="text-2xl font-extrabold text-[#6366f2] mb-1 tracking-tight">UBeres</h2>
          <p className="text-[11px] font-medium text-[#6366f2]/30 tracking-wide">Marketplace Mahasiswa Universitas Brawijaya</p>
        </div>
      </div>
    </div>
  );
}
