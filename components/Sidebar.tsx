import React from 'react';
import { AppView, UserProfile } from '../types';
import {
  LayoutGrid,
  NotebookPen,
  HeartHandshake,
  Menu,
  X,
  Settings,
  ChevronRight,
  Bell,
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
  // Views that should also light up this nav item (sub-pages in the same cluster)
  alsoActiveFor?: AppView[];
};

const HealUpLogo = ({ className = '' }: { className?: string }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <svg
      width="34"
      height="34"
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0 drop-shadow-[0_0_18px_rgba(74,222,128,0.35)]"
    >
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
    <span className="healup-sidebar-wordmark text-2xl font-bold tracking-tight">HealUp</span>
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  userProfile,
}) => {
  const language = userProfile.language || 'English';

  // Four top-level destinations. Sub-pages in the same cluster also light their parent.
  const navItems: NavItem[] = [
    {
      id: AppView.DASHBOARD,
      label: t('dashboard', language),
      icon: LayoutGrid,
    },
    {
      id: AppView.TRACKER,
      label: t('journalSection', language),
      icon: NotebookPen,
      alsoActiveFor: [AppView.LAB_RESULTS, AppView.INSIGHTS],
    },
    {
      id: AppView.PAIN_PULSE,
      label: t('connectSection', language),
      icon: HeartHandshake,
      alsoActiveFor: [
        AppView.DISCOVER,
        AppView.GROUPS,
        AppView.COMMUNITY,
        AppView.EVENTS,
        AppView.RESEARCH,
        AppView.EXPERTS,
        AppView.CHAT,
      ],
    },
    {
      id: AppView.SETTINGS,
      label: t('settings', language),
      icon: Settings,
    },
  ].filter((item) => isViewEnabled(item.id));

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive =
      currentView === item.id || (item.alsoActiveFor?.includes(currentView) ?? false);

    return (
      <button
        key={item.id}
        onClick={() => {
          setCurrentView(item.id);
          setIsMobileMenuOpen(false);
        }}
        className={`healup-sidebar-item group relative flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition-all duration-200 ${
          isActive ? 'healup-sidebar-item-active' : ''
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        {isActive && (
          <span
            className="healup-sidebar-active-bar absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full"
            aria-hidden="true"
          />
        )}
        <Icon size={20} className="healup-sidebar-icon flex-shrink-0" />
        <span className="text-[15px] font-medium leading-tight">{item.label}</span>
      </button>
    );
  };

  const profileName = userProfile.name || t('yourProfile', language);
  const profileCondition = userProfile.condition || t('noConditionAdded', language);

  return (
    <>
      {/* Mobile Header */}
      <div className="healup-sidebar-mobile-header lg:hidden fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 z-50 backdrop-blur-md">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="healup-sidebar-mobile-toggle p-2"
          aria-label="Toggle navigation"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <HealUpLogo className="scale-90 origin-center" />

        <button className="healup-sidebar-mobile-toggle relative p-2" aria-label="Notifications">
          <Bell size={20} />
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-matcha-500"></span>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`healup-sidebar fixed top-0 left-0 h-full w-72 z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } pt-20 lg:pt-0 flex flex-col`}
      >
        {/* Top: Logo */}
        <div className="hidden lg:flex items-center gap-2 px-6 py-7 healup-sidebar-divider-bottom">
          <HealUpLogo />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
          {navItems.map((item) => renderNavItem(item))}
        </nav>

        {/* Bottom: Profile */}
        {isViewEnabled(AppView.PROFILE) && (
          <div className="healup-sidebar-divider-top px-4 py-4">
            <button
              onClick={() => {
                setCurrentView(AppView.PROFILE);
                setIsMobileMenuOpen(false);
              }}
              className="healup-sidebar-profile group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all"
            >
              {userProfile.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt=""
                  className="h-11 w-11 flex-shrink-0 rounded-full object-cover ring-2 ring-matcha-300/40"
                />
              ) : (
                <div className="healup-sidebar-avatar flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-base font-bold">
                  {(userProfile.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="healup-sidebar-profile-name truncate text-sm font-semibold">{profileName}</p>
                <p className="healup-sidebar-profile-meta truncate text-xs">{profileCondition}</p>
              </div>
              <ChevronRight size={16} className="healup-sidebar-profile-chevron flex-shrink-0" />
            </button>
          </div>
        )}
      </aside>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
