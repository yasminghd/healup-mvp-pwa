
import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import {
  Bell,
  Shield,
  Globe,
  Moon,
  Type,
  HelpCircle,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff,
  User
} from 'lucide-react';
import { t } from '../translations';
import { logout } from '../services/cardinal';
import {
  fireTestNotification,
  getBrowserPermission,
  getReminderSettings,
  requestBrowserPermission,
  setReminderSettings,
} from '../services/notifications';

interface SettingsProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ userProfile, onUpdateProfile, onLogout }) => {
  const language = userProfile.language || 'English';

  const [reminder, setReminder] = useState(() => getReminderSettings());
  const [browserPerm, setBrowserPerm] = useState<NotificationPermission | 'unsupported'>(
    () => getBrowserPermission()
  );

  useEffect(() => {
    const refresh = () => setBrowserPerm(getBrowserPermission());
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  const updateReminder = (next: Partial<ReturnType<typeof getReminderSettings>>) => {
    const merged = { ...reminder, ...next };
    setReminder(merged);
    setReminderSettings(next);
  };

  const handleToggleReminder = () => {
    updateReminder({ enabled: !reminder.enabled });
  };

  const handleToggleSystem = async () => {
    if (!reminder.showAsSystem) {
      const result = await requestBrowserPermission();
      setBrowserPerm(result);
      if (result !== 'granted') return;
      updateReminder({ showAsSystem: true });
    } else {
      updateReminder({ showAsSystem: false });
    }
  };

  const systemDescription =
    browserPerm === 'unsupported'
      ? 'This browser does not support system notifications.'
      : browserPerm === 'denied'
        ? 'Blocked in your browser settings. Re-allow notifications for this site to enable.'
        : 'Also pop up reminders as system notifications when the tab is open.';

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to sign out?')) return;
    await logout();
    onLogout();
  };

  const updatePrivacy = (key: keyof typeof userProfile.privacySettings) => {
    onUpdateProfile({
      ...userProfile,
      privacySettings: {
        ...userProfile.privacySettings,
        [key]: !userProfile.privacySettings[key]
      }
    });
  };

  const updateLanguage = (lang: string) => {
    onUpdateProfile({
      ...userProfile,
      language: lang
    });
  };

  const toggleThemeMode = () => {
    onUpdateProfile({
      ...userProfile,
      themeMode: userProfile.themeMode === 'dark' ? 'light' : 'dark'
    });
  };

  const toggleRestMode = () => {
    onUpdateProfile({
      ...userProfile,
      restMode: !userProfile.restMode
    });
  };

  const updateTextSize = (textSize: 'comfortable' | 'large' | 'extra-large') => {
    onUpdateProfile({
      ...userProfile,
      textSize
    });
  };

  const toggleReducedMotion = () => {
    onUpdateProfile({
      ...userProfile,
      reducedMotion: !userProfile.reducedMotion
    });
  };

  const languages = ['English', 'French', 'German', 'Italian', 'Romansh'];

  const Section = ({ title, icon: Icon, children }: any) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      <div className="p-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
        <div className="p-2 bg-white rounded-lg shadow-sm text-matcha-600">
           <Icon size={18} />
        </div>
        <h3 className="font-bold text-gray-800">{title}</h3>
      </div>
      <div className="p-4 space-y-4">
        {children}
      </div>
    </div>
  );

