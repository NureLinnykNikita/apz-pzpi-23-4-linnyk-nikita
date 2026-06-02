import 'package:freezed_annotation/freezed_annotation.dart';
import 'language.dart';

part 'course.freezed.dart';
part 'course.g.dart';

@freezed
class Course with _$Course {
  const factory Course({
    required int courseId,
    required String title,
    String? description,
    required String level,
    required Language language,
  }) = _Course;

  factory Course.fromJson(Map<String, dynamic> json) =>
      _$CourseFromJson(json);
}

@freezed
class Enrollment with _$Enrollment {
  const factory Enrollment({
    required int courseId,
    required String status,
    required double progress,
    required String enrolledAt,
    String? completedAt,
    required Course course,
  }) = _Enrollment;

  factory Enrollment.fromJson(Map<String, dynamic> json) =>
      _$EnrollmentFromJson(json);
}
