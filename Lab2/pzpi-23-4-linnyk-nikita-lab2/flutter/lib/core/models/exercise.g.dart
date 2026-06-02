// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'exercise.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ExerciseImpl _$$ExerciseImplFromJson(Map<String, dynamic> json) =>
    _$ExerciseImpl(
      exerciseId: (json['exerciseId'] as num).toInt(),
      lessonId: (json['lessonId'] as num).toInt(),
      type: json['type'] as String,
      question: json['question'] as String,
      points: (json['points'] as num?)?.toInt(),
      sequence: (json['sequence'] as num).toInt(),
      metadata: json['metadata'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$$ExerciseImplToJson(_$ExerciseImpl instance) =>
    <String, dynamic>{
      'exerciseId': instance.exerciseId,
      'lessonId': instance.lessonId,
      'type': instance.type,
      'question': instance.question,
      'points': instance.points,
      'sequence': instance.sequence,
      'metadata': instance.metadata,
    };

_$ExerciseSubmitResultImpl _$$ExerciseSubmitResultImplFromJson(
        Map<String, dynamic> json) =>
    _$ExerciseSubmitResultImpl(
      exerciseId: (json['exerciseId'] as num).toInt(),
      userId: json['userId'] as String,
      isCorrect: json['isCorrect'] as bool,
      earnedPoints: (json['earnedPoints'] as num).toInt(),
      attemptNumber: (json['attemptNumber'] as num).toInt(),
    );

Map<String, dynamic> _$$ExerciseSubmitResultImplToJson(
        _$ExerciseSubmitResultImpl instance) =>
    <String, dynamic>{
      'exerciseId': instance.exerciseId,
      'userId': instance.userId,
      'isCorrect': instance.isCorrect,
      'earnedPoints': instance.earnedPoints,
      'attemptNumber': instance.attemptNumber,
    };
