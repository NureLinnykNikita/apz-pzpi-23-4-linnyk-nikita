import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { leaderboardApi } from '../../api/endpoints';
import { formatNumber } from '../../i18n/locale';
import { Card, Badge, Spinner } from '../../components/ui';
import { InitialAvatar } from '../../components/ui/icons';
import type { ExercisePeriod } from '../../types';

const PERIODS: { id: ExercisePeriod; key: string }[] = [
  { id: 'week', key: 'leaderboard.thisWeek' },
  { id: 'month', key: 'leaderboard.thisMonth' },
  { id: 'all', key: 'leaderboard.allTime' },
];

export function LeaderboardPage() {
  const { t, i18n } = useTranslation();
  const [period, setPeriod] = useState<ExercisePeriod>('week');

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () => leaderboardApi.get({ period, limit: 50 }).then(r => r.data.entries),
  });

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lb-section-gap)', maxWidth: 700, animation: 'fadeIn 0.2s ease' }}>
      <header>
        <h1 className="lb-h1">{t('leaderboard.title')}</h1>
      </header>

      {/* Period filter */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--lb-panel)', border: '1px solid var(--lb-line)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {PERIODS.map(p => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            style={{
              padding: '7px 16px',
              borderRadius: 8,
              border: 'none',
              background: period === p.id ? 'var(--lb-panel-soft)' : 'transparent',
              color: period === p.id ? 'var(--lb-accent)' : 'var(--lb-text-muted)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--lb-trans)',
            }}
          >
            {t(p.key)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={32} /></div>
      ) : (
        <>
          {/* Podium */}
          {top3.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, padding: '24px 0' }}>
              {[top3[1], top3[0], top3[2]].filter(Boolean).map((e, i) => {
                const heights = [100, 130, 80];
                const medals = ['', '1', '2', '3'];
                const rank = [2, 1, 3][i];
                return (
                  <div key={e.userId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <InitialAvatar name={e.username} size={rank === 1 ? 52 : 44} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: e.isCurrentUser ? 'var(--lb-accent)' : 'var(--lb-text)' }}>
                      {e.username}
                    </div>
                    <div style={{ fontFamily: 'var(--lb-font-mono)', fontSize: 12, color: 'var(--lb-text-muted)' }}>
                      {formatNumber(e.totalPoints, i18n.language)} XP
                    </div>
                    <div
                      style={{
                        width: 80,
                        height: heights[i],
                        background: rank === 1 ? 'var(--lb-accent-tint)' : 'var(--lb-panel)',
                        border: `1px solid ${rank === 1 ? 'var(--lb-accent)' : 'var(--lb-line)'}`,
                        borderRadius: 'var(--lb-radius-sm) var(--lb-radius-sm) 0 0',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        paddingTop: 8,
                        fontFamily: 'var(--lb-font-mono)',
                        fontSize: 18,
                        fontWeight: 700,
                        color: rank === 1 ? 'var(--lb-accent)' : 'var(--lb-text-muted)',
                      }}
                    >
                      {medals[rank]}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ranked list */}
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {rest.map((e, idx) => (
              <div
                key={e.userId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 20px',
                  borderBottom: idx < rest.length - 1 ? '1px solid var(--lb-line)' : 'none',
                  background: e.isCurrentUser ? 'var(--lb-panel-soft)' : 'transparent',
                }}
              >
                <span style={{ fontFamily: 'var(--lb-font-mono)', fontSize: 13, color: 'var(--lb-text-muted)', width: 28, textAlign: 'right' }}>
                  {e.rank}
                </span>
                <InitialAvatar name={e.username} size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: e.isCurrentUser ? 'var(--lb-accent)' : 'var(--lb-text)' }}>
                    {e.username}
                    {e.isCurrentUser && <Badge variant="accent" style={{ marginLeft: 8 }}>{t('leaderboard.you')}</Badge>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontFamily: 'var(--lb-font-mono)', fontSize: 12, color: 'var(--lb-secondary)' }}>
                    {e.streak}d
                  </div>
                  <div style={{ fontFamily: 'var(--lb-font-mono)', fontSize: 13, fontWeight: 600 }}>
                    {formatNumber(e.totalPoints, i18n.language)} XP
                  </div>
                </div>
              </div>
            ))}
            {entries.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--lb-text-muted)', fontSize: 13 }}>
                {t('admin.noData')}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
