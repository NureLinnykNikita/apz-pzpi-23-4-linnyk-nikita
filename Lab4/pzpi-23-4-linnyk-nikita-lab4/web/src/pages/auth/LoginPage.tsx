import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Card, Input } from '../../components/ui';
import { Icons } from '../../components/ui/icons';
import { authApi } from '../../api/endpoints';
import { useAuthStore } from '../../store/auth.store';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const qc = useQueryClient();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const res = await authApi.login(data.email, data.password);
      qc.clear();
      setAuth(res.data.accessToken, res.data.user);
      navigate('/app/home');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(msg || t('common.error'));
    }
  };

  return (
    <Card>
      <h2 className="lb-h2" style={{ marginBottom: 24 }}>{t('auth.login')}</h2>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label={t('auth.email')}
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label={t('auth.password')}
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          error={errors.password?.message}
          endAdornment={
            <button type="button" onClick={() => setShowPassword(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              {showPassword ? <Icons.EyeOff size={16} stroke="var(--lb-text-muted)" /> : <Icons.Eye size={16} stroke="var(--lb-text-muted)" />}
            </button>
          }
          {...register('password')}
        />
        {serverError && (
          <div style={{ fontSize: 13, color: 'var(--lb-danger)', padding: '8px 12px', background: 'rgba(215,114,96,0.1)', borderRadius: 'var(--lb-radius-sm)' }}>
            {serverError}
          </div>
        )}
        <Button type="submit" size="lg" style={{ marginTop: 4 }} disabled={isSubmitting}>
          {isSubmitting ? t('common.loading') : t('auth.login')}
        </Button>
      </form>
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
        <span style={{ color: 'var(--lb-text-muted)' }}>
          {t('auth.noAccount')}{' '}
          <Link to="/auth/register" style={{ color: 'var(--lb-accent)' }}>{t('auth.register')}</Link>
        </span>
        <Link to="/auth/reset-password" style={{ color: 'var(--lb-text-muted)' }}>
          {t('auth.forgotPassword')}
        </Link>
      </div>
    </Card>
  );
}
