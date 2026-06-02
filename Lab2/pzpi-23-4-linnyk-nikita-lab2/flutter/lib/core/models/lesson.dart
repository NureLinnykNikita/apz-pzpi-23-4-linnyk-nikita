import 'package:freezed_annotation/freezed_annotation.dart';

part 'lesson.freezed.dart';
part 'lesson.g.dart';

@freezed
class Lesson with _$Lesson {
  const factory Lesson({
    required int lessonId,
    required int courseId,
    required String title,
    String? description,
    required int sequence,
  }) = _Lesson;

  factory Lesson.fromJson(Map<String, dynamic> json) =>
      _$LessonFromJson(json);
}

@freezed
class LessonProgress with _$LessonProgress {
  const factory LessonProgress({
    required int lessonId,
    required String title,
    required int sequence,
    required int totalExercises,
    required int completedExercises,
    required bool isCompleted,
    required double progressPercent,
  }) = _LessonProgress;

  factory LessonProgress.fromJson(Map<String, dynamic> json) =>
      _$LessonProgressFromJson(json);
}

@freezed
class CourseProgress with _$CourseProgress {
  const factory CourseProgress({
    required int courseId,
    required String title,
    required double totalProgress,
    required List<LessonProgress> lessons,
  }) = _CourseProgress;

  factory CourseProgress.fromJson(Map<String, dynamic> json) =>
      _$CourseProgressFromJson(json);
}
