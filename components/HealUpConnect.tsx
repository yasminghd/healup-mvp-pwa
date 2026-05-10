import React, { useState } from 'react';
import { BookOpen, ChevronRight, HeartHandshake } from 'lucide-react';
import PainPulse from './PainPulse';
import Research from './Research';
import { t } from '../translations';

type Section = 'pulse' | 'research';

interface HealUpConnectProps {
  language: string;
}

const HealUpConnect: React.FC<HealUpConnectProps> = ({ language }) => {
  const [section, setSection] = useState<Section>('pulse');

  const tabs: Array<{
    id: Section;
    title: string;
    description: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }> = [
    {
      id: 'pulse',
      title: t('painPulse', language),
      description: t('painPulseSubtitle', language),
      icon: HeartHandshake,
    },
    {
      id: 'research',
      title: t('research', language),
      description: t('researchSubtitle', language),
      icon: BookOpen,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {tabs.map(({ id, title, description, icon: Icon }) => {
          const isActive = section === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`group relative flex flex-col items-start gap-3 overflow-hidden rounded-[28px] border p-5 text-left transition-all sm:p-6 ${
                isActive
                  ? 'border-matcha-300 bg-white shadow-md shadow-matcha-100/60 ring-1 ring-matcha-200/40 -translate-y-0.5'
                  : 'border-gray-100 bg-gray-50/50 hover:-translate-y-0.5 hover:border-matcha-100 hover:bg-white hover:shadow-sm'
              }`}
            >
              <div className="flex w-full items-start justify-between gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                    isActive
                      ? 'bg-matcha-100 text-matcha-700'
                      : 'bg-white text-gray-400 group-hover:text-matcha-600'
                  }`}
                >
                  <Icon size={20} />
                </div>
                <ChevronRight
                  size={18}
                  className={`mt-1 transition-all ${
                    isActive
                      ? 'text-matcha-500'
                      : 'text-gray-300 group-hover:translate-x-0.5 group-hover:text-matcha-400'
                  }`}
                />
              </div>
              <div className="min-w-0">
                <p
                  className={`text-base font-bold ${
                    isActive ? 'text-matcha-900' : 'text-gray-700'
                  }`}
                >
                  {title}
                </p>
                <p className="mt-1 line-clamp-2 text-sm leading-snug text-gray-500">
                  {description}
                </p>
              </div>
              {isActive && (
                <span
                  aria-hidden
                  className="absolute inset-x-6 bottom-0 h-1 rounded-t-full bg-matcha-500"
                />
              )}
            </button>
          );
        })}
      </div>

      <div key={section} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
        {section === 'pulse' ? (
          <PainPulse language={language} />
        ) : (
          <Research language={language} />
        )}
      </div>
    </div>
  );
};

export default HealUpConnect;
