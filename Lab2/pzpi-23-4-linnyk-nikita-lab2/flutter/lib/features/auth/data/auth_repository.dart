import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/models/user_profile.dart';
import '../../../core/network/api_error.dart';
import '../../../core/network/dio_client.dart';

class AuthResult {
  final String accessToken;
  final String refreshToken;
  final UserProfile user;

  const AuthResult({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });
}

class AuthRepository {
  final Dio _dio;
  AuthRepository(this._dio);

  Future<AuthResult> login({
    required String email,
    required String password,
  }) async {
    try {
      final res = await _dio.post('/login', data: {
        'email': email,
        'password': password,
      });
      return _parseAuthResult(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }

  Future<AuthResult> register({
    required String username,
    required String email,
    required String password,
  }) async {
    try {
      final res = await _dio.post('/register', data: {
        'username': username,
        'email': email,
        'password': password,
      });
      return _parseAuthResult(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }

  Future<void> logout({required String refreshToken}) async {
    try {
      await _dio.post('/logout', data: {'refreshToken': refreshToken});
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }

  Future<void> requestPasswordReset({required String email}) async {
    try {
      await _dio.post('/password-reset/request', data: {'email': email});
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }

  Future<String> verifyResetCode({
    required String email,
    required String code,
  }) async {
    try {
      final res = await _dio.post('/password-reset/verify', data: {
        'email': email,
        'code': code,
      });
      return res.data['resetToken'] as String;
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }

  Future<void> confirmPasswordReset({
    required String resetToken,
    required String newPassword,
  }) async {
    try {
      await _dio.post('/password-reset/confirm', data: {
        'resetToken': resetToken,
        'newPassword': newPassword,
      });
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }

  AuthResult _parseAuthResult(Map<String, dynamic> data) {
    final token = (data['token'] ?? data['accessToken']) as String;
    final refreshToken = data['refreshToken'] as String;
    final user =
        UserProfile.fromJson(data['user'] as Map<String, dynamic>);
    return AuthResult(
        accessToken: token, refreshToken: refreshToken, user: user);
  }
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final dio = ref.read(dioProvider);
  return AuthRepository(dio);
});
