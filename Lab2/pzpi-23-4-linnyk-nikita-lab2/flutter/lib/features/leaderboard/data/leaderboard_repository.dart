import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/models/leaderboard.dart';
import '../../../core/network/api_error.dart';
import '../../../core/network/dio_client.dart';

class LeaderboardRepository {
  final Dio _dio;
  LeaderboardRepository(this._dio);

  Future<LeaderboardResponse> getLeaderboard({
    String period = 'week',
    int limit = 50,
  }) async {
    try {
      final res = await _dio.get('/leaderboard', queryParameters: {
        'period': period,
        'limit': limit,
      });
      return LeaderboardResponse.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }
}

final leaderboardRepositoryProvider = Provider<LeaderboardRepository>((ref) {
  return LeaderboardRepository(ref.read(dioProvider));
});

final leaderboardProvider = FutureProvider.autoDispose
    .family<LeaderboardResponse, String>((ref, period) {
  return ref.read(leaderboardRepositoryProvider).getLeaderboard(period: period);
});
