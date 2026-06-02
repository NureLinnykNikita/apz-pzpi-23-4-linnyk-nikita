import 'package:freezed_annotation/freezed_annotation.dart';

part 'exercise.freezed.dart';
part 'exercise.g.dart';

@freezed
class Exercise with _$Exercise {
  const factory Exercise({
    required int exerciseId,
    required int lessonId,
    required String type,
    required String question,
    int? points,
    required int sequence,
    Map<String, dynamic>? metadata,
  }) = _Exercise;

  factory Exercise.fromJson(Map<String, dynamic> json) =>
      _$ExerciseFromJson(json);
}

@freezed
class ExerciseSubmitResult with _$ExerciseSubmitResult {
  const factory ExerciseSubmitResult({
    required int exerciseId,
    required String userId,
    required bool isCorrect,
    required int earnedPoints,
    required int attemptNumber,
  }) = _ExerciseSubmitResult;

  factory ExerciseSubmitResult.fromJson(Map<String, dynamic> json) =>
      _$ExerciseSubmitResultFromJson(json);
}
