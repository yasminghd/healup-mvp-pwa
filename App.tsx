

import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Tracker from './components/Tracker';
import AiAssistant from './components/AiAssistant';
import Insights from './components/Insights';
import Experts from './components/Experts';
import Profile from './components/Profile';
import LabResults from './components/LabResults';
import Community from './components/Community';
import Events from './components/Events';
import Groups from './components/Groups';
import Discover from './components/Discover';
import Research from './components/Research';
import Settings from './components/Settings';
import PainPulse from './components/PainPulse';
import MobileTabBar from './components/MobileTabBar';
import OnboardingModal from './components/OnboardingModal';
import { AppView, DailyRecord, UserProfile, LabResult, Friend } from './types';
import { getDefaultEnabledView, getSafeView, isViewEnabled } from './config/features';
import { HeartHandshake, Leaf, ShieldCheck } from 'lucide-react';

const THEME_STORAGE_KEY = 'healup-theme-mode';
const TEXT_SIZE_STORAGE_KEY = 'healup-text-size';
const REDUCED_MOTION_STORAGE_KEY = 'healup-reduced-motion';
const REST_MODE_STORAGE_KEY = 'healup-rest-mode';
const ONBOARDING_STORAGE_KEY = 'healup-has-seen-onboarding';

const INITIAL_DATA: DailyRecord[] = [];

const INITIAL_LAB_DATA: LabResult[] = [];

