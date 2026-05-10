import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../api/endpoints';
import { formatNumber } from '../../i18n/locale';
import { Card, Spinner } from '../../components/ui';
import { Icons } from '../../components/ui/icons';

export function AdminDashboard() {
  const { t, i18n } = useTranslation();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin/stats'],
    queryFn: () => adminApi.getStats().then(r => r.data),
  });

  const STAT_CARDS = [
    { key: 'admin.totalUsers', value: stats?.usersCount, icon: Icons.Users, color: 'var(--lb-accent)' },
    { key: 'admin.totalCourses', value: stats?.coursesCount, icon: Icons.Book, color: 'var(--lb-accent)' },
    { key: 'admin.exercisesToday', value: stats?.exercisesToday, icon: Icons.Practice, color: 'var(--lb-secondary)' },
    { key: 'admin.messagesTotal', value: stats?.messagesTotal, icon: Icons.Chat, color: 'var(--lb-info)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lb-section-gap)', animation: 'fadeIn 0.2s ease' }}>
      <h1 className="lb-h1">{t('admin.dashboard')}</h1>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={32} /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {STAT_CARDS.map(({ key, value, icon: Icon, color }) => (
            <Card key={key} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--lb-radius-md)', background: 'var(--lb-panel-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} stroke={color} />
                </div>
                <span className="lb-eyebrow">{t(key)}</span>
              </div>
              <div style={{ fontFamily: 'var(--lb-font-mono)', fontSize: 28, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {value !== undefined ? formatNumber(value, i18n.language) : '—'}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <div className="lb-eyebrow" style={{ marginBottom: 12 }}>Quick actions</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: t('admin.users'), to: '/admin/users' },
            { label: t('admin.courses'), to: '/admin/courses' },
            { label: t('admin.backup'), to: '/admin/backup' },
          ].map(({ label, to }) => (
            <a key={to} href={to} style={{ padding: '8px 16px', borderRadius: 'var(--lb-radius-sm)', background: 'var(--lb-panel-soft)', border: '1px solid var(--lb-line)', color: 'var(--lb-text)', fontSize: 13, fontWeight: 500 }}>
              {label}
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
