import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../../store/auth.store';

export function AppLayout() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (isAuthenticated && user && !user.nativeLanguageId) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '32px 28px',
          background: 'var(--lb-bg)',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
