import { AppView } from '../types';

export type FeatureStatus =
  | 'mvp-active'
  | 'hidden-kept-for-later'
  | 'disabled-no-ui'
  | 'deleted'
  | 'planned'
  | 'needs-review';

export type FeatureDefinition = {
  id: string;
  name: string;
  navLabel: string | null;
  routeOrComponent: string;
  status: FeatureStatus;
  isMvp: boolean;
  state: 'visible' | 'hidden' | 'disabled' | 'deleted' | 'planned';
  note: string;
  appView?: AppView;
};

// This file is the machine-readable source used for feature scope tracking.
// Keep it aligned with docs/FEATURE_REGISTRY.md whenever feature scope changes.
export const featureRegistry: FeatureDefinition[] = [
  {
    id: 'dashboard-overview',
    name: 'Dashboard Overview',
    navLabel: 'Dashboard',
    routeOrComponent: 'AppView.DASHBOARD -> components/Dashboard.tsx',
    status: 'mvp-active',
    isMvp: true,
    state: 'visible',
    note: 'Primary home screen with a top consistency/rewards panel, calm empty states before tracking starts, actual logged-day summary cards, and a shared care-focused footer in the app shell.',
    appView: AppView.DASHBOARD,
  },
  {
    id: 'symptom-tracker',
    name: 'Symptom Tracker',
    navLabel: 'Track Symptoms',
    routeOrComponent: 'AppView.TRACKER -> components/Tracker.tsx',
    status: 'mvp-active',
    isMvp: true,
    state: 'visible',
    note: 'Core daily logging starts with no predefined symptoms or lifestyle measures; patients can define their own tracked items, limits, and notes.',
    appView: AppView.TRACKER,
  },
  {
    id: 'rest-mode',
    name: 'Rest Mode',
    navLabel: null,
    routeOrComponent: 'App.tsx + components/Dashboard.tsx + components/Tracker.tsx + components/Settings.tsx',
    status: 'mvp-active',
    isMvp: true,
    state: 'visible',
    note: 'A shared simplified-view toggle for lower-energy days reduces visual density on the dashboard and tracker while staying easy to turn on or off.',
  },
  {
    id: 'symptom-report-export',
    name: 'Symptom Report Export',
    navLabel: null,
    routeOrComponent: 'components/Tracker.tsx',
    status: 'mvp-active',
    isMvp: true,
    state: 'visible',
    note: 'CSV export for symptom logs is available from the tracker header.',
  },
  {
    id: 'lab-results',
    name: 'Lab Results',
    navLabel: 'Lab Results',
    routeOrComponent: 'AppView.LAB_RESULTS -> components/LabResults.tsx',
    status: 'mvp-active',
    isMvp: true,
    state: 'visible',
    note: 'Manual lab entry starts with no predefined lab history or selected tests; charts and recent history appear after patient-entered results.',
    appView: AppView.LAB_RESULTS,
  },
  {
    id: 'lab-scan-import',
    name: 'Lab Scan Import',
    navLabel: null,
    routeOrComponent: 'components/LabResults.tsx + services/geminiService.ts',
    status: 'mvp-active',
    isMvp: true,
    state: 'visible',
    note: 'AI-assisted lab image parsing is exposed in UI and depends on Gemini configuration.',
  },
  {
    id: 'lab-export',
    name: 'Lab Results Export',
    navLabel: null,
    routeOrComponent: 'components/LabResults.tsx',
    status: 'mvp-active',
    isMvp: true,
    state: 'visible',
    note: 'CSV export for lab history is active.',
  },
  {
    id: 'ai-insights',
    name: 'AI Insights',
    navLabel: 'AI Insights',
    routeOrComponent: 'AppView.INSIGHTS -> components/Insights.tsx',
    status: 'hidden-kept-for-later',
    isMvp: false,
    state: 'hidden',
    note: 'Weekly AI analysis page remains implemented but is hidden at this stage.',
    appView: AppView.INSIGHTS,
  },
  {
    id: 'pain-pulse',
    name: 'Pain Pulse',
    navLabel: 'Pain Pulse',
    routeOrComponent: 'AppView.PAIN_PULSE -> components/PainPulse.tsx',
    status: 'mvp-active',
    isMvp: true,
    state: 'visible',
    note: 'Quiet support flow inside HealUp Connect with empty realtime-support states, responder states, custom support notes, and preset affirmations. Mobile bottom nav presents this as Community and the SOS shortcut opens it directly.',
    appView: AppView.PAIN_PULSE,
  },
  {
    id: 'profile-management',
    name: 'Profile Management',
    navLabel: 'Profile shortcut card',
    routeOrComponent: 'AppView.PROFILE -> components/Profile.tsx',
    status: 'mvp-active',
    isMvp: true,
    state: 'visible',
    note: 'Editable account profile, demographics, interests, and friend list.',
    appView: AppView.PROFILE,
  },
  {
    id: 'avatar-generation',
    name: 'AI Avatar Generation',
    navLabel: null,
    routeOrComponent: 'components/Profile.tsx + services/geminiService.ts',
    status: 'mvp-active',
    isMvp: true,
    state: 'visible',
    note: 'Profile includes AI avatar generation while editing; depends on Gemini image support.',
  },
  {
    id: 'settings-core',
    name: 'Settings',
    navLabel: 'Settings',
    routeOrComponent: 'AppView.SETTINGS -> components/Settings.tsx',
    status: 'mvp-active',
    isMvp: true,
    state: 'visible',
    note: 'Language, privacy, rest-mode, dark mode, text size, and reduced-motion settings are wired to the shared profile state, with added privacy-first trust messaging.',
    appView: AppView.SETTINGS,
  },
  {
    id: 'gentle-onboarding',
    name: 'Gentle Onboarding',
    navLabel: null,
    routeOrComponent: 'components/OnboardingModal.tsx + App.tsx',
    status: 'mvp-active',
    isMvp: true,
    state: 'visible',
    note: 'First-run onboarding uses four calm steps with skip options and stores completion locally on the device.',
  },
  {
    id: 'app-shell-footer',
    name: 'Care Footer',
    navLabel: null,
    routeOrComponent: 'App.tsx',
    status: 'mvp-active',
    isMvp: true,
    state: 'visible',
    note: 'Shared footer provides simple navigation shortcuts, contact access, and a care-focused community message.',
  },
  {
    id: 'appearance-theme-toggle',
    name: 'Appearance Theme Toggle',
    navLabel: null,
    routeOrComponent: 'components/Settings.tsx + App.tsx + index.html',
    status: 'mvp-active',
    isMvp: true,
    state: 'visible',
    note: 'Dark mode is wired to app state and persisted locally on the device.',
  },
  {
    id: 'settings-review-sections',
    name: 'Settings Review Actions',
    navLabel: null,
    routeOrComponent: 'components/Settings.tsx',
    status: 'needs-review',
    isMvp: false,
    state: 'visible',
    note: 'Notifications, text size, support links, and sign-out are still present but need production review.',
  },
  {
    id: 'assistant-chat',
    name: 'HealUp Assistant',
    navLabel: 'HealUp Assistant',
    routeOrComponent: 'AppView.CHAT -> components/AiAssistant.tsx',
    status: 'hidden-kept-for-later',
    isMvp: false,
    state: 'hidden',
    note: 'AI chat assistant remains implemented but is hidden from MVP navigation.',
    appView: AppView.CHAT,
  },
  {
    id: 'community-messaging',
    name: 'Community Messaging',
    navLabel: 'Messages',
    routeOrComponent: 'AppView.COMMUNITY -> components/Community.tsx',
    status: 'hidden-kept-for-later',
    isMvp: false,
    state: 'hidden',
    note: 'Friend messaging UI with empty contact and conversation states remains in code.',
    appView: AppView.COMMUNITY,
  },
  {
    id: 'discover-people-groups',
    name: 'Discover',
    navLabel: 'Discover',
    routeOrComponent: 'AppView.DISCOVER -> components/Discover.tsx',
    status: 'hidden-kept-for-later',
    isMvp: false,
    state: 'hidden',
    note: 'Discovery flow includes people matching and discoverable groups tabs with empty live-data-ready states.',
    appView: AppView.DISCOVER,
  },
  {
    id: 'groups-hub',
    name: 'Groups',
    navLabel: 'Groups',
    routeOrComponent: 'AppView.GROUPS -> components/Groups.tsx',
    status: 'hidden-kept-for-later',
    isMvp: false,
    state: 'hidden',
    note: 'Group browsing and create-group entry points are implemented with empty live-data-ready states.',
    appView: AppView.GROUPS,
  },
  {
    id: 'events-browser',
    name: 'Events',
    navLabel: 'Events',
    routeOrComponent: 'AppView.EVENTS -> components/Events.tsx',
    status: 'hidden-kept-for-later',
    isMvp: false,
    state: 'hidden',
    note: 'Event discovery, filters, and registration toggles are implemented with empty live-data-ready states.',
    appView: AppView.EVENTS,
  },
  {
    id: 'experts-directory',
    name: 'Expert Portal',
    navLabel: 'Expert Portal',
    routeOrComponent: 'AppView.EXPERTS -> components/Experts.tsx',
    status: 'hidden-kept-for-later',
    isMvp: false,
    state: 'hidden',
    note: 'Expert directory and partner CTA exist in UI with an empty live-data-ready directory state.',
    appView: AppView.EXPERTS,
  },
  {
    id: 'research-center',
    name: 'Research Center',
    navLabel: 'Research & News',
    routeOrComponent: 'AppView.RESEARCH -> components/Research.tsx',
    status: 'mvp-active',
    isMvp: true,
    state: 'visible',
    note: 'Research page includes journals, news, trials, and recruitment tabs and is restored in HealUp Connect.',
    appView: AppView.RESEARCH,
  },
  {
    id: 'soundscapes-breathing',
    name: 'Soundscapes & Breathing Support',
    navLabel: null,
    routeOrComponent: 'Not yet implemented',
    status: 'planned',
    isMvp: false,
    state: 'planned',
    note: 'Future scope may include soft soundscapes or guided breathing support if the product expands beyond the MVP.',
  },
];

export const getFeatureById = (id: string): FeatureDefinition | undefined => {
  return featureRegistry.find((feature) => feature.id === id);
};

export const getFeatureByView = (view: AppView): FeatureDefinition | undefined => {
  return featureRegistry.find((feature) => feature.appView === view);
};

export const isViewEnabled = (view: AppView): boolean => {
  const feature = getFeatureByView(view);
  return feature?.status === 'mvp-active';
};

const viewFallbackOrder: AppView[] = [
  AppView.DASHBOARD,
  AppView.TRACKER,
  AppView.LAB_RESULTS,
  AppView.SETTINGS,
  AppView.PROFILE,
];

export const getDefaultEnabledView = (): AppView => {
  return viewFallbackOrder.find(isViewEnabled) ?? AppView.DASHBOARD;
};

export const getSafeView = (view: AppView): AppView => {
  return isViewEnabled(view) ? view : getDefaultEnabledView();
};

export const visibleNavFeatures = featureRegistry.filter((feature) => feature.navLabel && feature.state === 'visible');
export const hiddenNavFeatures = featureRegistry.filter((feature) => feature.navLabel && feature.state === 'hidden');
