import React from 'react';

interface StateViewProps {
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}

const StateView: React.FC<StateViewProps> = ({ eyebrow, title, description, children }) => {
  return (
    <div className="healup-card rounded-[30px] p-7 sm:p-8">
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha-600">{eyebrow}</p>}
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">{description}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
};

export default StateView;
