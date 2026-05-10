import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

export function AuthLayout() {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/app/home" replace />;

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
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--lb-font-display)', fontSize: 28, fontWeight: 600, color: 'var(--lb-accent)', letterSpacing: '-0.02em' }}>
            LangBang
          </div>
          <div style={{ fontSize: 13, color: 'var(--lb-text-muted)', marginTop: 6 }}>
            Learn languages with AI
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
