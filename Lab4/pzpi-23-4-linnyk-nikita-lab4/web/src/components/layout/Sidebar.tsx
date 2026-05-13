import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icons, InitialAvatar } from '../ui/icons';
import { useAuthStore } from '../../store/auth.store';
import { logoutDirect } from '../../api/client';
import type { Role } from '../../types';

const ADMIN_ROLES: Role[] = ['admin', 'contentManager', 'moderator'];

const adminLink = (role: Role | undefined) => {
  if (role === 'contentManager') return '/admin/courses';
  if (role === 'moderator') return '/admin/moderation';
  return '/admin';
};

const NAV_ITEMS = [
  { to: '/app/home', icon: Icons.Home, key: 'nav.home' },
  { to: '/app/practice', icon: Icons.Practice, key: 'nav.practice' },
  { to: '/app/leaderboard', icon: Icons.Trophy, key: 'nav.leaderboard' },
  { to: '/app/community', icon: Icons.Chat, key: 'nav.community' },
  { to: '/app/profile', icon: Icons.User, key: 'nav.profile' },
  { to: '/app/settings', icon: Icons.Settings, key: 'nav.settings' },
];

export function Sidebar() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutDirect();
    logout();
    navigate('/auth/login');
  };

  return (
    <nav
      style={{
        width: 220,
        minHeight: '100vh',
        background: 'var(--lb-panel)',
        borderRight: '1px solid var(--lb-line)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--lb-line)' }}>
        <div style={{ fontFamily: 'var(--lb-font-display)', fontSize: 20, fontWeight: 600, color: 'var(--lb-accent)', letterSpacing: '-0.02em' }}>
          LangBang
        </div>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(({ to, icon: Icon, key }) => (
          <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 'var(--lb-radius-sm)',
                  background: isActive ? 'var(--lb-panel-soft)' : 'transparent',
                  color: isActive ? 'var(--lb-accent)' : 'var(--lb-text-muted)',
                  fontSize: 14,
                  fontWeight: 500,
                  transition: 'var(--lb-trans)',
                }}
              >
                <Icon size={16} stroke={isActive ? 'var(--lb-accent)' : 'var(--lb-text-muted)'} />
                {t(key)}
              </div>
            )}
          </NavLink>
        ))}

        {ADMIN_ROLES.includes((user?.role ?? '') as Role) && (
          <NavLink to={adminLink(user?.role)} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 'var(--lb-radius-sm)',
                  background: isActive ? 'var(--lb-panel-soft)' : 'transparent',
                  color: isActive ? 'var(--lb-secondary)' : 'var(--lb-text-muted)',
                  fontSize: 14,
                  fontWeight: 500,
                  transition: 'var(--lb-trans)',
                }}
              >
                <Icons.Shield size={16} stroke={isActive ? 'var(--lb-secondary)' : 'var(--lb-text-muted)'} />
                {t('nav.admin')}
              </div>
            )}
          </NavLink>
        )}
      </div>

      {/* User + logout */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--lb-line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <InitialAvatar name={user?.username} size={32} />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--lb-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.username}
            </div>
            <div style={{ fontSize: 11, color: 'var(--lb-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            background: 'transparent',
            border: '1px solid var(--lb-line)',
            borderRadius: 'var(--lb-radius-sm)',
            color: 'var(--lb-text-muted)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'var(--lb-trans)',
          }}
        >
          <Icons.Logout size={14} />
          {t('nav.logout')}
        </button>
      </div>
    </nav>
  );
}
