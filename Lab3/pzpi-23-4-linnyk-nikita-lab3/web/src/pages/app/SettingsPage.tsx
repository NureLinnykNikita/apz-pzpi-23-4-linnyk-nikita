import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { usersApi, languagesApi } from '../../api/endpoints';
import { setTimezone, getUserTimezone, COMMON_TIMEZONES } from '../../i18n/locale';
import type { QueryClient } from '@tanstack/react-query';
import type { UserProfile } from '../../types';
import { logoutDirect } from '../../api/client';
import { setLanguage } from '../../i18n';
import { getTheme, setTheme, type Theme } from '../../theme/theme';
import { Card, Button, Input, Toggle, Select } from '../../components/ui';
import { Icons } from '../../components/ui/icons';

type Section = 'profile' | 'languages' | 'notifications' | 'appearance' | 'account';

const SECTIONS: { id: Section; key: string; icon: typeof Icons.User }[] = [
  { id: 'profile', key: 'settings.profile', icon: Icons.User },
  { id: 'languages', key: 'settings.languages', icon: Icons.Globe },
  { id: 'notifications', key: 'settings.notifications', icon: Icons.Bolt },
  { id: 'appearance', key: 'settings.appearance', icon: Icons.Spark },
  { id: 'account', key: 'settings.account', icon: Icons.Shield },
];

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuthStore();
  const qc = useQueryClient();
  const [section, setSection] = useState<Section>('profile');
  const [saved, setSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [dailyGoal, setDailyGoal] = useState(String(user?.dailyGoalExercises || 10));
  const [localTz, setLocalTz] = useState(getUserTimezone);
  const [theme, setThemeState] = useState<Theme>(getTheme);
  const [notifEnabled, setNotifEnabled] = useState(user?.notificationsEnabled ?? true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => usersApi.getMySettings().then(r => r.data.settings),
  });

  const updateMutation = useMutation({
    mutationFn: (data: object) => usersApi.updateMe(data as Parameters<typeof usersApi.updateMe>[0]),
    onSuccess: (res) => {
      setUser(res.data.user);
      setProfileError(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setProfileError(msg || 'Failed to save profile.');
    },
  });

  const settingsMutation = useMutation({
    mutationFn: (data: object) => usersApi.updateMySettings(data as Parameters<typeof usersApi.updateMySettings>[0]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  useEffect(() => {
    if (settings?.timezone) setLocalTz(settings.timezone);
  }, [settings?.timezone]);

  const changePasswordMutation = useMutation({
    mutationFn: () => usersApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setPasswordError(null);
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordSaved(false), 3000);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setPasswordError(msg || 'Failed to change password.');
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => usersApi.deleteMe(),
    onSuccess: () => {
      // Account is gone — skip server logout (would 404), just clear local state
      logout();
      qc.clear();
      navigate('/auth/login');
    },
  });

  const handleLogout = async () => {
    await logoutDirect();
    logout();
    navigate('/auth/login');
  };

  const handleChangeLang = (lang: 'uk' | 'en') => {
    setLanguage(lang);
  };

  const handleChangeTheme = (t: Theme) => {
    setTheme(t);
    setThemeState(t);
  };

  const SavedBanner = () => (
    <div style={{ padding: '8px 12px', background: 'rgba(168,196,162,0.15)', border: '1px solid var(--lb-success)', borderRadius: 'var(--lb-radius-sm)', color: 'var(--lb-success)', fontSize: 13 }}>
      {t('settings.saved')}
    </div>
  );

  const Row = ({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--lb-line)' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--lb-text-muted)', marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lb-section-gap)', maxWidth: 800, animation: 'fadeIn 0.2s ease' }}>
      <h1 className="lb-h1">{t('settings.title')}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'var(--lb-section-gap)' }}>
        {/* Section nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SECTIONS.map(({ id, key, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 'var(--lb-radius-sm)',
                background: section === id ? 'var(--lb-panel-soft)' : 'transparent',
                border: 'none',
                color: section === id ? 'var(--lb-accent)' : 'var(--lb-text-muted)',
                fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                transition: 'var(--lb-trans)',
              }}
            >
              <Icon size={15} stroke={section === id ? 'var(--lb-accent)' : 'var(--lb-text-muted)'} />
              {t(key)}
            </button>
          ))}
        </div>

        {/* Content */}
        <Card>
          {section === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {profileError && (
                <div style={{ padding: '8px 12px', background: 'rgba(215,114,96,0.12)', border: '1px solid var(--lb-danger)', borderRadius: 'var(--lb-radius-sm)', color: 'var(--lb-danger)', fontSize: 13 }}>
                  {profileError}
                </div>
              )}
              <Input label={t('settings.username')} value={username} onChange={e => { setUsername(e.target.value); setProfileError(null); }} />
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--lb-text-muted)', display: 'block', marginBottom: 6 }}>{t('settings.bio')}</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={3}
                  style={{ width: '100%', background: 'var(--lb-panel)', border: '1px solid var(--lb-line)', borderRadius: 'var(--lb-radius-sm)', color: 'var(--lb-text)', fontFamily: 'var(--lb-font-sans)', fontSize: 14, padding: '10px 14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
              <Button onClick={() => updateMutation.mutate({ username, bio })} disabled={updateMutation.isPending}>
                {t('settings.save')}
              </Button>
              {saved && <SavedBanner />}
            </div>
          )}

          {section === 'notifications' && (
            <div>
              <Row label={t('settings.dailyReminder')} sub="Receive a reminder to practice every day">
                <Toggle value={notifEnabled} onChange={v => { setNotifEnabled(v); settingsMutation.mutate({ notificationsEnabled: v, dailyGoalExercises: Number(dailyGoal) }); }} />
              </Row>
              <Row label={t('settings.dailyGoal')} sub={t('settings.dailyGoalDesc')}>
                <Select
                  value={dailyGoal}
                  onChange={e => setDailyGoal(e.target.value)}
                  options={[5, 10, 15, 20, 30].map(v => ({ value: String(v), label: `${v} ${t('settings.exercises')}` }))}
                  style={{ width: 120 }}
                />
              </Row>
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Button onClick={() => settingsMutation.mutate({ notificationsEnabled: notifEnabled, dailyGoalExercises: Number(dailyGoal) })} disabled={settingsMutation.isPending}>
                  {t('settings.save')}
                </Button>
                {saved && <SavedBanner />}
              </div>
            </div>
          )}

          {section === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Theme */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>{t('settings.theme')}</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {(['dark', 'light'] as Theme[]).map(th => (
                    <button
                      key={th}
                      onClick={() => handleChangeTheme(th)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '12px 24px',
                        borderRadius: 'var(--lb-radius-lg)',
                        border: `1px solid ${theme === th ? 'var(--lb-accent)' : 'var(--lb-line)'}`,
                        background: theme === th ? 'var(--lb-accent-tint)' : 'var(--lb-panel-soft)',
                        color: theme === th ? 'var(--lb-accent)' : 'var(--lb-text-muted)',
                        fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'var(--lb-trans)',
                      }}
                    >
                      {th === 'dark' ? <Icons.Moon size={15} stroke="currentColor" /> : <Icons.Sun size={15} stroke="currentColor" />}
                      {t(th === 'dark' ? 'settings.themeDark' : 'settings.themeLight')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interface language */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>{t('settings.interfaceLanguage')}</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {(['uk', 'en'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => handleChangeLang(lang)}
                      style={{
                        padding: '12px 24px',
                        borderRadius: 'var(--lb-radius-lg)',
                        border: `1px solid ${i18n.language === lang ? 'var(--lb-accent)' : 'var(--lb-line)'}`,
                        background: i18n.language === lang ? 'var(--lb-accent-tint)' : 'var(--lb-panel-soft)',
                        color: i18n.language === lang ? 'var(--lb-accent)' : 'var(--lb-text-muted)',
                        fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'var(--lb-trans)',
                      }}
                    >
                      {lang === 'uk' ? t('settings.ukrainian') : t('settings.english')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timezone */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{t('settings.timezone')}</div>
                <div style={{ fontSize: 12, color: 'var(--lb-text-muted)', marginBottom: 12 }}>{t('settings.timezoneDesc')}</div>
                <Select
                  value={localTz}
                  onChange={e => {
                    const tz = e.target.value;
                    setLocalTz(tz);
                    setTimezone(tz);
                    settingsMutation.mutate({ timezone: tz });
                  }}
                  options={COMMON_TIMEZONES}
                  style={{ maxWidth: 360 }}
                />
                {settingsMutation.isPending && (
                  <div style={{ fontSize: 12, color: 'var(--lb-text-muted)', marginTop: 6 }}>{t('common.loading')}</div>
                )}
                {saved && !settingsMutation.isPending && <div style={{ marginTop: 6 }}><SavedBanner /></div>}
              </div>

              {/* Locale preview */}
              <LocalePreview lang={i18n.language} tz={localTz} t={t} />
            </div>
          )}

          {section === 'account' && (
            <div>
              <div style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>{t('settings.changePassword')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                {passwordError && (
                  <div style={{ padding: '8px 12px', background: 'rgba(215,114,96,0.12)', border: '1px solid var(--lb-danger)', borderRadius: 'var(--lb-radius-sm)', color: 'var(--lb-danger)', fontSize: 13 }}>
                    {passwordError}
                  </div>
                )}
                <Input
                  label={t('settings.currentPassword')}
                  type={showCurrentPwd ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => { setCurrentPassword(e.target.value); setPasswordError(null); }}
                  endAdornment={
                    <button type="button" onClick={() => setShowCurrentPwd(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      {showCurrentPwd ? <Icons.EyeOff size={16} stroke="var(--lb-text-muted)" /> : <Icons.Eye size={16} stroke="var(--lb-text-muted)" />}
                    </button>
                  }
                />
                <Input
                  label={t('settings.newPassword')}
                  type={showNewPwd ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setPasswordError(null); }}
                  endAdornment={
                    <button type="button" onClick={() => setShowNewPwd(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      {showNewPwd ? <Icons.EyeOff size={16} stroke="var(--lb-text-muted)" /> : <Icons.Eye size={16} stroke="var(--lb-text-muted)" />}
                    </button>
                  }
                />
                <Button
                  onClick={() => changePasswordMutation.mutate()}
                  disabled={!currentPassword || newPassword.length < 6 || changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? t('common.loading') : t('settings.save')}
                </Button>
                {passwordSaved && (
                  <div style={{ padding: '8px 12px', background: 'rgba(168,196,162,0.15)', border: '1px solid var(--lb-success)', borderRadius: 'var(--lb-radius-sm)', color: 'var(--lb-success)', fontSize: 13 }}>
                    {t('settings.saved')}
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--lb-line)', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Button variant="ghost" onClick={handleLogout} style={{ justifyContent: 'flex-start' }}>
                  <Icons.Logout size={16} />
                  {t('settings.account')} — {t('auth.logout')}
                </Button>
                {!deleteConfirmOpen ? (
                  <Button variant="danger" onClick={() => setDeleteConfirmOpen(true)}>
                    {t('settings.deleteAccount')}
                  </Button>
                ) : (
                  <div style={{ padding: 16, borderRadius: 'var(--lb-radius-lg)', border: '1px solid var(--lb-danger)', background: 'rgba(215,114,96,0.08)' }}>
                    <div style={{ fontSize: 13, marginBottom: 14 }}>{t('settings.deleteConfirm')}</div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmOpen(false)}>{t('admin.no')}</Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteAccountMutation.mutate()}
                        disabled={deleteAccountMutation.isPending}
                      >
                        {deleteAccountMutation.isPending ? t('common.loading') : t('admin.yes')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {section === 'languages' && (
            <NativeLanguageSection user={user} setUser={setUser} qc={qc} t={t} />
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── Locale Preview ──────────────────────────────────────────────────────────

import { getLangLocale } from '../../i18n/locale';

function LocalePreview({ lang, tz, t }: { lang: string; tz: string; t: (k: string) => string }) {
  const now = new Date();
  const locale = getLangLocale(lang);

  const dateStr = new Intl.DateTimeFormat(locale, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz,
  }).format(now);

  const timeStr = new Intl.DateTimeFormat(locale, {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: tz,
  }).format(now);

  return (
    <div style={{ padding: '12px 16px', background: 'var(--lb-panel-soft)', borderRadius: 'var(--lb-radius-sm)', fontSize: 13 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--lb-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>{t('settings.localePreview')}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--lb-text-muted)' }}>{t('settings.previewDate')}</span>
          <span style={{ fontFamily: 'var(--lb-font-mono)', fontSize: 12 }}>{dateStr}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--lb-text-muted)' }}>{t('settings.previewTime')}</span>
          <span style={{ fontFamily: 'var(--lb-font-mono)', fontSize: 12 }}>{timeStr}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Native Language Section ─────────────────────────────────────────────────

function NativeLanguageSection({
  user,
  setUser,
  qc,
  t,
}: {
  user: UserProfile | null;
  setUser: (u: UserProfile) => void;
  qc: QueryClient;
  t: (key: string) => string;
}) {
  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: () => languagesApi.getAll().then(r => r.data.languages),
  });

  const [saved, setSaved] = useState(false);

  const mutation = useMutation({
    mutationFn: (nativeLanguageId: number) => usersApi.updateMe({ nativeLanguageId }),
    onSuccess: res => {
      setUser(res.data.user);
      qc.invalidateQueries({ queryKey: ['me'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Description */}
      <div style={{ padding: '12px 16px', background: 'var(--lb-panel-soft)', borderRadius: 'var(--lb-radius-sm)', fontSize: 13, color: 'var(--lb-text-muted)', lineHeight: 1.6 }}>
        <div style={{ fontWeight: 600, color: 'var(--lb-text)', marginBottom: 4 }}>{t('settings.nativeLanguageTitle')}</div>
        <p style={{ margin: '0 0 6px' }}>{t('settings.nativeLanguageDesc')}</p>
        <p style={{ margin: 0, fontSize: 12 }}>⚠ {t('settings.nativeLanguageNote')}</p>
      </div>

      {/* Language grid */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--lb-text-muted)', marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {t('settings.nativeLanguage')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
          {languages.map(lang => {
            const isSelected = user?.nativeLanguageId === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => !isSelected && mutation.mutate(lang.id)}
                disabled={mutation.isPending}
                style={{
                  padding: '14px 12px',
                  borderRadius: 'var(--lb-radius-lg)',
                  border: `2px solid ${isSelected ? 'var(--lb-accent)' : 'var(--lb-line)'}`,
                  background: isSelected ? 'var(--lb-accent-tint)' : 'var(--lb-panel-soft)',
                  color: isSelected ? 'var(--lb-accent)' : 'var(--lb-text-muted)',
                  fontSize: 13,
                  fontWeight: isSelected ? 700 : 500,
                  cursor: isSelected ? 'default' : 'pointer',
                  transition: 'var(--lb-trans)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span style={{ fontFamily: 'var(--lb-font-mono)', fontSize: 11, letterSpacing: '0.08em', opacity: 0.7 }}>{lang.code.toUpperCase()}</span>
                <span>{lang.name}</span>
                {isSelected && <Icons.Check size={14} stroke="var(--lb-accent)" />}
              </button>
            );
          })}
        </div>
      </div>

      {!user?.nativeLanguageId && (
        <p style={{ fontSize: 12, color: 'var(--lb-text-muted)', margin: 0 }}>
          {t('settings.nativeLanguageNotSet')}
        </p>
      )}

      {saved && (
        <div style={{ padding: '8px 12px', background: 'rgba(168,196,162,0.15)', border: '1px solid var(--lb-success)', borderRadius: 'var(--lb-radius-sm)', color: 'var(--lb-success)', fontSize: 13 }}>
          {t('settings.saved')}
        </div>
      )}
    </div>
  );
}