const INITIAL_FRIENDS: Friend[] = [];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(() => getDefaultEnabledView());
  const [data, setData] = useState<DailyRecord[]>(INITIAL_DATA);
  const [labData, setLabData] = useState<LabResult[]>(INITIAL_LAB_DATA);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    username: '',
    role: 'Patient',
    condition: '',
    avatarUrl: '',
    bio: '',
    interests: [],
    age: '',
    location: '',
    gender: '',
    language: 'English',
    themeMode: 'light',
    restMode: false,
    textSize: 'comfortable',
    reducedMotion: false,
    privacySettings: {
      showAge: false,
      showLocation: true,
      showGender: false
    }
  });

  const language = userProfile.language || 'English';

  useEffect(() => {
    if (!isViewEnabled(currentView)) {
      setCurrentView(getDefaultEnabledView());
    }
  }, [currentView]);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setUserProfile((prev) => ({ ...prev, themeMode: savedTheme }));
    }

    const savedTextSize = window.localStorage.getItem(TEXT_SIZE_STORAGE_KEY);
    if (savedTextSize === 'comfortable' || savedTextSize === 'large' || savedTextSize === 'extra-large') {
      setUserProfile((prev) => ({ ...prev, textSize: savedTextSize }));
    }

    const savedReducedMotion = window.localStorage.getItem(REDUCED_MOTION_STORAGE_KEY);
    if (savedReducedMotion === 'true' || savedReducedMotion === 'false') {
      setUserProfile((prev) => ({ ...prev, reducedMotion: savedReducedMotion === 'true' }));
    }

    const savedRestMode = window.localStorage.getItem(REST_MODE_STORAGE_KEY);
    if (savedRestMode === 'true' || savedRestMode === 'false') {
      setUserProfile((prev) => ({ ...prev, restMode: savedRestMode === 'true' }));
    }

    if (window.localStorage.getItem(ONBOARDING_STORAGE_KEY) !== 'true') {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    const themeMode = userProfile.themeMode || 'light';
    document.body.classList.toggle('theme-dark', themeMode === 'dark');
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [userProfile.themeMode]);

  useEffect(() => {
    const textSize = userProfile.textSize || 'comfortable';
    document.body.dataset.textSize = textSize;
    window.localStorage.setItem(TEXT_SIZE_STORAGE_KEY, textSize);
  }, [userProfile.textSize]);

  useEffect(() => {
    const reducedMotion = Boolean(userProfile.reducedMotion);
    document.body.classList.toggle('reduce-motion', reducedMotion);
    window.localStorage.setItem(REDUCED_MOTION_STORAGE_KEY, String(reducedMotion));
  }, [userProfile.reducedMotion]);

  useEffect(() => {
    if (userProfile.reducedMotion) {
      document.documentElement.style.setProperty('--healup-scroll-y', '0px');
      return;
    }

    let frame = 0;
    const updateScrollVariable = () => {
      frame = 0;
      document.documentElement.style.setProperty('--healup-scroll-y', `${window.scrollY}px`);
    };

    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateScrollVariable);
    };

    updateScrollVariable();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [userProfile.reducedMotion]);

  useEffect(() => {
    window.localStorage.setItem(REST_MODE_STORAGE_KEY, String(Boolean(userProfile.restMode)));
  }, [userProfile.restMode]);

  const handleViewChange = (view: AppView) => {
    setCurrentView(getSafeView(view));
  };

  const handleSaveLog = (newRecord: DailyRecord) => {
    setData(prev => {
      // Check if a record exists for this date
      const existingIndex = prev.findIndex(r => r.date === newRecord.date);
      if (existingIndex >= 0) {
        // Update existing
        const updated = [...prev];
        updated[existingIndex] = newRecord;
        return updated.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      } else {
        // Add new and sort
        return [...prev, newRecord].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }
    });
  };

  const handleAddLabResult = (result: LabResult) => {
    setLabData(prev => [...prev, result]);
  };

  const renderView = () => {
    switch (getSafeView(currentView)) {
      case AppView.DASHBOARD:
        return <Dashboard data={data} language={language} restMode={Boolean(userProfile.restMode)} />;
      case AppView.TRACKER:
        return <Tracker existingData={data} onSave={handleSaveLog} language={language} restMode={Boolean(userProfile.restMode)} />;
      case AppView.LAB_RESULTS:
        return <LabResults labData={labData} onAddResult={handleAddLabResult} userProfile={userProfile} />;
      case AppView.CHAT:
        return <AiAssistant language={language} />;
      case AppView.INSIGHTS:
        return <Insights data={data} language={language} />;
      case AppView.PAIN_PULSE:
        return <PainPulse />;
      case AppView.EXPERTS:
        return <Experts language={language} />;
      case AppView.COMMUNITY:
        return <Community userProfile={userProfile} friends={INITIAL_FRIENDS} />;
      case AppView.EVENTS:
        return <Events language={language} />;
      case AppView.GROUPS:
        return <Groups language={language} />;
      case AppView.DISCOVER:
        return <Discover userProfile={userProfile} />;
      case AppView.RESEARCH:
        return <Research language={language} />;
      case AppView.SETTINGS:
        return <Settings userProfile={userProfile} onUpdateProfile={setUserProfile} />;
      case AppView.PROFILE:
        return <Profile userProfile={userProfile} onUpdateProfile={setUserProfile} friends={INITIAL_FRIENDS} />;
      default:
        return <Dashboard data={data} language={language} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-matcha-50 via-[#f5f0e6] to-[#eef3e8]">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={handleViewChange}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        userProfile={userProfile}
      />
      
      <main className="relative mt-16 flex-1 overflow-x-hidden p-5 pb-32 lg:mt-0 lg:p-10 lg:pb-14">
        {!userProfile.reducedMotion && (
          <>
            <div className="healup-parallax-layer healup-parallax-orb pointer-events-none absolute right-[-4rem] top-12 h-40 w-40 rounded-full opacity-80" style={{ ['--parallax-speed' as string]: '0.045' }} />
            <div className="healup-parallax-layer healup-parallax-orb pointer-events-none absolute left-[-3rem] top-[28rem] h-28 w-28 rounded-full opacity-70" style={{ ['--parallax-speed' as string]: '-0.03' }} />
            <Leaf className="healup-parallax-layer healup-parallax-leaf pointer-events-none absolute right-12 top-32 h-10 w-10 rotate-12" style={{ ['--parallax-speed' as string]: '0.055' }} />
            <Leaf className="healup-parallax-layer healup-parallax-leaf pointer-events-none absolute left-10 top-[34rem] h-8 w-8 -rotate-[18deg]" style={{ ['--parallax-speed' as string]: '-0.04' }} />
          </>
        )}
        <div className="relative mx-auto max-w-6xl space-y-10">
          <div className="healup-card healup-reveal mb-2 flex flex-col gap-4 rounded-[30px] p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-matcha-50 px-3 py-2 text-xs font-semibold text-matcha-800">
                <ShieldCheck size={14} />
                Privacy-first by default
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#efe6d6] px-3 py-2 text-xs font-semibold text-[#6a8963]">
                <Leaf size={14} />
                Designed for people living with Sjogren's
              </span>
            </div>

            <button
              type="button"
              onClick={() => setUserProfile((prev) => ({ ...prev, restMode: !prev.restMode }))}
              className={`inline-flex min-h-[48px] items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all hover:scale-[1.01] ${
                userProfile.restMode
                  ? 'border-matcha-200 bg-matcha-100 text-matcha-900'
                  : 'border-matcha-100 bg-[#fffdf9] text-matcha-800 hover:bg-matcha-50'
              }`}
            >
              <Leaf size={16} />
              {userProfile.restMode ? 'Rest mode is on' : 'Turn on rest mode'}
            </button>
          </div>
          <div className="healup-divider" />
          {renderView()}
          <footer className="healup-card healup-reveal rounded-[30px] px-6 py-6 lg:px-7 lg:py-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-matcha-800">Made with care for the Sjogren&apos;s community.</p>
                <p className="mt-1 text-sm text-gray-500">A calm space for check-ins, patterns, and support that stays gentle to use on lower-energy days.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleViewChange(AppView.SETTINGS)}
                  className="min-h-[44px] rounded-2xl border border-matcha-100 bg-[#fffdf9] px-4 py-2 text-sm font-semibold text-matcha-800 transition-colors hover:bg-matcha-50"
                >
                  Settings
                </button>
                <button
                  type="button"
                  onClick={() => handleViewChange(AppView.RESEARCH)}
                  className="min-h-[44px] rounded-2xl border border-matcha-100 bg-[#fffdf9] px-4 py-2 text-sm font-semibold text-matcha-800 transition-colors hover:bg-matcha-50"
                >
                  Research & News
                </button>
                <a
                  href="mailto:admin@healup-health.com?subject=HealUp%20Support"
                  className="inline-flex min-h-[44px] items-center rounded-2xl border border-matcha-100 bg-[#fffdf9] px-4 py-2 text-sm font-semibold text-matcha-800 transition-colors hover:bg-matcha-50"
                >
                  Contact
                </a>
              </div>
            </div>
          </footer>
        </div>
      </main>

      <button
        type="button"
        onClick={() => handleViewChange(AppView.PAIN_PULSE)}
        className="fixed bottom-28 right-4 z-50 flex min-h-[56px] items-center gap-2 rounded-full border border-matcha-100 bg-[#fbf8f1]/94 px-4 py-3 text-sm font-semibold text-matcha-800 shadow-sm backdrop-blur-md transition-colors hover:bg-matcha-50 lg:bottom-6 lg:right-6"
      >
        <HeartHandshake size={18} className="text-matcha-700" />
        <span>SOS</span>
      </button>

      <MobileTabBar currentView={currentView} onSelect={handleViewChange} />
      {showOnboarding && (
        <OnboardingModal
          onClose={() => {
            window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
            setShowOnboarding(false);
          }}
        />
      )}
    </div>
  );
};

export default App;

