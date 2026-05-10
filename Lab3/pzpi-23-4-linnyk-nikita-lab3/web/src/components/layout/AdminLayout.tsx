import { NavLink, Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icons } from '../ui/icons';
import { useAuthStore } from '../../store/auth.store';
import { logoutDirect } from '../../api/client';
import type { Role } from '../../types';

// Which sections each role can see
const ROLE_SECTIONS: Record<string, string[]> = {
  admin:          ['dashboard', 'users', 'courses', 'lessons', 'exercises', 'languages', 'achievements', 'moderation', 'backup'],
  contentManager: ['courses', 'lessons', 'exercises', 'languages', 'achievements'],
  moderator:      ['moderation'],
};

// The first page the user lands on after reaching /admin
const ROLE_DEFAULT: Record<string, string> = {
  admin:          '/admin',
  contentManager: '/admin/courses',
  moderator:      '/admin/moderation',
};

// Role labels for the panel subtitle
const ROLE_LABEL: Record<string, string> = {
  admin:          'Admin Panel',
  contentManager: 'Content Manager',
  moderator:      'Moderator Panel',
};

const ADMIN_ROLES: Role[] = ['admin', 'contentManager', 'moderator'];

const ALL_NAV = [
  { to: '/admin',              key: 'admin.dashboard',    section: 'dashboard',    icon: Icons.Bolt,     end: true  },
  { to: '/admin/users',        key: 'admin.users',        section: 'users',        icon: Icons.Users,    end: false },
  { to: '/admin/courses',      key: 'admin.courses',      section: 'courses',      icon: Icons.Book,     end: false },
  { to: '/admin/lessons',      key: 'admin.lessons',      section: 'lessons',      icon: Icons.Practice, end: false },
  { to: '/admin/exercises',    key: 'admin.exercises',    section: 'exercises',    icon: Icons.Quiz,     end: false },
  { to: '/admin/languages',    key: 'admin.languages',    section: 'languages',    icon: Icons.Globe,    end: false },
  { to: '/admin/achievements', key: 'admin.achievements', section: 'achievements', icon: Icons.Trophy,   end: false },
  { to: '/admin/moderation',   key: 'admin.moderation',   section: 'moderation',   icon: Icons.Shield,   end: false },
  { to: '/admin/backup',       key: 'admin.backup',       section: 'backup',       icon: Icons.Database, end: false },
];

export function AdminLayout() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (!ADMIN_ROLES.includes(user?.role as Role)) return <Navigate to="/app/home" replace />;

  // Redirect non-admins away from the admin-only dashboard
  const defaultRoute = ROLE_DEFAULT[user?.role ?? ''] ?? '/admin';
  if (location.pathname === '/admin' && user?.role !== 'admin') {
    return <Navigate to={defaultRoute} replace />;
  }

  const allowed = ROLE_SECTIONS[user?.role ?? ''] ?? [];
  const visibleNav = ALL_NAV.filter(item => allowed.includes(item.section));
  const panelLabel = ROLE_LABEL[user?.role ?? ''] ?? 'Admin Panel';

  const handleLogout = async () => {
    await logoutDirect();
    logout();
    navigate('/auth/login');
  };

  const navItemStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
    borderRadius: 'var(--lb-radius-sm)',
    background: isActive ? 'var(--lb-panel-soft)' : 'transparent',
    color: isActive ? 'var(--lb-accent)' : 'var(--lb-text-muted)',
    fontSize: 13,
    fontWeight: 500,
    transition: 'var(--lb-trans)',
  });

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
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
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--lb-line)' }}>
          <div style={{ fontFamily: 'var(--lb-font-display)', fontSize: 20, fontWeight: 600, color: 'var(--lb-secondary)', letterSpacing: '-0.02em' }}>
            LangBang
          </div>
          <div style={{ fontSize: 11, color: 'var(--lb-text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 3 }}>
            {panelLabel}
          </div>
        </div>

        <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {visibleNav.map(({ to, icon: Icon, key, end }) => (
            <NavLink key={to} to={to} end={end} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <div style={navItemStyle(isActive)}>
                  <Icon size={15} stroke={isActive ? 'var(--lb-accent)' : 'var(--lb-text-muted)'} />
                  {t(key)}
                </div>
              )}
            </NavLink>
          ))}
        </div>

        <div style={{ padding: '12px', borderTop: '1px solid var(--lb-line)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <NavLink to="/app/home" style={{ textDecoration: 'none' }}>
            <div style={navItemStyle(false)}>
              <Icons.Home size={14} />
              {t('nav.home')}
            </div>
          </NavLink>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              background: 'transparent',
              border: '1px solid var(--lb-line)',
              borderRadius: 'var(--lb-radius-sm)',
              color: 'var(--lb-text-muted)',
              fontSize: 13,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <Icons.Logout size={14} />
            {t('nav.logout')}
          </button>
        </div>
      </nav>

      <main style={{ flex: 1, overflow: 'auto', padding: '32px 28px', background: 'var(--lb-bg)' }}>
        <Outlet />
      </main>
    </div>
  );
}
