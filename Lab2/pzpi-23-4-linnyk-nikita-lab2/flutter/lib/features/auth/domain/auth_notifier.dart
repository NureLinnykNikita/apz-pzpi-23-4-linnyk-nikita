import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/models/user_profile.dart';
import '../../../core/storage/secure_storage.dart';
import '../data/auth_repository.dart';

class AuthState {
  final String? accessToken;
  final UserProfile? user;

  const AuthState({this.accessToken, this.user});

  bool get isAuthenticated => accessToken != null;

  AuthState copyWith({String? accessToken, UserProfile? user}) => AuthState(
        accessToken: accessToken ?? this.accessToken,
        user: user ?? this.user,
      );
}

class AuthNotifier extends AsyncNotifier<AuthState> {
  @override
  Future<AuthState> build() async {
    final storage = ref.read(secureStorageProvider);
    final userJson = await storage.read('user');
    if (userJson != null) {
      try {
        final user = UserProfile.fromJson(
            jsonDecode(userJson) as Map<String, dynamic>);
        return AuthState(user: user);
      } catch (_) {
        await storage.delete('user');
      }
    }
    return const AuthState();
  }

  Future<void> login(String email, String password) async {
    final repo = ref.read(authRepositoryProvider);
    final result = await repo.login(email: email, password: password);
    await _persist(
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    );
  }

  Future<void> register({
    required String username,
    required String email,
    required String password,
  }) async {
    final repo = ref.read(authRepositoryProvider);
    final result = await repo.register(
        username: username, email: email, password: password);
    await _persist(
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    );
  }

  Future<void> setAuth({
    required String accessToken,
    required String refreshToken,
    required UserProfile user,
  }) => _persist(
        accessToken: accessToken,
        refreshToken: refreshToken,
        user: user,
      );

  Future<void> setAccessToken(String token) async {
    final current = state.valueOrNull ?? const AuthState();
    state = AsyncData(current.copyWith(accessToken: token));
  }

  Future<void> logout() async {
    final storage = ref.read(secureStorageProvider);
    try {
      final repo = ref.read(authRepositoryProvider);
      final refreshToken = await storage.read('refreshToken');
      if (refreshToken != null) {
        await repo.logout(refreshToken: refreshToken);
      }
    } catch (_) {}
    await storage.delete('refreshToken');
    await storage.delete('user');
    state = const AsyncData(AuthState());
  }

  Future<void> _persist({
    required String accessToken,
    required String refreshToken,
    required UserProfile user,
  }) async {
    final storage = ref.read(secureStorageProvider);
    await storage.write('refreshToken', refreshToken);
    await storage.write('user', jsonEncode(user.toJson()));
    state = AsyncData(AuthState(accessToken: accessToken, user: user));
  }
}

final authNotifierProvider =
    AsyncNotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);

final currentUserProvider = Provider<UserProfile?>((ref) =>
    ref.watch(authNotifierProvider).valueOrNull?.user);

final accessTokenProvider = Provider<String?>((ref) =>
    ref.watch(authNotifierProvider).valueOrNull?.accessToken);
