import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Select } from '../components/ui';
import { languagesApi, usersApi } from '../api/endpoints';
import { useAuthStore } from '../store/auth.store';

const DAILY_GOALS = [5, 10, 15, 20, 30];

export function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, user, setUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [nativeLanguageId, setNativeLanguageId] = useState('');
  const [dailyGoal, setDailyGoal] = useState('10');
  const [loading, setLoading] = useState(false);

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: () => languagesApi.getAll().then(r => r.data.languages),
  });

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (user?.nativeLanguageId) return <Navigate to="/app/home" replace />;

  const handleFinish = async () => {
    if (!nativeLanguageId) return;
    setLoading(true);
    try {
      await usersApi.completeOnboarding({
        nativeLanguageId: Number(nativeLanguageId),
        dailyGoalExercises: Number(dailyGoal),
      });
      const meRes = await usersApi.getMe();
      setUser(meRes.data.user);
      navigate('/app/home');
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--lb-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--lb-font-display)', fontSize: 28, fontWeight: 600, color: 'var(--lb-accent)', letterSpacing: '-0.02em' }}>
            LangBang
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
          {[1, 2].map(s => (
            <div
              key={s}
              style={{
                width: 32,
                height: 4,
                borderRadius: 2,
                background: s <= step ? 'var(--lb-accent)' : 'var(--lb-panel-soft)',
                transition: 'background var(--lb-trans)',
              }}
            />
          ))}
        </div>

        <Card>
          {step === 1 && (
            <>
              <h2 className="lb-h2" style={{ marginBottom: 8 }}>{t('onboarding.title')}</h2>
              <p style={{ fontSize: 13, color: 'var(--lb-text-muted)', margin: '0 0 24px' }}>
                {t('onboarding.subtitle')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Select
                  label={t('onboarding.nativeLanguage')}
                  value={nativeLanguageId}
                  onChange={e => setNativeLanguageId(e.target.value)}
                  options={[
                    { value: '', label: '—' },
                    ...languages.map(l => ({ value: String(l.id), label: l.name })),
                  ]}
                />
                <Button
                  size="lg"
                  onClick={() => setStep(2)}
                  disabled={!nativeLanguageId}
                >
                  {t('onboarding.continue')}
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="lb-h2" style={{ marginBottom: 8 }}>Set your goal</h2>
              <p style={{ fontSize: 13, color: 'var(--lb-text-muted)', margin: '0 0 24px' }}>
                How many exercises per day do you want to complete?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {DAILY_GOALS.map(g => (
                    <button
                      key={g}
                      onClick={() => setDailyGoal(String(g))}
                      style={{
                        padding: '14px 8px',
                        borderRadius: 'var(--lb-radius-lg)',
                        border: `1px solid ${dailyGoal === String(g) ? 'var(--lb-accent)' : 'var(--lb-line)'}`,
                        background: dailyGoal === String(g) ? 'var(--lb-accent-tint)' : 'var(--lb-panel-soft)',
                        color: dailyGoal === String(g) ? 'var(--lb-accent)' : 'var(--lb-text)',
                        fontFamily: 'var(--lb-font-mono)',
                        fontSize: 16,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'var(--lb-trans)',
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button variant="ghost" size="lg" onClick={() => setStep(1)} style={{ flex: 1 }}>
                    {t('common.back')}
                  </Button>
                  <Button size="lg" onClick={handleFinish} disabled={loading} style={{ flex: 2 }}>
                    {loading ? t('common.loading') : t('onboarding.finish')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
