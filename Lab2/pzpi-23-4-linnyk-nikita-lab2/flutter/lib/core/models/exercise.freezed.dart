// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'exercise.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Exercise _$ExerciseFromJson(Map<String, dynamic> json) {
  return _Exercise.fromJson(json);
}

/// @nodoc
mixin _$Exercise {
  int get exerciseId => throw _privateConstructorUsedError;
  int get lessonId => throw _privateConstructorUsedError;
  String get type => throw _privateConstructorUsedError;
  String get question => throw _privateConstructorUsedError;
  int? get points => throw _privateConstructorUsedError;
  int get sequence => throw _privateConstructorUsedError;
  Map<String, dynamic>? get metadata => throw _privateConstructorUsedError;

  /// Serializes this Exercise to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Exercise
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ExerciseCopyWith<Exercise> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ExerciseCopyWith<$Res> {
  factory $ExerciseCopyWith(Exercise value, $Res Function(Exercise) then) =
      _$ExerciseCopyWithImpl<$Res, Exercise>;
  @useResult
  $Res call(
      {int exerciseId,
      int lessonId,
      String type,
      String question,
      int? points,
      int sequence,
      Map<String, dynamic>? metadata});
}

/// @nodoc
class _$ExerciseCopyWithImpl<$Res, $Val extends Exercise>
    implements $ExerciseCopyWith<$Res> {
  _$ExerciseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Exercise
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? exerciseId = null,
    Object? lessonId = null,
    Object? type = null,
    Object? question = null,
    Object? points = freezed,
    Object? sequence = null,
    Object? metadata = freezed,
  }) {
    return _then(_value.copyWith(
      exerciseId: null == exerciseId
          ? _value.exerciseId
          : exerciseId // ignore: cast_nullable_to_non_nullable
              as int,
      lessonId: null == lessonId
          ? _value.lessonId
          : lessonId // ignore: cast_nullable_to_non_nullable
              as int,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      question: null == question
          ? _value.question
          : question // ignore: cast_nullable_to_non_nullable
              as String,
      points: freezed == points
          ? _value.points
          : points // ignore: cast_nullable_to_non_nullable
              as int?,
      sequence: null == sequence
          ? _value.sequence
          : sequence // ignore: cast_nullable_to_non_nullable
              as int,
      metadata: freezed == metadata
          ? _value.metadata
          : metadata // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ExerciseImplCopyWith<$Res>
    implements $ExerciseCopyWith<$Res> {
  factory _$$ExerciseImplCopyWith(
          _$ExerciseImpl value, $Res Function(_$ExerciseImpl) then) =
      __$$ExerciseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {int exerciseId,
      int lessonId,
      String type,
      String question,
      int? points,
      int sequence,
      Map<String, dynamic>? metadata});
}

/// @nodoc
class __$$ExerciseImplCopyWithImpl<$Res>
    extends _$ExerciseCopyWithImpl<$Res, _$ExerciseImpl>
    implements _$$ExerciseImplCopyWith<$Res> {
  __$$ExerciseImplCopyWithImpl(
      _$ExerciseImpl _value, $Res Function(_$ExerciseImpl) _then)
      : super(_value, _then);

  /// Create a copy of Exercise
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? exerciseId = null,
    Object? lessonId = null,
    Object? type = null,
    Object? question = null,
    Object? points = freezed,
    Object? sequence = null,
    Object? metadata = freezed,
  }) {
    return _then(_$ExerciseImpl(
      exerciseId: null == exerciseId
          ? _value.exerciseId
          : exerciseId // ignore: cast_nullable_to_non_nullable
              as int,
      lessonId: null == lessonId
          ? _value.lessonId
          : lessonId // ignore: cast_nullable_to_non_nullable
              as int,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      question: null == question
          ? _value.question
          : question // ignore: cast_nullable_to_non_nullable
              as String,
      points: freezed == points
          ? _value.points
          : points // ignore: cast_nullable_to_non_nullable
              as int?,
      sequence: null == sequence
          ? _value.sequence
          : sequence // ignore: cast_nullable_to_non_nullable
              as int,
      metadata: freezed == metadata
          ? _value._metadata
          : metadata // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ExerciseImpl implements _Exercise {
  const _$ExerciseImpl(
      {required this.exerciseId,
      required this.lessonId,
      required this.type,
      required this.question,
      this.points,
      required this.sequence,
      final Map<String, dynamic>? metadata})
      : _metadata = metadata;

  factory _$ExerciseImpl.fromJson(Map<String, dynamic> json) =>
      _$$ExerciseImplFromJson(json);

  @override
  final int exerciseId;
  @override
  final int lessonId;
  @override
  final String type;
  @override
  final String question;
  @override
  final int? points;
  @override
  final int sequence;
  final Map<String, dynamic>? _metadata;
  @override
  Map<String, dynamic>? get metadata {
    final value = _metadata;
    if (value == null) return null;
    if (_metadata is EqualUnmodifiableMapView) return _metadata;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  String toString() {
    return 'Exercise(exerciseId: $exerciseId, lessonId: $lessonId, type: $type, question: $question, points: $points, sequence: $sequence, metadata: $metadata)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ExerciseImpl &&
            (identical(other.exerciseId, exerciseId) ||
                other.exerciseId == exerciseId) &&
            (identical(other.lessonId, lessonId) ||
                other.lessonId == lessonId) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.question, question) ||
                other.question == question) &&
            (identical(other.points, points) || other.points == points) &&
            (identical(other.sequence, sequence) ||
                other.sequence == sequence) &&
            const DeepCollectionEquality().equals(other._metadata, _metadata));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      exerciseId,
      lessonId,
      type,
      question,
      points,
      sequence,
      const DeepCollectionEquality().hash(_metadata));

  /// Create a copy of Exercise
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ExerciseImplCopyWith<_$ExerciseImpl> get copyWith =>
      __$$ExerciseImplCopyWithImpl<_$ExerciseImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ExerciseImplToJson(
      this,
    );
  }
}

