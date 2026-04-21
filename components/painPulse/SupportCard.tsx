import React from 'react';

interface SupportCardProps {
  message: string;
}

const SupportCard: React.FC<SupportCardProps> = ({ message }) => {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
      <p className="text-sm font-medium leading-relaxed text-gray-700">{message}</p>
    </div>
  );
};

export default SupportCard;
