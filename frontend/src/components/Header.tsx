import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';
import { hasAdminRole } from '../utils/auth';

type NotificationRecord = {
  id: number;
  user_id: number;
  actor_user_id: number;
  recipe_id: number;
  notification_type: 'favorite' | 'review';
  title: string;
  message: string;
  is_read: boolean;
  data: string;
};

type HeaderNavItem = {
  label: string;
  to: string;
};

type HeaderProps = {
  brand: string;
  activePath?: string;
  userName?: string;
  avatarUrl?: string;
};

const navItems: HeaderNavItem[] = [
  { label: 'Kryefaqja', to: '/' },
  { label: 'Receta', to: '/recipes' },
  { label: 'Rreth nesh', to: '/about' },
];

type ProfileResponse = {
  user?: {
    roles?: string[];
  };
};

export const Header: React.FC<HeaderProps> = ({
  brand,
  activePath = '/',
  userName = 'Profili im',
  avatarUrl,
}) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  const notificationPanelRef = useRef<HTMLDivElement>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const [userRoles, setUserRoles] = useState<string[]>([]);

  async function loadNotifications() {
    setNotificationsLoading(true);
    setNotificationsError('');

    try {
      const response = await apiFetch('/notifications/me?limit=6');
      const payload = response as { notifications?: NotificationRecord[]; unreadCount?: number };
      const list = Array.isArray(payload.notifications) ? payload.notifications : [];

      setNotifications(list);
      setUnreadCount(Number(payload.unreadCount ?? list.filter((notification) => !notification.is_read).length));
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotificationsError('Nuk u ngarkuan njoftimet.');
    } finally {
      setNotificationsLoading(false);
    }
  }

  async function markAllNotificationsAsRead() {
    try {
      const response = await apiFetch('/notifications/me/read', { method: 'PATCH' });
      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }

      setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      setNotificationsError('Nuk mund të shënohen njoftimet si të lexuara.');
    }
  }

  function toggleNotifications() {
    if (notificationsOpen) {
      setNotificationsOpen(false);
      return;
    }

    setNotificationsOpen(true);
    void loadNotifications();
  }

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setNotificationsOpen(false);
      setUserRoles([]);
      return;
    }

    void loadNotifications();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isMounted = true;

    async function loadUserRoles() {
      try {
        const response = (await apiFetch('/users/me/profile')) as ProfileResponse;
        const roles = Array.isArray(response?.user?.roles) ? response.user.roles : [];

        if (isMounted) {
          setUserRoles(roles);
        }
      } catch (error) {
        console.error('Failed to load current user roles:', error);
        if (isMounted) {
          setUserRoles([]);
        }
      }
    }

    void loadUserRoles();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const visibleNavItems = hasAdminRole(userRoles)
    ? [...navItems, { label: 'Admin dashboard', to: '/admin' }]
    : navItems;

  useEffect(() => {
    if (!notificationsOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (notificationPanelRef.current && !notificationPanelRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [notificationsOpen]);

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30">
      <div className="max-w-container-max-width mx-auto px-margin-desktop h-20 flex items-center justify-between gap-8">
        <div className="flex items-center gap-12">
          <Link to="/" className="font-headline-md text-primary tracking-tight cursor-pointer whitespace-nowrap">
            {brand}
          </Link>

          <nav className="hidden md:flex items-center gap-8" aria-label="Navigimi kryesor">
            {visibleNavItems.map((item) => {
              const isActive = item.to === activePath;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    isActive
                      ? 'font-label-md text-primary border-b-2 border-primary pb-1'
                      : 'font-label-md text-on-surface-variant hover:text-primary transition-colors'
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Search removed from header - moved to homepage */}

        <div className="flex items-center gap-6">
          {isAuthenticated && (
            <div className="relative" ref={notificationPanelRef}>
              <button
                type="button"
                className="relative rounded-full p-2 text-on-surface-variant transition-colors hover:text-primary cursor-pointer"
                aria-label="Njoftime"
                aria-expanded={notificationsOpen}
                aria-controls="notification-panel"
                onClick={toggleNotifications}
              >
                <span className="material-symbols-outlined text-[24px]">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white shadow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div
                  id="notification-panel"
                  className="absolute right-0 top-14 z-50 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-outline-variant/40 bg-surface shadow-2xl"
                >
                  <div className="flex items-center justify-between gap-4 border-b border-outline-variant/30 px-5 py-4">
                    <div>
                      <p className="font-headline-sm text-on-surface">Njoftime</p>
                      <p className="text-sm text-on-surface-variant">Përditësimet për recetat e tua</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-full px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
                      onClick={() => void markAllNotificationsAsRead()}
                      disabled={!notifications.length || notificationsLoading}
                    >
                      Shëno të gjitha si të lexuara
                    </button>
                  </div>

                  <div className="max-h-104 overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="px-5 py-8 text-center text-sm text-on-surface-variant">Duke ngarkuar njoftimet...</div>
                    ) : notificationsError ? (
                      <div className="px-5 py-8 text-center text-sm text-error">{notificationsError}</div>
                    ) : notifications.length === 0 ? (
                      <div className="px-5 py-8 text-center text-sm text-on-surface-variant">Nuk keni ende njoftime të reja.</div>
                    ) : (
                      <div className="divide-y divide-outline-variant/30">
                        {notifications.map((notification) => (
                          <Link
                            key={notification.id}
                            to={notification.recipe_id ? `/recipes/${notification.recipe_id}` : '/profile'}
                            className={`flex items-start gap-4 px-5 py-4 transition-colors hover:bg-primary/5 ${notification.is_read ? 'bg-surface' : 'bg-primary/5'}`}
                            onClick={() => setNotificationsOpen(false)}
                          >
                            <span
                              className={`mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${notification.notification_type === 'review' ? 'bg-secondary-container text-on-secondary-container' : 'bg-primary-container text-on-primary-container'}`}
                            >
                              <span className="material-symbols-outlined text-[20px]" style={!notification.is_read ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                                {notification.notification_type === 'review' ? 'rate_review' : 'favorite'}
                              </span>
                            </span>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-label-md text-on-surface">{notification.title}</p>
                                  <p className="mt-1 text-sm leading-6 text-on-surface-variant">{notification.message}</p>
                                </div>
                                {!notification.is_read && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />}
                              </div>
                              <p className="mt-2 text-xs text-on-surface-variant">
                                {new Date(notification.data).toLocaleString('sq-AL', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 pl-6 border-l border-outline-variant/50">
            {isAuthenticated ? (
              <Link to="/profile" className="flex items-center gap-3 cursor-pointer group">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors bg-primary/10 flex items-center justify-center text-primary">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined">person</span>
                  )}
                </div>
                <span className="font-label-md hidden lg:block group-hover:text-primary transition-colors">{userName}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="font-label-md text-on-surface hover:text-primary transition-colors px-3 py-2">
                  Hyr
                </Link>
                <Link to="/signup" className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-full font-label-md transition-colors shadow-sm">
                  Regjistrohu
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
