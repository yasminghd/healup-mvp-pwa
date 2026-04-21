
import React, { useState } from 'react';
import { AppView, UserProfile } from '../types';
import { 
  LayoutGrid, 
  NotebookPen, 
  HeartHandshake,
  Heart,
  BrainCircuit, 
  MessagesSquare,
  Stethoscope, 
  Bot,
  Menu,
  X,
  Settings,
  TestTube2,
  CalendarDays,
  ChevronRight,
  ChevronDown,
  Tent,
  Microscope,
  Search,
  Bell
} from 'lucide-react';
import { t } from '../translations';
import { isViewEnabled } from '../config/features';

interface SidebarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  userProfile: UserProfile;
}

type NavItem = {
  id: AppView;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

// Custom Logo Component matching the HealUp brand
const HealUpLogo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
      <path 
        d="M10 4C10 2.34315 11.3431 1 13 1H21C22.6569 1 24 2.34315 24 4V10H30C31.6569 10 33 11.3431 33 13V21C33 22.6569 31.6569 24 30 24H24V30C24 31.6569 22.6569 33 21 33H13C11.3431 33 10 31.6569 10 30V24H4C2.34315 24 1 22.6569 1 21V13C1 11.3431 2.34315 10 4 10H10V4Z" 
        fill="#a8c39e"
      />
      <path 
        d="M12 22L24 10M24 10H16M24 10V18" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
    <span className="text-2xl font-bold text-[#556b4a] tracking-tight">HealUp</span>
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setCurrentView, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen,
  userProfile 
}) => {
  const language = userProfile.language || 'English';
  const [isJournalOpen, setIsJournalOpen] = useState(true);
  const [isConnectOpen, setIsConnectOpen] = useState(true);

  const mainItems: NavItem[] = [
    { id: AppView.DASHBOARD, label: t('dashboard', language), icon: LayoutGrid },
  ].filter((item) => isViewEnabled(item.id));

  const journalItems: NavItem[] = [
    { id: AppView.TRACKER, label: t('tracker', language), icon: NotebookPen },
    { id: AppView.LAB_RESULTS, label: t('labs', language), icon: TestTube2 },
    { id: AppView.INSIGHTS, label: t('insights', language), icon: BrainCircuit },
  ].filter((item) => isViewEnabled(item.id));

  const connectItems: NavItem[] = [
    { id: AppView.PAIN_PULSE, label: t('painPulse', language), icon: Heart },
    { id: AppView.DISCOVER, label: t('discover', language), icon: Search },
    { id: AppView.GROUPS, label: t('groups', language), icon: Tent },
    { id: AppView.COMMUNITY, label: t('community', language), icon: MessagesSquare },
    { id: AppView.EVENTS, label: t('events', language), icon: CalendarDays },
    { id: AppView.RESEARCH, label: t('research', language), icon: Microscope },
    { id: AppView.EXPERTS, label: t('experts', language), icon: Stethoscope },
  ].filter((item) => isViewEnabled(item.id));

  const utilityItems: NavItem[] = [
    { id: AppView.CHAT, label: t('assistant', language), icon: Bot },
    { id: AppView.SETTINGS, label: t('settings', language), icon: Settings },
  ].filter((item) => isViewEnabled(item.id));

  const isJournalActive = journalItems.some((item) => item.id === currentView);
  const isConnectActive = connectItems.some((item) => item.id === currentView);

  const renderNavItem = (item: NavItem, isNested = false) => {
    const Icon = item.icon;
    const isActive = currentView === item.id;

    return (
      <button
        key={item.id}
        onClick={() => {
          setCurrentView(item.id);
          setIsMobileMenuOpen(false);
        }}
        className={`
          w-full flex items-center gap-3 ${isNested ? 'pl-10 pr-4 py-2.5' : 'px-4 py-3'} rounded-xl transition-all duration-200 text-left
          ${isActive
            ? 'bg-matcha-50 text-matcha-700 font-semibold shadow-sm ring-1 ring-matcha-100'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
        `}
      >
        <Icon size={18} className={isActive ? 'text-matcha-600' : 'text-gray-400'} />
        <span className={isNested ? 'text-sm' : ''}>{item.label}</span>
      </button>
    );
  };

  return (
    <>
      {/* Mobile Header Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-matcha-100 bg-[#fbf8f1]/95 flex items-center justify-between px-4 z-50 backdrop-blur-md">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-matcha-800 p-2" aria-label="Toggle navigation">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <HealUpLogo className="scale-90 origin-center" />

        <button className="relative p-2 text-[#7a756c]" aria-label="Notifications">
          <Bell size={20} />
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-[#c2a980]"></span>
        </button>
      </div>

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 border-r border-matcha-100 bg-[#fbf8f1] z-40 transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        pt-20 lg:pt-0
      `}>
        <div className="hidden lg:flex items-center gap-2 p-6 border-b border-matcha-50">
           <HealUpLogo />
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
          {mainItems.map((item) => renderNavItem(item))}

          {journalItems.length > 0 && (
            <>
              <button
                onClick={() => setIsJournalOpen((prev) => !prev)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isJournalActive ? 'text-gray-900 font-semibold' : 'text-gray-700'} hover:bg-matcha-50/80`}
                aria-expanded={isJournalOpen}
              >
                <NotebookPen size={18} className={isJournalActive ? 'text-matcha-600' : 'text-gray-400'} />
                <span className="flex-1 text-left">{t('journalSection', language)}</span>
                {isJournalOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
              </button>
              {isJournalOpen && journalItems.map((item) => renderNavItem(item, true))}
            </>
          )}

          {connectItems.length > 0 && (
            <>
              <button
                onClick={() => setIsConnectOpen((prev) => !prev)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isConnectActive ? 'text-gray-900 font-semibold' : 'text-gray-700'} hover:bg-matcha-50/80`}
                aria-expanded={isConnectOpen}
              >
                <HeartHandshake size={18} className={isConnectActive ? 'text-matcha-600' : 'text-gray-400'} />
                <span className="flex-1 text-left">{t('connectSection', language)}</span>
                {isConnectOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
              </button>
              {isConnectOpen && connectItems.map((item) => renderNavItem(item, true))}
            </>
          )}

          {utilityItems.length > 0 && <div className="my-2 border-t border-gray-100" />}

          {utilityItems.map((item) => renderNavItem(item))}
        </nav>

        {isViewEnabled(AppView.PROFILE) && (
          <div className="absolute bottom-0 w-full border-t border-matcha-50 bg-[linear-gradient(180deg,rgba(248,244,235,0.8),rgba(238,243,232,0.95))] p-4">
            <button 
              onClick={() => {
                setCurrentView(AppView.PROFILE);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full hover:bg-matcha-100/50 p-2 rounded-lg transition-colors text-left group"
            >
              <img 
                src={userProfile.avatarUrl} 
                alt="User" 
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" 
              />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-gray-800 group-hover:text-matcha-800 truncate">{userProfile.name}</p>
                <p className="text-xs text-gray-500 truncate">{userProfile.condition}</p>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-matcha-600" />
            </button>
          </div>
        )}
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
