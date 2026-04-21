import React from 'react';

interface PulseCircleProps {
  label: string;
  sublabel: string;
  onClick: () => void;
  disabled?: boolean;
  isSending?: boolean;
}

const rippleBase = 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2';
const rippleInnerBase = 'h-full w-full rounded-full border border-matcha-300/55 bg-matcha-200/18';

const PulseCircle: React.FC<PulseCircleProps> = ({
  label,
  sublabel,
  onClick,
  disabled = false,
  isSending = false,
}) => {
  const rippleClasses = isSending ? 'animate-ping opacity-70' : 'animate-pulse opacity-50';

  return (
    <div className="relative flex items-center justify-center py-10 sm:py-14">
      <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-matcha-200/55 via-[#fffdf9] to-[#efe4d1]/45 blur-3xl" />
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={rippleBase}
          style={{
            width: `${220 + index * 42}px`,
            height: `${220 + index * 42}px`,
          }}
        >
          <span
            className={`${rippleInnerBase} ${rippleClasses} block`}
            style={{ animationDelay: `${index * 0.6}s` }}
          />
        </span>
      ))}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`
          relative z-10 flex h-48 w-48 flex-col items-center justify-center rounded-full border border-white/80
          bg-[linear-gradient(180deg,rgba(255,253,249,0.96),rgba(239,243,232,0.9))] text-center shadow-[0_24px_80px_rgba(106,137,99,0.18)] backdrop-blur-sm
          transition-all duration-300 sm:h-56 sm:w-56
          ${disabled ? 'cursor-default opacity-90' : 'hover:scale-[1.02] active:scale-95'}
        `}
      >
        <span className="text-3xl font-bold tracking-tight text-matcha-800 sm:text-4xl">{label}</span>
        <span className="mt-2 max-w-[9rem] text-sm leading-relaxed text-matcha-700 sm:max-w-[10rem]">{sublabel}</span>
      </button>
    </div>
  );
};

export default PulseCircle;
