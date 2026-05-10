import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, Heart, Leaf, Shield, Trash2, X } from 'lucide-react';
import {
  AppNotification,
  NotificationIcon,
  clearAll,
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  subscribe,
} from '../services/notifications';

interface NotificationBellProps {
  className?: string;
  iconSize?: number;
  align?: 'left' | 'right';
}

const ICON_MAP: Record<NotificationIcon, React.ComponentType<{ size?: number; className?: string }>> = {
  bell: Bell,
  leaf: Leaf,
  heart: Heart,
  check: Check,
  shield: Shield,
};

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(ms).toLocaleDateString();
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  className = '',
  iconSize = 20,
  align = 'right',
}) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>(() => getNotifications());
  const [unread, setUnread] = useState<number>(() => getUnreadCount());
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refresh = () => {
      setItems(getNotifications());
      setUnread(getUnreadCount());
    };
    const unsubscribe = subscribe(refresh);
    refresh();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      markAllAsRead();
    }
  };

  return (
    <div ref={wrapperRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
        aria-expanded={open}
        className="relative rounded-full p-2 text-matcha-800 transition-colors hover:bg-matcha-50 focus:outline-none focus:ring-2 focus:ring-matcha-300"
      >
        <Bell size={iconSize} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-matcha-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-matcha-500" />
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-matcha-100 bg-white shadow-xl ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          role="dialog"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="font-semibold text-matcha-900">Notifications</h3>
            <div className="flex items-center gap-1">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => clearAll()}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
                  title="Clear all"
                >
                  <Trash2 size={14} /> Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
                aria-label="Close notifications"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-matcha-50 text-matcha-600">
                  <Bell size={20} />
                </div>
                <p className="text-sm font-medium text-gray-700">You're all caught up</p>
                <p className="mt-1 text-xs text-gray-500">
                  Daily reminders and app events will appear here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {items.map((n) => {
                  const Icon = ICON_MAP[n.icon ?? 'bell'] ?? Bell;
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => markAsRead(n.id)}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-matcha-50/40 ${
                          n.read ? '' : 'bg-matcha-50/30'
                        }`}
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-matcha-50 text-matcha-700">
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                          {n.body && (
                            <p className="mt-0.5 text-sm text-gray-600">{n.body}</p>
                          )}
                          <p className="mt-1 text-xs text-gray-400">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.read && (
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-matcha-500" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
