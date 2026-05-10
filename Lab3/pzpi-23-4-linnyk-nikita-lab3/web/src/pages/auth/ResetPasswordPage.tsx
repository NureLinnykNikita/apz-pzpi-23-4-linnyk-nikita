import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card, Input } from '../../components/ui';
import { authApi } from '../../api/endpoints';

type Step = 'request' | 'verify' | 'confirm' | 'done';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setError('');
    setLoading(true);
    try {
      await authApi.requestReset(email);
      setStep('verify');
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || t('common.error'));
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await authApi.verifyReset(email, code);
      setResetToken(res.data.resetToken);
      setStep('confirm');
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || t('common.error'));
    } finally { setLoading(false); }
  };

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    try {
      await authApi.confirmReset(resetToken, newPassword);
      setStep('done');
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || t('common.error'));
    } finally { setLoading(false); }
  };

  return (
    <Card>
      <h2 className="lb-h2" style={{ marginBottom: 8 }}>{t('auth.resetPassword')}</h2>

      {step === 'request' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--lb-text-muted)', margin: 0 }}>
            Enter your email and we'll send you a verification code.
          </p>
          <Input label={t('auth.email')} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          {error && <div style={{ fontSize: 13, color: 'var(--lb-danger)' }}>{error}</div>}
          <Button size="lg" onClick={handleRequest} disabled={loading || !email}>
            {loading ? t('common.loading') : t('auth.sendCode')}
          </Button>
        </div>
      )}

      {step === 'verify' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--lb-text-muted)', margin: 0 }}>
            Enter the code sent to <strong style={{ color: 'var(--lb-text)' }}>{email}</strong>.
          </p>
          <Input label={t('auth.resetCode')} value={code} onChange={e => setCode(e.target.value)} placeholder="123456" />
          {error && <div style={{ fontSize: 13, color: 'var(--lb-danger)' }}>{error}</div>}
          <Button size="lg" onClick={handleVerify} disabled={loading || !code}>
            {loading ? t('common.loading') : t('auth.verifyCode')}
          </Button>
        </div>
      )}

      {step === 'confirm' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>
          <Input label={t('auth.newPassword')} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
          {error && <div style={{ fontSize: 13, color: 'var(--lb-danger)' }}>{error}</div>}
          <Button size="lg" onClick={handleConfirm} disabled={loading || newPassword.length < 6}>
            {loading ? t('common.loading') : 'Set new password'}
          </Button>
        </div>
      )}

      {step === 'done' && (
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 14, color: 'var(--lb-success)', padding: '12px', background: 'rgba(168,196,162,0.1)', borderRadius: 'var(--lb-radius-sm)' }}>
            {t('auth.resetSuccess')}
          </div>
          <Link to="/auth/login">
            <Button size="lg" style={{ width: '100%' }}>{t('auth.backToLogin')}</Button>
          </Link>
        </div>
      )}

      {step !== 'done' && (
        <div style={{ marginTop: 16, fontSize: 13, color: 'var(--lb-text-muted)' }}>
          <Link to="/auth/login" style={{ color: 'var(--lb-text-muted)' }}>{t('auth.backToLogin')}</Link>
        </div>
      )}
    </Card>
  );
}
