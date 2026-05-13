import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { formatDate, formatDateLong, formatNumber } from '../../i18n/locale';
import { useAuthStore } from '../../store/auth.store';
import { usersApi } from '../../api/endpoints';
import { Card, Button, Input, ProgressBar, Badge, Spinner, Modal } from '../../components/ui';
import { Icons, InitialAvatar } from '../../components/ui/icons';

export function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user, setUser } = useAuthStore();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['me/stats'],
    queryFn: () => usersApi.getMyStats().then(r => r.data.userStats),
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', user?.userId],
    queryFn: () => usersApi.getUserAchievements(user!.userId).then(r => r.data.userAchievements),
    enabled: !!user,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => usersApi.getMyEnrollments().then(r => r.data.enrollments),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { username: string; bio: string }) => usersApi.updateMe(data),
    onSuccess: (res) => {
      setUser(res.data.user);
      qc.invalidateQueries({ queryKey: ['me'] });
      setEditOpen(false);
    },
  });

  const level = stats ? Math.floor(stats.totalPoints / 100) + 1 : 1;
  const memberSince = user ? formatDateLong(user.createdAt, i18n.language) : '';

  if (statsLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}><Spinner size={32} /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lb-section-gap)', maxWidth: 700, animation: 'fadeIn 0.2s ease' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="lb-h1">{t('profile.title')}</h1>
        <Button variant="secondary" size="sm" onClick={() => { setUsername(user?.username || ''); setBio(user?.bio || ''); setEditOpen(true); }}>
          <Icons.Edit size={14} />
          {t('profile.editProfile')}
        </Button>
      </header>

      {/* Profile card */}
      <Card style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <InitialAvatar name={user?.username} size={64} />
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{user?.username}</div>
          <div style={{ fontSize: 13, color: 'var(--lb-text-muted)', marginTop: 2 }}>{user?.email}</div>
          {user?.bio && <div style={{ fontSize: 13, color: 'var(--lb-text-muted)', marginTop: 6 }}>{user.bio}</div>}
          <div style={{ fontSize: 12, color: 'var(--lb-text-muted)', marginTop: 6 }}>
            {t('profile.memberSince')} {memberSince}
          </div>
        </div>
      </Card>

      {/* Stats row */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: t('profile.xp'), value: formatNumber(stats.totalPoints, i18n.language), icon: Icons.Bolt, color: 'var(--lb-accent)' },
            { label: t('profile.level'), value: String(level), icon: Icons.Trophy, color: 'var(--lb-accent)' },
            { label: t('profile.streak'), value: `${stats.streak}d`, icon: Icons.Flame, color: 'var(--lb-secondary)' },
            { label: t('profile.courses'), value: String(stats.coursesEnrolled), icon: Icons.Book, color: 'var(--lb-accent)' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} style={{ textAlign: 'center', padding: '16px 12px' }}>
              <Icon size={20} stroke={color} style={{ margin: '0 auto 8px' }} />
              <div style={{ fontFamily: 'var(--lb-font-mono)', fontSize: 18, fontWeight: 700 }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--lb-text-muted)', marginTop: 4 }}>{label}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Skills */}
      {stats && (
        <Card>
          <div className="lb-eyebrow" style={{ marginBottom: 16 }}>{t('profile.stats')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: t('profile.exercisesDone'), value: stats.exercisesCompleted, max: Math.max(stats.exercisesCompleted, 100) },
              { label: t('profile.correctRate'), value: Math.round(stats.correctAnswersRate * 100), max: 100 },
            ].map(({ label, value, max }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span>{label}</span>
                  <span style={{ fontFamily: 'var(--lb-font-mono)', color: 'var(--lb-text-muted)' }}>{value}</span>
                </div>
                <ProgressBar value={value} max={max} height={6} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Languages */}
      {enrollments.length > 0 && (
        <Card>
          <div className="lb-eyebrow" style={{ marginBottom: 16 }}>{t('profile.languages')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {enrollments.map(e => (
              <div key={e.courseId} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{e.course.language.name}</span>
                    <Badge variant="muted">{e.course.level}</Badge>
                  </div>
                  <ProgressBar value={e.progress} height={4} />
                </div>
                <span style={{ fontFamily: 'var(--lb-font-mono)', fontSize: 12, color: 'var(--lb-text-muted)', flexShrink: 0 }}>
                  {Math.round(e.progress)}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Achievements */}
      <Card>
        <div className="lb-eyebrow" style={{ marginBottom: 16 }}>{t('profile.achievements')}</div>
        {achievements.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--lb-text-muted)', textAlign: 'center', padding: '16px 0' }}>{t('profile.noAchievements')}</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {achievements.map(({ achievement, earnedAt }) => (
              <div key={achievement.achievementId} style={{ padding: '14px 16px', borderRadius: 'var(--lb-radius-lg)', background: 'var(--lb-panel-soft)', border: '1px solid var(--lb-line)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Icons.Check size={20} stroke="var(--lb-success)" />
                <div style={{ fontSize: 13, fontWeight: 600 }}>{achievement.title}</div>
                <div style={{ fontSize: 11, color: 'var(--lb-text-muted)' }}>{achievement.description}</div>
                <div style={{ fontSize: 10, color: 'var(--lb-text-muted)', marginTop: 2 }}>
                  {formatDate(earnedAt, i18n.language)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Edit profile modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={t('profile.editProfile')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label={t('settings.username')} value={username} onChange={e => setUsername(e.target.value)} />
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--lb-text-muted)', display: 'block', marginBottom: 6 }}>{t('settings.bio')}</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              style={{ width: '100%', background: 'var(--lb-panel)', border: '1px solid var(--lb-line)', borderRadius: 'var(--lb-radius-sm)', color: 'var(--lb-text)', fontFamily: 'var(--lb-font-sans)', fontSize: 14, padding: '10px 14px', outline: 'none', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>{t('profile.cancel')}</Button>
            <Button onClick={() => updateMutation.mutate({ username, bio })} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t('common.loading') : t('profile.save')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
