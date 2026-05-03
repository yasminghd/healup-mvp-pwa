import React from 'react';
import { AppView } from '../types';
import { BrainCircuit, Heart, House, NotebookPen, UserRound } from 'lucide-react';
import { isViewEnabled } from '../config/features';
import { t } from '../translations';

type MobileTabBarProps = {
  currentView: AppView;
  onSelect: (view: AppView) => void;
  language: string;
};

type TabItem = {
  id: AppView;
  labelKey: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const tabItems: TabItem[] = [
  { id: AppView.DASHBOARD, labelKey: 'home', icon: House },
  { id: AppView.TRACKER, labelKey: 'track', icon: NotebookPen },
  { id: AppView.INSIGHTS, labelKey: 'insights', icon: BrainCircuit },
  { id: AppView.PAIN_PULSE, labelKey: 'community', icon: Heart },
  { id: AppView.PROFILE, labelKey: 'profile', icon: UserRound },
];

const MobileTabBar: React.FC<MobileTabBarProps> = ({ currentView, onSelect, language }) => {
  const visibleTabItems = tabItems.filter((item) => isViewEnabled(item.id));

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-matcha-100 bg-[#fbf8f1]/94 px-2 pt-2 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.5rem)' }}
    >
      <div className="mx-auto grid max-w-md gap-2" style={{ gridTemplateColumns: `repeat(${visibleTabItems.length}, minmax(0, 1fr))` }}>
        {visibleTabItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`flex min-h-[72px] flex-col items-center justify-center rounded-2xl px-2 py-3 text-center transition-colors ${
                isActive ? 'bg-matcha-100 text-matcha-800 shadow-sm' : 'text-gray-600 hover:bg-matcha-50 hover:text-matcha-700'
              }`}
            >
              <Icon size={19} className={isActive ? 'text-matcha-700' : 'text-gray-500'} />
              <span className="mt-1.5 text-xs font-medium leading-tight">{t(item.labelKey, language)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileTabBar;
