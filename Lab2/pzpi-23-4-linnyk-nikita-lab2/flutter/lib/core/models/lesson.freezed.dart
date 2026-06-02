// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'lesson.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Lesson _$LessonFromJson(Map<String, dynamic> json) {
  return _Lesson.fromJson(json);
}

/// @nodoc
mixin _$Lesson {
  int get lessonId => throw _privateConstructorUsedError;
  int get courseId => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;
  int get sequence => throw _privateConstructorUsedError;

  /// Serializes this Lesson to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Lesson
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $LessonCopyWith<Lesson> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $LessonCopyWith<$Res> {
  factory $LessonCopyWith(Lesson value, $Res Function(Lesson) then) =
      _$LessonCopyWithImpl<$Res, Lesson>;
  @useResult
  $Res call(
      {int lessonId,
      int courseId,
      String title,
      String? description,
      int sequence});
}

/// @nodoc
class _$LessonCopyWithImpl<$Res, $Val extends Lesson>
    implements $LessonCopyWith<$Res> {
  _$LessonCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Lesson
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? lessonId = null,
    Object? courseId = null,
    Object? title = null,
    Object? description = freezed,
    Object? sequence = null,
  }) {
    return _then(_value.copyWith(
      lessonId: null == lessonId
          ? _value.lessonId
          : lessonId // ignore: cast_nullable_to_non_nullable
              as int,
      courseId: null == courseId
          ? _value.courseId
          : courseId // ignore: cast_nullable_to_non_nullable
              as int,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      sequence: null == sequence
          ? _value.sequence
          : sequence // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$LessonImplCopyWith<$Res> implements $LessonCopyWith<$Res> {
  factory _$$LessonImplCopyWith(
          _$LessonImpl value, $Res Function(_$LessonImpl) then) =
      __$$LessonImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {int lessonId,
      int courseId,
      String title,
      String? description,
      int sequence});
}

/// @nodoc
class __$$LessonImplCopyWithImpl<$Res>
    extends _$LessonCopyWithImpl<$Res, _$LessonImpl>
    implements _$$LessonImplCopyWith<$Res> {
  __$$LessonImplCopyWithImpl(
      _$LessonImpl _value, $Res Function(_$LessonImpl) _then)
      : super(_value, _then);

  /// Create a copy of Lesson
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? lessonId = null,
    Object? courseId = null,
    Object? title = null,
    Object? description = freezed,
    Object? sequence = null,
  }) {
    return _then(_$LessonImpl(
      lessonId: null == lessonId
          ? _value.lessonId
          : lessonId // ignore: cast_nullable_to_non_nullable
              as int,
      courseId: null == courseId
          ? _value.courseId
          : courseId // ignore: cast_nullable_to_non_nullable
              as int,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      sequence: null == sequence
          ? _value.sequence
          : sequence // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$LessonImpl implements _Lesson {
  const _$LessonImpl(
      {required this.lessonId,
      required this.courseId,
      required this.title,
      this.description,
      required this.sequence});

  factory _$LessonImpl.fromJson(Map<String, dynamic> json) =>
      _$$LessonImplFromJson(json);

  @override
  final int lessonId;
  @override
  final int courseId;
  @override
  final String title;
  @override
  final String? description;
  @override
  final int sequence;

  @override
  String toString() {
    return 'Lesson(lessonId: $lessonId, courseId: $courseId, title: $title, description: $description, sequence: $sequence)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LessonImpl &&
            (identical(other.lessonId, lessonId) ||
                other.lessonId == lessonId) &&
            (identical(other.courseId, courseId) ||
                other.courseId == courseId) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.sequence, sequence) ||
                other.sequence == sequence));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, lessonId, courseId, title, description, sequence);

  /// Create a copy of Lesson
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$LessonImplCopyWith<_$LessonImpl> get copyWith =>
      __$$LessonImplCopyWithImpl<_$LessonImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$LessonImplToJson(
      this,
    );
  }
}

abstract class _Lesson implements Lesson {
  const factory _Lesson(
      {required final int lessonId,
      required final int courseId,
      required final String title,
      final String? description,
      required final int sequence}) = _$LessonImpl;

