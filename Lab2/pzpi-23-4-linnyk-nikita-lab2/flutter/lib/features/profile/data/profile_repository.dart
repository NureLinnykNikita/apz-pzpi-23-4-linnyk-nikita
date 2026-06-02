import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/models/achievement.dart';
import '../../../core/models/user_profile.dart';
import '../../../core/models/user_stats.dart';
import '../../../core/network/api_error.dart';
import '../../../core/network/dio_client.dart';

class ProfileRepository {
  final Dio _dio;
  ProfileRepository(this._dio);

  Future<UserProfile> getMyProfile() async {
    try {
      final res = await _dio.get('/users/me');
      return UserProfile.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }

  Future<UserProfile> updateMyProfile({
    String? username,
    String? bio,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (username != null) data['username'] = username;
      if (bio != null) data['bio'] = bio;
      final res = await _dio.patch('/users/me', data: data);
      return UserProfile.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }

  Future<UserStats> getMyStats() async {
    try {
      final res = await _dio.get('/users/me/stats');
      return UserStats.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }

  Future<List<Achievement>> getMyAchievements() async {
    try {
      final res = await _dio.get('/users/me/achievements');
      final list = (res.data['achievements'] ?? res.data) as List;
      return list
          .map((e) => Achievement.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      await _dio.patch('/users/me/password', data: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      });
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }
}

final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepository(ref.read(dioProvider));
});

final myProfileProvider = FutureProvider.autoDispose<UserProfile>((ref) {
  return ref.read(profileRepositoryProvider).getMyProfile();
});

final profileStatsProvider = FutureProvider.autoDispose<UserStats>((ref) {
  return ref.read(profileRepositoryProvider).getMyStats();
});

final myAchievementsProvider =
    FutureProvider.autoDispose<List<Achievement>>((ref) {
  return ref.read(profileRepositoryProvider).getMyAchievements();
});
