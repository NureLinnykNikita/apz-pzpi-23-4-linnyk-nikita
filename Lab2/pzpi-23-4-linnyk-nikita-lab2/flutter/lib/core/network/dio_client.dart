import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../constants/api_constants.dart';
import '../storage/secure_storage.dart';

/// Replicates the isRefreshing + failedQueue pattern from mobile/src/api/client.ts
class DioClient {
  late final Dio _dio;

  final String? Function() _getAccessToken;
  final Future<void> Function(String token) _onTokenRefreshed;
  final Future<void> Function() _onLogout;
  final SecureStorage _storage;

  bool _isRefreshing = false;
  final List<Completer<String>> _failedQueue = [];

  DioClient({
    required String? Function() getAccessToken,
    required Future<void> Function(String) onTokenRefreshed,
    required Future<void> Function() onLogout,
    required SecureStorage storage,
  })  : _getAccessToken = getAccessToken,
        _onTokenRefreshed = onTokenRefreshed,
        _onLogout = onLogout,
        _storage = storage {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: ApiConstants.connectTimeout,
      receiveTimeout: ApiConstants.receiveTimeout,
      headers: {'Content-Type': 'application/json'},
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: _onRequest,
      onError: _onError,
    ));
  }

  Dio get dio => _dio;

  void _onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = _getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  Future<void> _onError(
    DioException e,
    ErrorInterceptorHandler handler,
  ) async {
    final options = e.requestOptions;

    if (e.response?.statusCode == 401 && options.extra['_retry'] != true) {
      if (_isRefreshing) {
        final completer = Completer<String>();
        _failedQueue.add(completer);
        try {
          final token = await completer.future;
          options.headers['Authorization'] = 'Bearer $token';
          options.extra['_retry'] = true;
          final retryResponse = await _dio.fetch(options);
          return handler.resolve(retryResponse);
        } catch (_) {
          return handler.next(e);
        }
      }

      _isRefreshing = true;
      options.extra['_retry'] = true;

      try {
        final refreshToken = await _storage.read('refreshToken');

        if (refreshToken == null) {
          throw Exception('No refresh token');
        }

        // Fresh Dio to avoid interceptor recursion (same reason RN uses bare axios.post)
        final refreshDio = Dio(BaseOptions(baseUrl: ApiConstants.baseUrl));
        final refreshResponse = await refreshDio.post(
          '/refresh',
          data: {'refreshToken': refreshToken},
        );

        final newToken = refreshResponse.data['accessToken'] as String;
        await _onTokenRefreshed(newToken);
        _drainQueue(null, newToken);

        options.headers['Authorization'] = 'Bearer $newToken';
        final retryResponse = await _dio.fetch(options);
        return handler.resolve(retryResponse);
      } catch (err) {
        _drainQueue(err, null);
        await _onLogout();
        return handler.next(e);
      } finally {
        _isRefreshing = false;
      }
    }

    handler.next(e);
  }

  void _drainQueue(Object? error, String? token) {
    for (final c in _failedQueue) {
      error != null ? c.completeError(error) : c.complete(token!);
    }
    _failedQueue.clear();
  }
}

// The provider is defined in features/auth/domain/auth_notifier.dart
// after AuthNotifier exists, to avoid circular imports.
// This file only exports the class.

/// Convenience extension to use in repositories.
extension DioClientX on DioClient {
  Dio get client => dio;
}

/// A provider that lazily wraps a Ref — defined here so repositories
/// can depend on it. Wired up in main.dart via ProviderScope overrides.
final dioProvider = Provider<Dio>((ref) {
  throw UnimplementedError('dioProvider must be overridden in main.dart');
});