  factory _Lesson.fromJson(Map<String, dynamic> json) = _$LessonImpl.fromJson;

  @override
  int get lessonId;
  @override
  int get courseId;
  @override
  String get title;
  @override
  String? get description;
  @override
  int get sequence;

  /// Create a copy of Lesson
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$LessonImplCopyWith<_$LessonImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

LessonProgress _$LessonProgressFromJson(Map<String, dynamic> json) {
  return _LessonProgress.fromJson(json);
}

/// @nodoc
mixin _$LessonProgress {
  int get lessonId => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  int get sequence => throw _privateConstructorUsedError;
  int get totalExercises => throw _privateConstructorUsedError;
  int get completedExercises => throw _privateConstructorUsedError;
  bool get isCompleted => throw _privateConstructorUsedError;
  double get progressPercent => throw _privateConstructorUsedError;

  /// Serializes this LessonProgress to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of LessonProgress
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $LessonProgressCopyWith<LessonProgress> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $LessonProgressCopyWith<$Res> {
  factory $LessonProgressCopyWith(
          LessonProgress value, $Res Function(LessonProgress) then) =
      _$LessonProgressCopyWithImpl<$Res, LessonProgress>;
  @useResult
  $Res call(
      {int lessonId,
      String title,
      int sequence,
      int totalExercises,
      int completedExercises,
      bool isCompleted,
      double progressPercent});
}

/// @nodoc
class _$LessonProgressCopyWithImpl<$Res, $Val extends LessonProgress>
    implements $LessonProgressCopyWith<$Res> {
  _$LessonProgressCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of LessonProgress
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? lessonId = null,
    Object? title = null,
    Object? sequence = null,
    Object? totalExercises = null,
    Object? completedExercises = null,
    Object? isCompleted = null,
    Object? progressPercent = null,
  }) {
    return _then(_value.copyWith(
      lessonId: null == lessonId
          ? _value.lessonId
          : lessonId // ignore: cast_nullable_to_non_nullable
              as int,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      sequence: null == sequence
          ? _value.sequence
          : sequence // ignore: cast_nullable_to_non_nullable
              as int,
      totalExercises: null == totalExercises
          ? _value.totalExercises
          : totalExercises // ignore: cast_nullable_to_non_nullable
              as int,
      completedExercises: null == completedExercises
          ? _value.completedExercises
          : completedExercises // ignore: cast_nullable_to_non_nullable
              as int,
      isCompleted: null == isCompleted
          ? _value.isCompleted
          : isCompleted // ignore: cast_nullable_to_non_nullable
              as bool,
      progressPercent: null == progressPercent
          ? _value.progressPercent
          : progressPercent // ignore: cast_nullable_to_non_nullable
              as double,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$LessonProgressImplCopyWith<$Res>
    implements $LessonProgressCopyWith<$Res> {
  factory _$$LessonProgressImplCopyWith(_$LessonProgressImpl value,
          $Res Function(_$LessonProgressImpl) then) =
      __$$LessonProgressImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {int lessonId,
      String title,
      int sequence,
      int totalExercises,
      int completedExercises,
      bool isCompleted,
      double progressPercent});
}

/// @nodoc
class __$$LessonProgressImplCopyWithImpl<$Res>
    extends _$LessonProgressCopyWithImpl<$Res, _$LessonProgressImpl>
    implements _$$LessonProgressImplCopyWith<$Res> {
  __$$LessonProgressImplCopyWithImpl(
      _$LessonProgressImpl _value, $Res Function(_$LessonProgressImpl) _then)
      : super(_value, _then);

  /// Create a copy of LessonProgress
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? lessonId = null,
    Object? title = null,
    Object? sequence = null,
    Object? totalExercises = null,
    Object? completedExercises = null,
    Object? isCompleted = null,
    Object? progressPercent = null,
  }) {
    return _then(_$LessonProgressImpl(
      lessonId: null == lessonId
          ? _value.lessonId
          : lessonId // ignore: cast_nullable_to_non_nullable
              as int,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      sequence: null == sequence
          ? _value.sequence
          : sequence // ignore: cast_nullable_to_non_nullable
              as int,
      totalExercises: null == totalExercises
          ? _value.totalExercises
          : totalExercises // ignore: cast_nullable_to_non_nullable
              as int,
      completedExercises: null == completedExercises
          ? _value.completedExercises
          : completedExercises // ignore: cast_nullable_to_non_nullable
              as int,
      isCompleted: null == isCompleted
          ? _value.isCompleted
          : isCompleted // ignore: cast_nullable_to_non_nullable
              as bool,
      progressPercent: null == progressPercent
          ? _value.progressPercent
          : progressPercent // ignore: cast_nullable_to_non_nullable
              as double,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$LessonProgressImpl implements _LessonProgress {
  const _$LessonProgressImpl(
      {required this.lessonId,
      required this.title,
      required this.sequence,
      required this.totalExercises,
      required this.completedExercises,
      required this.isCompleted,
      required this.progressPercent});

  factory _$LessonProgressImpl.fromJson(Map<String, dynamic> json) =>
      _$$LessonProgressImplFromJson(json);

  @override
  final int lessonId;
  @override
  final String title;
  @override
  final int sequence;
  @override
  final int totalExercises;
  @override
  final int completedExercises;
  @override
  final bool isCompleted;
  @override
  final double progressPercent;

  @override
  String toString() {
    return 'LessonProgress(lessonId: $lessonId, title: $title, sequence: $sequence, totalExercises: $totalExercises, completedExercises: $completedExercises, isCompleted: $isCompleted, progressPercent: $progressPercent)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LessonProgressImpl &&
            (identical(other.lessonId, lessonId) ||
                other.lessonId == lessonId) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.sequence, sequence) ||
                other.sequence == sequence) &&
            (identical(other.totalExercises, totalExercises) ||
                other.totalExercises == totalExercises) &&
            (identical(other.completedExercises, completedExercises) ||
                other.completedExercises == completedExercises) &&
            (identical(other.isCompleted, isCompleted) ||
                other.isCompleted == isCompleted) &&
            (identical(other.progressPercent, progressPercent) ||
                other.progressPercent == progressPercent));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, lessonId, title, sequence,
      totalExercises, completedExercises, isCompleted, progressPercent);

  /// Create a copy of LessonProgress
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$LessonProgressImplCopyWith<_$LessonProgressImpl> get copyWith =>
      __$$LessonProgressImplCopyWithImpl<_$LessonProgressImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$LessonProgressImplToJson(
      this,
    );
  }
}

abstract class _LessonProgress implements LessonProgress {
  const factory _LessonProgress(
      {required final int lessonId,
      required final String title,
      required final int sequence,
      required final int totalExercises,
      required final int completedExercises,
      required final bool isCompleted,
      required final double progressPercent}) = _$LessonProgressImpl;

