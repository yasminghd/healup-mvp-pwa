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
      <div className="healup-pulse-glow absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
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
          healup-pulse-button relative z-10 flex h-48 w-48 flex-col items-center justify-center rounded-full text-center
          transition-all duration-300 sm:h-56 sm:w-56
          ${disabled ? 'cursor-default opacity-90' : 'hover:scale-[1.02] active:scale-95'}
        `}
      >
        <span className="healup-pulse-label text-3xl font-bold tracking-tight sm:text-4xl">{label}</span>
        <span className="healup-pulse-sublabel mt-2 max-w-[9rem] text-sm leading-relaxed sm:max-w-[10rem]">{sublabel}</span>
      </button>
    </div>
  );
};

export default PulseCircle;
