import { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/auth.store';
import { api, setAccessToken } from './api/client';
import type { UserProfile } from './types';

import { AuthLayout } from './components/layout/AuthLayout';
import { AppLayout } from './components/layout/AppLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Onboarding
import { OnboardingPage } from './pages/OnboardingPage';

// App pages
import { HomePage } from './pages/app/HomePage';
import { PracticePage } from './pages/app/PracticePage';
import { LeaderboardPage } from './pages/app/LeaderboardPage';
import { CommunityPage } from './pages/app/CommunityPage';
import { ProfilePage } from './pages/app/ProfilePage';
import { SettingsPage } from './pages/app/SettingsPage';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminLessonsPage } from './pages/admin/AdminLessonsPage';
import { AdminExercisesPage } from './pages/admin/AdminExercisesPage';
import { AdminLanguagesPage } from './pages/admin/AdminLanguagesPage';
import { AdminAchievementsPage } from './pages/admin/AdminAchievementsPage';
import { AdminModerationPage } from './pages/admin/AdminModerationPage';
import { AdminBackupPage } from './pages/admin/AdminBackupPage';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AuthRestorer({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const { setAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) { setReady(true); return; }
    // Only attempt refresh if we know the user had an active session.
    // Avoids a guaranteed 401 console error when visiting the app without ever logging in.
    if (!localStorage.getItem('lb_session')) { setReady(true); return; }
    axios
      .post(`${BASE_URL}/refresh`, {}, { withCredentials: true })
      .then(async ({ data }) => {
        setAccessToken(data.accessToken);
        const userRes = await api.get<{ user: UserProfile }>('/users/me');
        setAuth(data.accessToken, userRes.data.user);
      })
      .catch(() => {
        // Cookie expired or revoked – clear the stale flag and stay logged out
        localStorage.removeItem('lb_session');
      })
      .finally(() => setReady(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--lb-bg)' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--lb-line)', borderTopColor: 'var(--lb-accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return <>{children}</>;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      retry: (failureCount, error: unknown) => {
        const status = (error as { response?: { status: number } })?.response?.status;
        if (status === 401 || status === 403) return false;
        return failureCount < 2;
      },
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthRestorer>
        <Routes>
          <Route path="/" element={<Navigate to="/app/home" replace />} />

          <Route element={<AuthLayout />}>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          </Route>

          <Route path="/onboarding" element={<OnboardingPage />} />

          <Route element={<AppLayout />}>
            <Route path="/app/home" element={<HomePage />} />
            <Route path="/app/practice" element={<PracticePage />} />
            <Route path="/app/leaderboard" element={<LeaderboardPage />} />
            <Route path="/app/community" element={<CommunityPage />} />
            <Route path="/app/profile" element={<ProfilePage />} />
            <Route path="/app/settings" element={<SettingsPage />} />
          </Route>

          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route path="/admin/lessons" element={<AdminLessonsPage />} />
            <Route path="/admin/exercises" element={<AdminExercisesPage />} />
            <Route path="/admin/languages" element={<AdminLanguagesPage />} />
            <Route path="/admin/achievements" element={<AdminAchievementsPage />} />
            <Route path="/admin/moderation" element={<AdminModerationPage />} />
            <Route path="/admin/backup" element={<AdminBackupPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/app/home" replace />} />
        </Routes>
        </AuthRestorer>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
