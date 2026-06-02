// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'course.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$CourseImpl _$$CourseImplFromJson(Map<String, dynamic> json) => _$CourseImpl(
      courseId: (json['courseId'] as num).toInt(),
      title: json['title'] as String,
      description: json['description'] as String?,
      level: json['level'] as String,
      language: Language.fromJson(json['language'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$$CourseImplToJson(_$CourseImpl instance) =>
    <String, dynamic>{
      'courseId': instance.courseId,
      'title': instance.title,
      'description': instance.description,
      'level': instance.level,
      'language': instance.language,
    };

_$EnrollmentImpl _$$EnrollmentImplFromJson(Map<String, dynamic> json) =>
    _$EnrollmentImpl(
      courseId: (json['courseId'] as num).toInt(),
      status: json['status'] as String,
      progress: (json['progress'] as num).toDouble(),
      enrolledAt: json['enrolledAt'] as String,
      completedAt: json['completedAt'] as String?,
      course: Course.fromJson(json['course'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$$EnrollmentImplToJson(_$EnrollmentImpl instance) =>
    <String, dynamic>{
      'courseId': instance.courseId,
      'status': instance.status,
      'progress': instance.progress,
      'enrolledAt': instance.enrolledAt,
      'completedAt': instance.completedAt,
      'course': instance.course,
    };
