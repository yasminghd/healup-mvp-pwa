// services/notifications.ts
// In-app notification inbox + local daily reminder scheduler.

const STORAGE_KEY = 'healup-notifications';
const REMINDER_ENABLED_KEY = 'healup-reminder-enabled';
const REMINDER_TIME_KEY = 'healup-reminder-time';
const REMINDER_SYSTEM_KEY = 'healup-reminder-system';
const MAX_NOTIFICATIONS = 50;

export type NotificationIcon = 'bell' | 'leaf' | 'heart' | 'check' | 'shield';

export interface AppNotification {
  id: string;
  title: string;
  body?: string;
  createdAt: number;
  read: boolean;
  icon?: NotificationIcon;
}

type Listener = () => void;
const listeners = new Set<Listener>();

function readAll(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: AppNotification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_NOTIFICATIONS)));
  listeners.forEach((l) => l());
}

export function getNotifications(): AppNotification[] {
  return readAll();
}

export function getUnreadCount(): number {
  return readAll().filter((n) => !n.read).length;
}

export function addNotification(input: {
  title: string;
  body?: string;
  icon?: NotificationIcon;
}): AppNotification {
  const item: AppNotification = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title,
    body: input.body,
    icon: input.icon ?? 'bell',
    createdAt: Date.now(),
    read: false,
  };
  const all = readAll();
  writeAll([item, ...all]);
  return item;
}

export function markAsRead(id: string) {
  const all = readAll();
  const next = all.map((n) => (n.id === id ? { ...n, read: true } : n));
  writeAll(next);
}

export function markAllAsRead() {
  const all = readAll();
  if (all.every((n) => n.read)) return;
  writeAll(all.map((n) => ({ ...n, read: true })));
}

export function clearAll() {
  writeAll([]);
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// -------------------------------------------------------------------------
// Reminder settings
// -------------------------------------------------------------------------
export interface ReminderSettings {
  enabled: boolean;
  time: string;
  showAsSystem: boolean;
}

const DEFAULT_REMINDER_TIME = '20:00';

export function getReminderSettings(): ReminderSettings {
  return {
    enabled: localStorage.getItem(REMINDER_ENABLED_KEY) === 'true',
    time: localStorage.getItem(REMINDER_TIME_KEY) || DEFAULT_REMINDER_TIME,
    showAsSystem: localStorage.getItem(REMINDER_SYSTEM_KEY) === 'true',
  };
}

export function setReminderSettings(next: Partial<ReminderSettings>) {
  const current = getReminderSettings();
  const merged = { ...current, ...next };
  localStorage.setItem(REMINDER_ENABLED_KEY, String(merged.enabled));
  localStorage.setItem(REMINDER_TIME_KEY, merged.time);
  localStorage.setItem(REMINDER_SYSTEM_KEY, String(merged.showAsSystem));
  scheduleNextReminder();
}

// -------------------------------------------------------------------------
// Browser Notification API
// -------------------------------------------------------------------------
export function getBrowserPermission(): NotificationPermission | 'unsupported' {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
}

export async function requestBrowserPermission(): Promise<NotificationPermission> {
  if (typeof Notification === 'undefined') return 'denied';
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission;
  }
  return Notification.requestPermission();
}

export function showBrowserNotification(title: string, body?: string) {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon: '/icon-192.png' });
  } catch (err) {
    console.warn('Failed to show browser notification:', err);
  }
}

// -------------------------------------------------------------------------
// Reminder scheduler (in-tab)
// -------------------------------------------------------------------------
let reminderTimer: number | null = null;
const FIRED_DATES_KEY = 'healup-reminder-fired-dates';

function localDateKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function hasFiredToday(timeStr: string): boolean {
  try {
    const raw = localStorage.getItem(FIRED_DATES_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    return map[localDateKey()] === timeStr;
  } catch {
    return false;
  }
}

function markFiredToday(timeStr: string) {
  try {
    const raw = localStorage.getItem(FIRED_DATES_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[localDateKey()] = timeStr;
    const cutoff = Date.now() - 7 * 24 * 3600 * 1000;
    for (const key of Object.keys(map)) {
      const d = new Date(key + 'T00:00:00');
      if (d.getTime() < cutoff) delete map[key];
    }
    localStorage.setItem(FIRED_DATES_KEY, JSON.stringify(map));
  } catch (err) {
    console.warn('Failed to record fired reminder:', err);
  }
}

function computeNextReminderMs(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  const now = new Date();
  const next = new Date();
  next.setHours(h, m, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime() - now.getTime();
}

function fireDailyReminder(timeStr: string) {
  if (hasFiredToday(timeStr)) {
    scheduleNextReminder();
    return;
  }
  markFiredToday(timeStr);
  addNotification({
    title: 'Daily check-in',
    body: 'How are you feeling today? Take a moment to log your symptoms.',
    icon: 'leaf',
  });
  const settings = getReminderSettings();
  if (settings.showAsSystem) {
    showBrowserNotification(
      'HealUp daily check-in',
      'How are you feeling today?'
    );
  }
  scheduleNextReminder();
}

function scheduleNextReminder() {
  if (reminderTimer != null) {
    clearTimeout(reminderTimer);
    reminderTimer = null;
  }
  const settings = getReminderSettings();
  if (!settings.enabled) return;
  const ms = computeNextReminderMs(settings.time);
  reminderTimer = window.setTimeout(() => fireDailyReminder(settings.time), ms);
}

export function startReminderScheduler() {
  scheduleNextReminder();
}

export function fireTestNotification() {
  addNotification({
    title: 'Test notification',
    body: 'If you can see this, the in-app inbox is working.',
    icon: 'bell',
  });
  const settings = getReminderSettings();
  if (settings.showAsSystem) {
    showBrowserNotification('HealUp test', 'System notifications are working.');
  }
}
