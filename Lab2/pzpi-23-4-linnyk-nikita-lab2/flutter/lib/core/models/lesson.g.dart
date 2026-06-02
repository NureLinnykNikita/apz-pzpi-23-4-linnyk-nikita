// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'lesson.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$LessonImpl _$$LessonImplFromJson(Map<String, dynamic> json) => _$LessonImpl(
      lessonId: (json['lessonId'] as num).toInt(),
      courseId: (json['courseId'] as num).toInt(),
      title: json['title'] as String,
      description: json['description'] as String?,
      sequence: (json['sequence'] as num).toInt(),
    );

Map<String, dynamic> _$$LessonImplToJson(_$LessonImpl instance) =>
    <String, dynamic>{
      'lessonId': instance.lessonId,
      'courseId': instance.courseId,
      'title': instance.title,
      'description': instance.description,
      'sequence': instance.sequence,
    };

_$LessonProgressImpl _$$LessonProgressImplFromJson(Map<String, dynamic> json) =>
    _$LessonProgressImpl(
      lessonId: (json['lessonId'] as num).toInt(),
      title: json['title'] as String,
      sequence: (json['sequence'] as num).toInt(),
      totalExercises: (json['totalExercises'] as num).toInt(),
      completedExercises: (json['completedExercises'] as num).toInt(),
      isCompleted: json['isCompleted'] as bool,
      progressPercent: (json['progressPercent'] as num).toDouble(),
    );

Map<String, dynamic> _$$LessonProgressImplToJson(
        _$LessonProgressImpl instance) =>
    <String, dynamic>{
      'lessonId': instance.lessonId,
      'title': instance.title,
      'sequence': instance.sequence,
      'totalExercises': instance.totalExercises,
      'completedExercises': instance.completedExercises,
      'isCompleted': instance.isCompleted,
      'progressPercent': instance.progressPercent,
    };

_$CourseProgressImpl _$$CourseProgressImplFromJson(Map<String, dynamic> json) =>
    _$CourseProgressImpl(
      courseId: (json['courseId'] as num).toInt(),
      title: json['title'] as String,
      totalProgress: (json['totalProgress'] as num).toDouble(),
      lessons: (json['lessons'] as List<dynamic>)
          .map((e) => LessonProgress.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$$CourseProgressImplToJson(
        _$CourseProgressImpl instance) =>
    <String, dynamic>{
      'courseId': instance.courseId,
      'title': instance.title,
      'totalProgress': instance.totalProgress,
      'lessons': instance.lessons,
    };