  const ToggleRow = ({ label, description, checked, onChange }: any) => (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <button 
        onClick={onChange}
        className={`w-12 h-6 rounded-full transition-colors relative ${checked ? 'bg-matcha-600' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 pb-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('settingsTitle', language)}</h1>
        <p className="text-gray-500">{t('settingsSubtitle', language)}</p>
      </header>

      {/* General / Language */}
      <Section title={t('general', language)} icon={Globe}>
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
             <p className="text-sm font-medium text-gray-900">{t('appLanguage', language)}</p>
             <p className="text-xs text-gray-500">{t('changeLangDesc', language)}</p>
           </div>
           <select 
             value={userProfile.language || 'English'}
             onChange={(e) => updateLanguage(e.target.value)}
             className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-matcha-500 focus:border-matcha-500 block p-2.5 outline-none min-w-[150px]"
           >
             {languages.map(l => <option key={l} value={l}>{l}</option>)}
           </select>
         </div>
      </Section>

      {/* Privacy */}
      <Section title={t('privacy', language)} icon={Shield}>
        <ToggleRow 
          label={t('showLoc', language)}
          description={t('showLocDesc', language)}
          checked={userProfile.privacySettings.showLocation}
          onChange={() => updatePrivacy('showLocation')}
        />
        <div className="h-px bg-gray-100 my-1"></div>
        <ToggleRow 
          label={t('showAge', language)}
          description={t('showAgeDesc', language)}
          checked={userProfile.privacySettings.showAge}
          onChange={() => updatePrivacy('showAge')}
        />
        <div className="h-px bg-gray-100 my-1"></div>
        <ToggleRow 
          label={t('showGender', language)}
          description={t('showGenderDesc', language)}
          checked={userProfile.privacySettings.showGender}
          onChange={() => updatePrivacy('showGender')}
        />
      </Section>

      {/* Notifications */}
      <Section title={t('notifications', language)} icon={Bell}>
        <ToggleRow
          label={t('dailyCheck', language)}
          description={`Send a daily reminder to log your symptoms${reminder.enabled ? ` at ${reminder.time}.` : '.'}`}
          checked={reminder.enabled}
          onChange={handleToggleReminder}
        />

        {reminder.enabled && (
          <div className="flex items-center justify-between py-1 pl-1">
            <div>
              <p className="text-sm font-medium text-gray-900">Reminder time</p>
              <p className="text-xs text-gray-500">When to send the daily check-in.</p>
            </div>
            <input
              type="time"
              value={reminder.time}
              onChange={(e) => updateReminder({ time: e.target.value })}
              className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-matcha-500 focus:border-matcha-500 p-2.5 outline-none"
            />
          </div>
        )}

        <div className="h-px bg-gray-100 my-1"></div>

        <ToggleRow
          label="System notifications"
          description={systemDescription}
          checked={reminder.showAsSystem && browserPerm === 'granted'}
          onChange={handleToggleSystem}
        />

        <div className="h-px bg-gray-100 my-1"></div>

        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm font-medium text-gray-900">Send a test notification</p>
            <p className="text-xs text-gray-500">
              Confirms your inbox{reminder.showAsSystem && browserPerm === 'granted' ? ' and system notifications' : ''} are working.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fireTestNotification()}
            className="rounded-xl border border-matcha-200 bg-white px-3 py-2 text-sm font-semibold text-matcha-800 hover:bg-matcha-50"
          >
            Send test
          </button>
        </div>

        <p className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
          Reminders fire only while HealUp is open in a browser tab. Closed-tab notifications need a server-side push setup, which isn't connected yet.
        </p>
      </Section>

      {/* Appearance */}
      <Section title={t('appearance', language)} icon={Moon}>
         <ToggleRow
          label={t('darkMode', language)}
          description={t('darkModeDesc', language)}
          checked={userProfile.themeMode === 'dark'}
          onChange={toggleThemeMode}
        />
        <div className="h-px bg-gray-100 my-2"></div>
        <ToggleRow
          label={t('restModeLabel', language)}
          description={t('restModeDesc', language)}
          checked={Boolean(userProfile.restMode)}
          onChange={toggleRestMode}
        />
        <div className="h-px bg-gray-100 my-2"></div>
        <ToggleRow
          label={t('reducedMotionLabel', language)}
          description={t('reducedMotionDesc', language)}
          checked={Boolean(userProfile.reducedMotion)}
          onChange={toggleReducedMotion}
        />
        <div className="h-px bg-gray-100 my-2"></div>
        <div className="flex items-center justify-between py-1">
           <div className="flex items-center gap-2">
             <Type size={16} className="text-gray-400"/>
             <span className="text-sm font-medium text-gray-900">{t('textSize', language)}</span>
           </div>
           <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
             <button onClick={() => updateTextSize('comfortable')} className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold ${userProfile.textSize !== 'large' && userProfile.textSize !== 'extra-large' ? 'bg-white shadow-sm text-matcha-800' : 'text-gray-500'}`}>A</button>
             <button onClick={() => updateTextSize('large')} className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold ${userProfile.textSize === 'large' ? 'bg-white shadow-sm text-matcha-800' : 'text-gray-500'}`}>A</button>
             <button onClick={() => updateTextSize('extra-large')} className={`w-8 h-8 flex items-center justify-center rounded text-lg font-bold ${userProfile.textSize === 'extra-large' ? 'bg-white shadow-sm text-matcha-800' : 'text-gray-500'}`}>A</button>
           </div>
        </div>
        <p className="text-xs text-gray-500">{t('textSizeDesc', language)}</p>
      </Section>

      {/* About & Support */}
      <Section title={t('support', language)} icon={HelpCircle}>
        <div className="rounded-2xl border border-matcha-100 bg-matcha-50/60 p-4">
          <p className="text-sm font-semibold text-matcha-800">{t('builtWithCare', language)}</p>
          <p className="mt-1 text-sm leading-6 text-gray-600">{t('healUpKeepsPrivacy', language)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-matcha-800">{t('privateByDefault', language)}</span>
            <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-matcha-800">{t('designedForBadge', language)}</span>
          </div>
        </div>
        <div className="h-px bg-gray-100 my-1"></div>
        <button className="w-full text-left py-2 flex items-center justify-between hover:bg-gray-50 -mx-4 px-4 transition-colors">
          <span className="text-sm font-medium text-gray-700">{t('helpCenter', language)}</span>
          <ChevronRight size={16} className="text-gray-400" />
        </button>
        <div className="h-px bg-gray-100 my-1"></div>
        <button className="w-full text-left py-2 flex items-center justify-between hover:bg-gray-50 -mx-4 px-4 transition-colors">
          <span className="text-sm font-medium text-gray-700">{t('privacyPolicy', language)}</span>
          <ChevronRight size={16} className="text-gray-400" />
        </button>
        <div className="h-px bg-gray-100 my-1"></div>
        <button className="w-full text-left py-2 flex items-center justify-between hover:bg-gray-50 -mx-4 px-4 transition-colors">
          <span className="text-sm font-medium text-gray-700">{t('terms', language)}</span>
          <ChevronRight size={16} className="text-gray-400" />
        </button>
      </Section>

      <div className="mt-8 pt-4 border-t border-gray-200">
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 font-medium hover:bg-red-50 px-4 py-3 rounded-xl transition-colors w-full justify-center">
          <LogOut size={18} /> {t('signOut', language)}
        </button>
        <p className="text-center text-xs text-gray-400 mt-4">HealUp v1.0.4 (Beta)</p>
      </div>

    </div>
  );
};

export default Settings;
