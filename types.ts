

export enum Severity {
  NONE = 0,
  MILD = 1,
  MODERATE = 2,
  SEVERE = 3,
  EXTREME = 4
}

export interface SymptomLog {
  id: string;
  date: string;
  fatigue: number;
  dryEyes: number;
  dryMouth: number;
  jointPain: number;
  additionalSymptoms?: AdditionalSymptomEntry[];
  notes: string;
}

export interface AdditionalSymptomEntry {
  id: string;
  name: string;
  severity: number;
  source: 'suggested' | 'custom';
}

export interface SymptomEntry {
  id: string;
  name: string;
  severity: number;
  source: 'suggested' | 'custom';
}

export interface QuantifiableEntry {
  id: string;
  name: string;
  value: number;
  unit: string;
  max: number;
  source: 'suggested' | 'custom';
}

export interface TrackedSymptomDefinition {
  id: string;
  label: string;
  helper: string;
  iconKey: string;
  source: 'suggested' | 'custom';
  suggestedLabel?: string;
}

export interface TrackedQuantifiableMetricDefinition {
  id: string;
  label: string;
  helper: string;
  unit: string;
  max: number;
  min: number;
  iconKey: string;
  source: 'suggested' | 'custom';
  suggestedLabel?: string;
}

export interface LifestyleLog {
  sleepHours: number;
  stressLevel: number; // 1-10
  waterIntake: number; // glasses
  activityLevel: 'Sedentary' | 'Light' | 'Moderate' | 'Active';
}

export interface DailyRecord extends SymptomLog, LifestyleLog {
  symptomEntries?: SymptomEntry[];
  quantifiableEntries?: QuantifiableEntry[];
  trackedSymptoms?: TrackedSymptomDefinition[];
  trackedQuantifiableMetrics?: TrackedQuantifiableMetricDefinition[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model'; // 'model' in this context can also mean 'friend'
  text: string;
  timestamp: Date;
  isThinking?: boolean;
  // For Community Chat
  senderId?: string;
  translatedText?: string;
  originalLanguage?: string;
}

export type UserRole = 'Patient' | 'Caregiver';

export interface Friend {
  id: string;
  name: string;
  avatarUrl: string;
  language: string; // e.g., 'Spanish', 'Japanese'
  status: 'online' | 'offline' | 'busy';
  bio: string;
  role?: UserRole;
  condition?: string; // Helpful for discover matching
  // Added properties for Discovery functionality
  age?: string;
  gender?: string;
  location?: string;
  interests?: string[];
  matchScore?: number;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  role: 'Member' | 'Admin' | 'Moderator';
  imageUrl: string;
  lastActive: string;
}

export enum AppView {
  DASHBOARD = 'dashboard',
  TRACKER = 'tracker',
  INSIGHTS = 'insights',
  PAIN_PULSE = 'pain_pulse',
  EXPERTS = 'experts',
  COMMUNITY = 'community',
  CHAT = 'chat',
  PROFILE = 'profile',
  LAB_RESULTS = 'lab_results',
  EVENTS = 'events',
  GROUPS = 'groups',
  DISCOVER = 'discover',
  RESEARCH = 'research',
  SETTINGS = 'settings'
}

export interface LabResult {
  id: string;
  date: string;
  testName: string;
  value: number;
  unit: string;
  category: 'Blood' | 'Urine' | 'Other';
  notes: string;
}

export interface ExpertProfile {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  imageUrl: string;
  available: boolean;
}

export interface UserPrivacySettings {
  showAge: boolean;
  showLocation: boolean;
  showGender: boolean;
}

export interface UserProfile {
  name: string;
  username: string;
  role: UserRole;
  condition: string;
  avatarUrl: string;
  bio: string;
  interests: string[];
  age: string;
  location: string;
  gender: string;
  language?: string;
  themeMode?: 'light' | 'dark';
  restMode?: boolean;
  textSize?: 'comfortable' | 'large' | 'extra-large';
  reducedMotion?: boolean;
  reportLanguage?: string;
  privacySettings: UserPrivacySettings;
}
