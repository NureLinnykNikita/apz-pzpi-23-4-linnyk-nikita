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
  username: z.string().min(3).max(32),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const qc = useQueryClient();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const res = await authApi.register(data.username, data.email, data.password);
      qc.clear();
      setAuth(res.data.accessToken, res.data.user);
      navigate('/onboarding');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(msg || t('common.error'));
    }
  };

  const eyeBtn = (show: boolean, toggle: () => void) => (
    <button type="button" onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
      {show ? <Icons.EyeOff size={16} stroke="var(--lb-text-muted)" /> : <Icons.Eye size={16} stroke="var(--lb-text-muted)" />}
    </button>
  );

  return (
    <Card>
      <h2 className="lb-h2" style={{ marginBottom: 24 }}>{t('auth.register')}</h2>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label={t('auth.username')}
          placeholder="yourusername"
          error={errors.username?.message}
          {...register('username')}
        />
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
          endAdornment={eyeBtn(showPassword, () => setShowPassword(v => !v))}
          {...register('password')}
        />
        <Input
          label={t('auth.confirmPassword')}
          type={showConfirm ? 'text' : 'password'}
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          endAdornment={eyeBtn(showConfirm, () => setShowConfirm(v => !v))}
          {...register('confirmPassword')}
        />
        {serverError && (
          <div style={{ fontSize: 13, color: 'var(--lb-danger)', padding: '8px 12px', background: 'rgba(215,114,96,0.1)', borderRadius: 'var(--lb-radius-sm)' }}>
            {serverError}
          </div>
        )}
        <Button type="submit" size="lg" style={{ marginTop: 4 }} disabled={isSubmitting}>
          {isSubmitting ? t('common.loading') : t('auth.register')}
        </Button>
      </form>
      <div style={{ marginTop: 20, fontSize: 13, color: 'var(--lb-text-muted)' }}>
        {t('auth.haveAccount')}{' '}
        <Link to="/auth/login" style={{ color: 'var(--lb-accent)' }}>{t('auth.login')}</Link>
      </div>
    </Card>
  );
}
