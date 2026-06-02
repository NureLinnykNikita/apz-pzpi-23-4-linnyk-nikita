import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/models/course.dart';
import '../../../core/models/user_stats.dart';
import '../../../core/network/api_error.dart';
import '../../../core/network/dio_client.dart';

class HomeRepository {
  final Dio _dio;
  HomeRepository(this._dio);

  Future<UserStats> getMyStats() async {
    try {
      final res = await _dio.get('/users/me/stats');
      return UserStats.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }

  Future<List<Enrollment>> getMyEnrollments() async {
    try {
      final res = await _dio.get('/users/me/enrollments');
      final list = (res.data['enrollments'] ?? res.data) as List;
      return list
          .map((e) => Enrollment.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }
}

final homeRepositoryProvider = Provider<HomeRepository>((ref) {
  return HomeRepository(ref.read(dioProvider));
});

final myStatsProvider = FutureProvider.autoDispose<UserStats>((ref) {
  return ref.read(homeRepositoryProvider).getMyStats();
});

final myEnrollmentsProvider =
    FutureProvider.autoDispose<List<Enrollment>>((ref) {
  return ref.read(homeRepositoryProvider).getMyEnrollments();
});