  factory _LessonProgress.fromJson(Map<String, dynamic> json) =
      _$LessonProgressImpl.fromJson;

  @override
  int get lessonId;
  @override
  String get title;
  @override
  int get sequence;
  @override
  int get totalExercises;
  @override
  int get completedExercises;
  @override
  bool get isCompleted;
  @override
  double get progressPercent;

  /// Create a copy of LessonProgress
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$LessonProgressImplCopyWith<_$LessonProgressImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

CourseProgress _$CourseProgressFromJson(Map<String, dynamic> json) {
  return _CourseProgress.fromJson(json);
}

/// @nodoc
mixin _$CourseProgress {
  int get courseId => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  double get totalProgress => throw _privateConstructorUsedError;
  List<LessonProgress> get lessons => throw _privateConstructorUsedError;

  /// Serializes this CourseProgress to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CourseProgress
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CourseProgressCopyWith<CourseProgress> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CourseProgressCopyWith<$Res> {
  factory $CourseProgressCopyWith(
          CourseProgress value, $Res Function(CourseProgress) then) =
      _$CourseProgressCopyWithImpl<$Res, CourseProgress>;
  @useResult
  $Res call(
      {int courseId,
      String title,
      double totalProgress,
      List<LessonProgress> lessons});
}

/// @nodoc
class _$CourseProgressCopyWithImpl<$Res, $Val extends CourseProgress>
    implements $CourseProgressCopyWith<$Res> {
  _$CourseProgressCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CourseProgress
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? courseId = null,
    Object? title = null,
    Object? totalProgress = null,
    Object? lessons = null,
  }) {
    return _then(_value.copyWith(
      courseId: null == courseId
          ? _value.courseId
          : courseId // ignore: cast_nullable_to_non_nullable
              as int,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      totalProgress: null == totalProgress
          ? _value.totalProgress
          : totalProgress // ignore: cast_nullable_to_non_nullable
              as double,
      lessons: null == lessons
          ? _value.lessons
          : lessons // ignore: cast_nullable_to_non_nullable
              as List<LessonProgress>,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$CourseProgressImplCopyWith<$Res>
    implements $CourseProgressCopyWith<$Res> {
  factory _$$CourseProgressImplCopyWith(_$CourseProgressImpl value,
          $Res Function(_$CourseProgressImpl) then) =
      __$$CourseProgressImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {int courseId,
      String title,
      double totalProgress,
      List<LessonProgress> lessons});
}

/// @nodoc
class __$$CourseProgressImplCopyWithImpl<$Res>
    extends _$CourseProgressCopyWithImpl<$Res, _$CourseProgressImpl>
    implements _$$CourseProgressImplCopyWith<$Res> {
  __$$CourseProgressImplCopyWithImpl(
      _$CourseProgressImpl _value, $Res Function(_$CourseProgressImpl) _then)
      : super(_value, _then);

  /// Create a copy of CourseProgress
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? courseId = null,
    Object? title = null,
    Object? totalProgress = null,
    Object? lessons = null,
  }) {
    return _then(_$CourseProgressImpl(
      courseId: null == courseId
          ? _value.courseId
          : courseId // ignore: cast_nullable_to_non_nullable
              as int,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      totalProgress: null == totalProgress
          ? _value.totalProgress
          : totalProgress // ignore: cast_nullable_to_non_nullable
              as double,
      lessons: null == lessons
          ? _value._lessons
          : lessons // ignore: cast_nullable_to_non_nullable
              as List<LessonProgress>,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$CourseProgressImpl implements _CourseProgress {
  const _$CourseProgressImpl(
      {required this.courseId,
      required this.title,
      required this.totalProgress,
      required final List<LessonProgress> lessons})
      : _lessons = lessons;

  factory _$CourseProgressImpl.fromJson(Map<String, dynamic> json) =>
      _$$CourseProgressImplFromJson(json);

  @override
  final int courseId;
  @override
  final String title;
  @override
  final double totalProgress;
  final List<LessonProgress> _lessons;
  @override
  List<LessonProgress> get lessons {
    if (_lessons is EqualUnmodifiableListView) return _lessons;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_lessons);
  }

  @override
  String toString() {
    return 'CourseProgress(courseId: $courseId, title: $title, totalProgress: $totalProgress, lessons: $lessons)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CourseProgressImpl &&
            (identical(other.courseId, courseId) ||
                other.courseId == courseId) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.totalProgress, totalProgress) ||
                other.totalProgress == totalProgress) &&
            const DeepCollectionEquality().equals(other._lessons, _lessons));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, courseId, title, totalProgress,
      const DeepCollectionEquality().hash(_lessons));

  /// Create a copy of CourseProgress
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CourseProgressImplCopyWith<_$CourseProgressImpl> get copyWith =>
      __$$CourseProgressImplCopyWithImpl<_$CourseProgressImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$CourseProgressImplToJson(
      this,
    );
  }
}

abstract class _CourseProgress implements CourseProgress {
  const factory _CourseProgress(
      {required final int courseId,
      required final String title,
      required final double totalProgress,
      required final List<LessonProgress> lessons}) = _$CourseProgressImpl;

  factory _CourseProgress.fromJson(Map<String, dynamic> json) =
      _$CourseProgressImpl.fromJson;

  @override
  int get courseId;
  @override
  String get title;
  @override
  double get totalProgress;
  @override
  List<LessonProgress> get lessons;

  /// Create a copy of CourseProgress
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CourseProgressImplCopyWith<_$CourseProgressImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
