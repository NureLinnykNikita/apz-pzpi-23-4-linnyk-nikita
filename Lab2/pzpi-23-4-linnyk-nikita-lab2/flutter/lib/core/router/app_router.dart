import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/domain/auth_notifier.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/register_screen.dart';
import '../../features/auth/presentation/reset_password_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/leaderboard/presentation/leaderboard_screen.dart';
import '../../features/practice/presentation/practice_shell.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/settings/presentation/settings_screen.dart';
import 'app_shell.dart';
import 'splash_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authNotifier = ref.watch(authNotifierProvider.notifier);

  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final authState = ref.read(authNotifierProvider);

      // Still loading (hydrating from storage)
      if (authState.isLoading) return null;

      final isAuthenticated =
          authState.valueOrNull?.isAuthenticated ?? false;
      final loc = state.matchedLocation;

      final isAuthRoute = loc.startsWith('/auth');
      final isAppRoute = loc.startsWith('/app');
      final isSplash = loc == '/splash';

      if (isSplash) {
        return isAuthenticated ? '/app/home' : '/auth/login';
      }
      if (!isAuthenticated && isAppRoute) return '/auth/login';
      if (isAuthenticated && isAuthRoute) return '/app/home';

      return null;
    },
    refreshListenable: _AuthStateListenable(ref),
    routes: [
      GoRoute(
        path: '/splash',
        builder: (_, __) => const SplashScreen(),
      ),

      // Auth stack
      GoRoute(
        path: '/auth/login',
        builder: (_, __) => const LoginScreen(),
      ),
      GoRoute(
        path: '/auth/register',
        builder: (_, __) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/auth/reset-password',
        builder: (_, __) => const ResetPasswordScreen(),
      ),

      // App shell with bottom navigation
      StatefulShellRoute.indexedStack(
        builder: (context, state, shell) => AppShell(shell: shell),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/app/home',
              builder: (_, __) => const HomeScreen(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/app/practice',
              builder: (_, __) => const PracticeShell(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/app/leaderboard',
              builder: (_, __) => const LeaderboardScreen(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/app/profile',
              builder: (_, __) => const ProfileScreen(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/app/settings',
              builder: (_, __) => const SettingsScreen(),
            ),
          ]),
        ],
      ),
    ],
  );
});

/// Makes GoRouter re-evaluate redirect when auth state changes.
class _AuthStateListenable extends ChangeNotifier {
  _AuthStateListenable(Ref ref) {
    ref.listen(authNotifierProvider, (_, __) => notifyListeners());
  }
}
