// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_stats.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserStatsImpl _$$UserStatsImplFromJson(Map<String, dynamic> json) =>
    _$UserStatsImpl(
      totalPoints: (json['totalPoints'] as num).toInt(),
      exercisesCompleted: (json['exercisesCompleted'] as num).toInt(),
      correctAnswersRate: (json['correctAnswersRate'] as num).toDouble(),
      coursesEnrolled: (json['coursesEnrolled'] as num).toInt(),
      achievementsCount: (json['achievementsCount'] as num).toInt(),
      streak: (json['streak'] as num).toInt(),
      todayExercises: (json['todayExercises'] as num).toInt(),
      dailyGoal: (json['dailyGoal'] as num).toInt(),
    );

Map<String, dynamic> _$$UserStatsImplToJson(_$UserStatsImpl instance) =>
    <String, dynamic>{
      'totalPoints': instance.totalPoints,
      'exercisesCompleted': instance.exercisesCompleted,
      'correctAnswersRate': instance.correctAnswersRate,
      'coursesEnrolled': instance.coursesEnrolled,
      'achievementsCount': instance.achievementsCount,
      'streak': instance.streak,
      'todayExercises': instance.todayExercises,
      'dailyGoal': instance.dailyGoal,
    };
