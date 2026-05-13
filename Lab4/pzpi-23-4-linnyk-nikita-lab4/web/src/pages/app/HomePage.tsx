import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { formatNumber, formatTodayLong, getCurrentHour } from '../../i18n/locale';
import { useAuthStore } from '../../store/auth.store';
import { usersApi } from '../../api/endpoints';
import { Card, ProgressBar, Badge, Button, Spinner } from '../../components/ui';
import { Icons } from '../../components/ui/icons';

function getGreetingKey(): string {
  const h = getCurrentHour();
  if (h >= 5 && h < 12) return 'home.greeting_morning';
  if (h >= 12 && h < 17) return 'home.greeting_afternoon';
  if (h >= 17 && h < 22) return 'home.greeting_evening';
  return 'home.greeting_night';
}

export function HomePage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['me/stats'],
    queryFn: () => usersApi.getMyStats().then(r => r.data.userStats),
  });

  const { data: enrollments = [], isLoading: enrollLoading } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => usersApi.getMyEnrollments().then(r => r.data.enrollments),
  });

  const dateStr = formatTodayLong(i18n.language);
  const level = stats ? Math.floor(stats.totalPoints / 100) + 1 : 1;
  const dailyPct = stats ? Math.min(100, (stats.todayExercises / (stats.dailyGoal || 1)) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lb-section-gap)', maxWidth: 960, animation: 'fadeIn 0.2s ease' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ color: 'var(--lb-text-muted)', fontSize: 13, marginBottom: 4 }}>{dateStr}</div>
          <h1 className="lb-h1">{t(getGreetingKey(), { name: user?.username })}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {stats && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 'var(--lb-radius-pill)', background: 'var(--lb-panel)', border: '1px solid var(--lb-line)' }}>
              <Icons.Bolt size={13} stroke="var(--lb-accent)" />
              <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--lb-font-mono)', fontVariantNumeric: 'tabular-nums' }}>
                {formatNumber(stats.totalPoints, i18n.language)} {t('home.xp')}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Hero grid */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'var(--lb-section-gap)' }}>
        {/* Continue learning */}
        <Card>
          <div className="lb-eyebrow" style={{ marginBottom: 12 }}>{t('home.continuelearning')}</div>
          {enrollLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>
          ) : enrollments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {enrollments.slice(0, 2).map(e => (
                <div
                  key={e.courseId}
                  onClick={() => navigate('/app/practice')}
                  style={{ cursor: 'pointer', padding: '14px 16px', borderRadius: 'var(--lb-radius-lg)', background: 'var(--lb-panel-soft)', border: '1px solid var(--lb-line)', display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{e.course.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--lb-text-muted)', marginTop: 2 }}>{e.course.language.name} · {e.course.level}</div>
                    </div>
                    <Badge variant="accent">{Math.round(e.progress)}%</Badge>
                  </div>
                  <ProgressBar value={e.progress} />
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/practice')}>
                {t('practice.selectCourse')} <Icons.Arrow size={14} />
              </Button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 13, color: 'var(--lb-text-muted)', marginBottom: 16 }}>{t('home.noEnrollments')}</div>
              <Button size="sm" onClick={() => navigate('/app/practice')}>{t('home.browseCourses')}</Button>
            </div>
          )}
        </Card>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lb-section-gap)' }}>
          {statsLoading ? (
            <Card><div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div></Card>
          ) : stats ? (
            <>
              {/* Stat chips */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: t('home.xp'), value: formatNumber(stats.totalPoints, i18n.language), icon: Icons.Bolt, color: 'var(--lb-accent)' },
                  { label: t('profile.level'), value: `${t('home.level')} ${level}`, icon: Icons.Trophy, color: 'var(--lb-accent)' },
                  { label: t('profile.streak'), value: `${stats.streak} ${t('home.streak')}`, icon: Icons.Flame, color: 'var(--lb-secondary)' },
                  { label: t('profile.courses'), value: String(stats.coursesEnrolled), icon: Icons.Book, color: 'var(--lb-accent)' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} style={{ padding: '14px 16px', borderRadius: 'var(--lb-radius-lg)', background: 'var(--lb-panel)', border: '1px solid var(--lb-line)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <Icon size={14} stroke={color} />
                      <span style={{ fontSize: 11, color: 'var(--lb-text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--lb-font-mono)', fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Daily goal */}
              <Card style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div className="lb-eyebrow">{t('home.dailyGoal')}</div>
                  <span style={{ fontFamily: 'var(--lb-font-mono)', fontSize: 12, color: 'var(--lb-text-muted)' }}>
                    {stats.todayExercises} / {stats.dailyGoal} {t('home.exercises')}
                  </span>
                </div>
                <ProgressBar value={dailyPct} color={dailyPct >= 100 ? 'var(--lb-success)' : 'var(--lb-accent)'} height={8} />
              </Card>
            </>
          ) : null}
        </div>
      </section>

      {/* My languages */}
      {enrollments.length > 0 && (
        <section>
          <div className="lb-eyebrow" style={{ marginBottom: 14 }}>{t('home.myLanguages')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {enrollments.map(e => (
              <div
                key={e.courseId}
                onClick={() => navigate('/app/practice')}
                style={{
                  padding: '16px 18px',
                  borderRadius: 'var(--lb-radius-lg)',
                  background: 'var(--lb-panel)',
                  border: '1px solid var(--lb-line)',
                  cursor: 'pointer',
                  transition: 'var(--lb-trans)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{e.course.language.name}</span>
                  <Badge variant="muted">{e.course.level}</Badge>
                </div>
                <ProgressBar value={e.progress} height={4} />
                <div style={{ fontSize: 12, color: 'var(--lb-text-muted)' }}>{Math.round(e.progress)}% {t('practice.completed')}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AI tip banner */}
      <Card style={{ background: 'var(--lb-panel-soft)', display: 'flex', alignItems: 'flex-start', gap: 14, padding: 18 }}>
        <div style={{ width: 32, height: 32, borderRadius: 'var(--lb-radius-md)', background: 'var(--lb-accent-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icons.Spark size={16} stroke="var(--lb-accent)" />
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--lb-text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
            {t('home.aiTip')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--lb-text)', lineHeight: 1.5 }}>
            {i18n.language === 'uk'
              ? 'Продовжуйте практику щодня, щоб підтримувати серію. Навіть 5 хвилин на день мають значення.'
              : 'Keep practicing daily to maintain your streak. Even 5 minutes a day makes a difference.'}
          </div>
        </div>
      </Card>
    </div>
  );
}
