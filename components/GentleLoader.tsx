import React from 'react';
import { Droplets, Leaf } from 'lucide-react';

interface GentleLoaderProps {
  title: string;
  subtitle?: string;
  tone?: 'matcha' | 'cream';
  compact?: boolean;
}

const GentleLoader: React.FC<GentleLoaderProps> = ({ title, subtitle, tone = 'matcha', compact = false }) => {
  const isCream = tone === 'cream';

  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'gap-3 py-6' : 'gap-4 py-10'}`}>
      <div className={`relative flex h-16 w-16 items-center justify-center rounded-full ${isCream ? 'bg-[#f4f0df]' : 'bg-matcha-50'}`}>
        <div className={`absolute h-16 w-16 rounded-full ${isCream ? 'bg-[#e7e1c8]/70' : 'bg-matcha-100/70'} animate-ping motion-reduce:animate-none`} />
        <div className={`absolute h-12 w-12 rounded-full ${isCream ? 'bg-white/80' : 'bg-white/80'} animate-pulse motion-reduce:animate-none`} />
        <Leaf size={18} className={`${isCream ? 'text-[#567f57]' : 'text-matcha-700'} relative z-10`} />
        <Droplets size={14} className={`${isCream ? 'text-[#8abf5a]' : 'text-matcha-500'} absolute -bottom-1 -right-1 z-10`} />
      </div>
      <div className="max-w-sm">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {subtitle && <p className="mt-1 text-sm leading-6 text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
};

export default GentleLoader;