abstract class _Exercise implements Exercise {
  const factory _Exercise(
      {required final int exerciseId,
      required final int lessonId,
      required final String type,
      required final String question,
      final int? points,
      required final int sequence,
      final Map<String, dynamic>? metadata}) = _$ExerciseImpl;

  factory _Exercise.fromJson(Map<String, dynamic> json) =
      _$ExerciseImpl.fromJson;

  @override
  int get exerciseId;
  @override
  int get lessonId;
  @override
  String get type;
  @override
  String get question;
  @override
  int? get points;
  @override
  int get sequence;
  @override
  Map<String, dynamic>? get metadata;

  /// Create a copy of Exercise
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ExerciseImplCopyWith<_$ExerciseImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ExerciseSubmitResult _$ExerciseSubmitResultFromJson(Map<String, dynamic> json) {
  return _ExerciseSubmitResult.fromJson(json);
}

/// @nodoc
mixin _$ExerciseSubmitResult {
  int get exerciseId => throw _privateConstructorUsedError;
  String get userId => throw _privateConstructorUsedError;
  bool get isCorrect => throw _privateConstructorUsedError;
  int get earnedPoints => throw _privateConstructorUsedError;
  int get attemptNumber => throw _privateConstructorUsedError;

  /// Serializes this ExerciseSubmitResult to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ExerciseSubmitResult
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ExerciseSubmitResultCopyWith<ExerciseSubmitResult> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ExerciseSubmitResultCopyWith<$Res> {
  factory $ExerciseSubmitResultCopyWith(ExerciseSubmitResult value,
          $Res Function(ExerciseSubmitResult) then) =
      _$ExerciseSubmitResultCopyWithImpl<$Res, ExerciseSubmitResult>;
  @useResult
  $Res call(
      {int exerciseId,
      String userId,
      bool isCorrect,
      int earnedPoints,
      int attemptNumber});
}

/// @nodoc
class _$ExerciseSubmitResultCopyWithImpl<$Res,
        $Val extends ExerciseSubmitResult>
    implements $ExerciseSubmitResultCopyWith<$Res> {
  _$ExerciseSubmitResultCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ExerciseSubmitResult
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? exerciseId = null,
    Object? userId = null,
    Object? isCorrect = null,
    Object? earnedPoints = null,
    Object? attemptNumber = null,
  }) {
    return _then(_value.copyWith(
      exerciseId: null == exerciseId
          ? _value.exerciseId
          : exerciseId // ignore: cast_nullable_to_non_nullable
              as int,
      userId: null == userId
          ? _value.userId
          : userId // ignore: cast_nullable_to_non_nullable
              as String,
      isCorrect: null == isCorrect
          ? _value.isCorrect
          : isCorrect // ignore: cast_nullable_to_non_nullable
              as bool,
      earnedPoints: null == earnedPoints
          ? _value.earnedPoints
          : earnedPoints // ignore: cast_nullable_to_non_nullable
              as int,
      attemptNumber: null == attemptNumber
          ? _value.attemptNumber
          : attemptNumber // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ExerciseSubmitResultImplCopyWith<$Res>
    implements $ExerciseSubmitResultCopyWith<$Res> {
  factory _$$ExerciseSubmitResultImplCopyWith(_$ExerciseSubmitResultImpl value,
          $Res Function(_$ExerciseSubmitResultImpl) then) =
      __$$ExerciseSubmitResultImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {int exerciseId,
      String userId,
      bool isCorrect,
      int earnedPoints,
      int attemptNumber});
}

/// @nodoc
class __$$ExerciseSubmitResultImplCopyWithImpl<$Res>
    extends _$ExerciseSubmitResultCopyWithImpl<$Res, _$ExerciseSubmitResultImpl>
    implements _$$ExerciseSubmitResultImplCopyWith<$Res> {
  __$$ExerciseSubmitResultImplCopyWithImpl(_$ExerciseSubmitResultImpl _value,
      $Res Function(_$ExerciseSubmitResultImpl) _then)
      : super(_value, _then);

  /// Create a copy of ExerciseSubmitResult
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? exerciseId = null,
    Object? userId = null,
    Object? isCorrect = null,
    Object? earnedPoints = null,
    Object? attemptNumber = null,
  }) {
    return _then(_$ExerciseSubmitResultImpl(
      exerciseId: null == exerciseId
          ? _value.exerciseId
          : exerciseId // ignore: cast_nullable_to_non_nullable
              as int,
      userId: null == userId
          ? _value.userId
          : userId // ignore: cast_nullable_to_non_nullable
              as String,
      isCorrect: null == isCorrect
          ? _value.isCorrect
          : isCorrect // ignore: cast_nullable_to_non_nullable
              as bool,
      earnedPoints: null == earnedPoints
          ? _value.earnedPoints
          : earnedPoints // ignore: cast_nullable_to_non_nullable
              as int,
      attemptNumber: null == attemptNumber
          ? _value.attemptNumber
          : attemptNumber // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ExerciseSubmitResultImpl implements _ExerciseSubmitResult {
  const _$ExerciseSubmitResultImpl(
      {required this.exerciseId,
      required this.userId,
      required this.isCorrect,
      required this.earnedPoints,
      required this.attemptNumber});

  factory _$ExerciseSubmitResultImpl.fromJson(Map<String, dynamic> json) =>
      _$$ExerciseSubmitResultImplFromJson(json);

  @override
  final int exerciseId;
  @override
  final String userId;
  @override
  final bool isCorrect;
  @override
  final int earnedPoints;
  @override
  final int attemptNumber;

  @override
  String toString() {
    return 'ExerciseSubmitResult(exerciseId: $exerciseId, userId: $userId, isCorrect: $isCorrect, earnedPoints: $earnedPoints, attemptNumber: $attemptNumber)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ExerciseSubmitResultImpl &&
            (identical(other.exerciseId, exerciseId) ||
                other.exerciseId == exerciseId) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.isCorrect, isCorrect) ||
                other.isCorrect == isCorrect) &&
            (identical(other.earnedPoints, earnedPoints) ||
                other.earnedPoints == earnedPoints) &&
            (identical(other.attemptNumber, attemptNumber) ||
                other.attemptNumber == attemptNumber));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, exerciseId, userId, isCorrect, earnedPoints, attemptNumber);

  /// Create a copy of ExerciseSubmitResult
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ExerciseSubmitResultImplCopyWith<_$ExerciseSubmitResultImpl>
      get copyWith =>
          __$$ExerciseSubmitResultImplCopyWithImpl<_$ExerciseSubmitResultImpl>(
              this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ExerciseSubmitResultImplToJson(
      this,
    );
  }
}

abstract class _ExerciseSubmitResult implements ExerciseSubmitResult {
  const factory _ExerciseSubmitResult(
      {required final int exerciseId,
      required final String userId,
      required final bool isCorrect,
      required final int earnedPoints,
      required final int attemptNumber}) = _$ExerciseSubmitResultImpl;

  factory _ExerciseSubmitResult.fromJson(Map<String, dynamic> json) =
      _$ExerciseSubmitResultImpl.fromJson;

  @override
  int get exerciseId;
  @override
  String get userId;
  @override
  bool get isCorrect;
  @override
  int get earnedPoints;
  @override
  int get attemptNumber;

  /// Create a copy of ExerciseSubmitResult
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ExerciseSubmitResultImplCopyWith<_$ExerciseSubmitResultImpl>
      get copyWith => throw _privateConstructorUsedError;
}
