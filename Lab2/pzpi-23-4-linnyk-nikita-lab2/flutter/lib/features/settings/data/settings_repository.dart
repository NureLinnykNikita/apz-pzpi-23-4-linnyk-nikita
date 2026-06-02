import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/models/user_settings.dart';
import '../../../core/network/api_error.dart';
import '../../../core/network/dio_client.dart';

class SettingsRepository {
  final Dio _dio;
  SettingsRepository(this._dio);

  Future<UserSettings> getSettings() async {
    try {
      final res = await _dio.get('/users/me/settings');
      return UserSettings.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }

  Future<UserSettings> updateSettings({
    int? dailyGoalExercises,
    bool? notificationsEnabled,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (dailyGoalExercises != null) {
        data['dailyGoalExercises'] = dailyGoalExercises;
      }
      if (notificationsEnabled != null) {
        data['notificationsEnabled'] = notificationsEnabled;
      }
      final res = await _dio.patch('/users/me/settings', data: data);
      return UserSettings.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }
}

final settingsRepositoryProvider = Provider<SettingsRepository>((ref) {
  return SettingsRepository(ref.read(dioProvider));
});

final userSettingsProvider = FutureProvider.autoDispose<UserSettings>((ref) {
  return ref.read(settingsRepositoryProvider).getSettings();
});
