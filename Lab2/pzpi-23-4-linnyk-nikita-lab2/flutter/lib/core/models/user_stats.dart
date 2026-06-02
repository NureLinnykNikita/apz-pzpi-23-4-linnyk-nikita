import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_stats.freezed.dart';
part 'user_stats.g.dart';

@freezed
class UserStats with _$UserStats {
  const factory UserStats({
    required int totalPoints,
    required int exercisesCompleted,
    required double correctAnswersRate,
    required int coursesEnrolled,
    required int achievementsCount,
    required int streak,
    required int todayExercises,
    required int dailyGoal,
  }) = _UserStats;

  factory UserStats.fromJson(Map<String, dynamic> json) =>
      _$UserStatsFromJson(json);
}
