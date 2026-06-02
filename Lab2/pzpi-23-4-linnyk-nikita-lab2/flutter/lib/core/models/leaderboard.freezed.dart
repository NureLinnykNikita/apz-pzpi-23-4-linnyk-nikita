// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'leaderboard.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

LeaderboardEntry _$LeaderboardEntryFromJson(Map<String, dynamic> json) {
  return _LeaderboardEntry.fromJson(json);
}

/// @nodoc
mixin _$LeaderboardEntry {
  int get rank => throw _privateConstructorUsedError;
  String get userId => throw _privateConstructorUsedError;
  String get username => throw _privateConstructorUsedError;
  String? get avatarUrl => throw _privateConstructorUsedError;
  int get streak => throw _privateConstructorUsedError;
  int get totalPoints => throw _privateConstructorUsedError;
  bool get isCurrentUser => throw _privateConstructorUsedError;

  /// Serializes this LeaderboardEntry to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of LeaderboardEntry
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $LeaderboardEntryCopyWith<LeaderboardEntry> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $LeaderboardEntryCopyWith<$Res> {
  factory $LeaderboardEntryCopyWith(
          LeaderboardEntry value, $Res Function(LeaderboardEntry) then) =
      _$LeaderboardEntryCopyWithImpl<$Res, LeaderboardEntry>;
  @useResult
  $Res call(
      {int rank,
      String userId,
      String username,
      String? avatarUrl,
      int streak,
      int totalPoints,
      bool isCurrentUser});
}

/// @nodoc
class _$LeaderboardEntryCopyWithImpl<$Res, $Val extends LeaderboardEntry>
    implements $LeaderboardEntryCopyWith<$Res> {
  _$LeaderboardEntryCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of LeaderboardEntry
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? rank = null,
    Object? userId = null,
    Object? username = null,
    Object? avatarUrl = freezed,
    Object? streak = null,
    Object? totalPoints = null,
    Object? isCurrentUser = null,
  }) {
    return _then(_value.copyWith(
      rank: null == rank
          ? _value.rank
          : rank // ignore: cast_nullable_to_non_nullable
              as int,
      userId: null == userId
          ? _value.userId
          : userId // ignore: cast_nullable_to_non_nullable
              as String,
      username: null == username
          ? _value.username
          : username // ignore: cast_nullable_to_non_nullable
              as String,
      avatarUrl: freezed == avatarUrl
          ? _value.avatarUrl
          : avatarUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      streak: null == streak
          ? _value.streak
          : streak // ignore: cast_nullable_to_non_nullable
              as int,
      totalPoints: null == totalPoints
          ? _value.totalPoints
          : totalPoints // ignore: cast_nullable_to_non_nullable
              as int,
      isCurrentUser: null == isCurrentUser
          ? _value.isCurrentUser
          : isCurrentUser // ignore: cast_nullable_to_non_nullable
              as bool,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$LeaderboardEntryImplCopyWith<$Res>
    implements $LeaderboardEntryCopyWith<$Res> {
  factory _$$LeaderboardEntryImplCopyWith(_$LeaderboardEntryImpl value,
          $Res Function(_$LeaderboardEntryImpl) then) =
      __$$LeaderboardEntryImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {int rank,
      String userId,
      String username,
      String? avatarUrl,
      int streak,
      int totalPoints,
      bool isCurrentUser});
}

/// @nodoc
class __$$LeaderboardEntryImplCopyWithImpl<$Res>
    extends _$LeaderboardEntryCopyWithImpl<$Res, _$LeaderboardEntryImpl>
    implements _$$LeaderboardEntryImplCopyWith<$Res> {
  __$$LeaderboardEntryImplCopyWithImpl(_$LeaderboardEntryImpl _value,
      $Res Function(_$LeaderboardEntryImpl) _then)
      : super(_value, _then);

  /// Create a copy of LeaderboardEntry
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? rank = null,
    Object? userId = null,
    Object? username = null,
    Object? avatarUrl = freezed,
    Object? streak = null,
    Object? totalPoints = null,
    Object? isCurrentUser = null,
  }) {
    return _then(_$LeaderboardEntryImpl(
      rank: null == rank
          ? _value.rank
          : rank // ignore: cast_nullable_to_non_nullable
              as int,
      userId: null == userId
          ? _value.userId
          : userId // ignore: cast_nullable_to_non_nullable
              as String,
      username: null == username
          ? _value.username
          : username // ignore: cast_nullable_to_non_nullable
              as String,
      avatarUrl: freezed == avatarUrl
          ? _value.avatarUrl
          : avatarUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      streak: null == streak
          ? _value.streak
          : streak // ignore: cast_nullable_to_non_nullable
              as int,
      totalPoints: null == totalPoints
          ? _value.totalPoints
          : totalPoints // ignore: cast_nullable_to_non_nullable
              as int,
      isCurrentUser: null == isCurrentUser
          ? _value.isCurrentUser
          : isCurrentUser // ignore: cast_nullable_to_non_nullable
              as bool,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$LeaderboardEntryImpl implements _LeaderboardEntry {
  const _$LeaderboardEntryImpl(
      {required this.rank,
      required this.userId,
      required this.username,
      this.avatarUrl,
      required this.streak,
      required this.totalPoints,
      required this.isCurrentUser});

  factory _$LeaderboardEntryImpl.fromJson(Map<String, dynamic> json) =>
      _$$LeaderboardEntryImplFromJson(json);

  @override
  final int rank;
  @override
  final String userId;
  @override
  final String username;
  @override
  final String? avatarUrl;
  @override
  final int streak;
  @override
  final int totalPoints;
  @override
  final bool isCurrentUser;

  @override
  String toString() {
    return 'LeaderboardEntry(rank: $rank, userId: $userId, username: $username, avatarUrl: $avatarUrl, streak: $streak, totalPoints: $totalPoints, isCurrentUser: $isCurrentUser)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LeaderboardEntryImpl &&
            (identical(other.rank, rank) || other.rank == rank) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.username, username) ||
                other.username == username) &&
            (identical(other.avatarUrl, avatarUrl) ||
                other.avatarUrl == avatarUrl) &&
            (identical(other.streak, streak) || other.streak == streak) &&
            (identical(other.totalPoints, totalPoints) ||
                other.totalPoints == totalPoints) &&
            (identical(other.isCurrentUser, isCurrentUser) ||
                other.isCurrentUser == isCurrentUser));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, rank, userId, username,
      avatarUrl, streak, totalPoints, isCurrentUser);

  /// Create a copy of LeaderboardEntry
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$LeaderboardEntryImplCopyWith<_$LeaderboardEntryImpl> get copyWith =>
      __$$LeaderboardEntryImplCopyWithImpl<_$LeaderboardEntryImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$LeaderboardEntryImplToJson(
      this,
    );
  }
}

abstract class _LeaderboardEntry implements LeaderboardEntry {
  const factory _LeaderboardEntry(
      {required final int rank,
      required final String userId,
      required final String username,
      final String? avatarUrl,
      required final int streak,
      required final int totalPoints,
      required final bool isCurrentUser}) = _$LeaderboardEntryImpl;

  factory _LeaderboardEntry.fromJson(Map<String, dynamic> json) =
      _$LeaderboardEntryImpl.fromJson;

  @override
  int get rank;
  @override
  String get userId;
  @override
  String get username;
  @override
  String? get avatarUrl;
  @override
  int get streak;
  @override
  int get totalPoints;
  @override
  bool get isCurrentUser;

  /// Create a copy of LeaderboardEntry
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$LeaderboardEntryImplCopyWith<_$LeaderboardEntryImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

LeaderboardResponse _$LeaderboardResponseFromJson(Map<String, dynamic> json) {
  return _LeaderboardResponse.fromJson(json);
}

/// @nodoc
mixin _$LeaderboardResponse {
  List<LeaderboardEntry> get entries => throw _privateConstructorUsedError;
  LeaderboardEntry? get currentUserRow => throw _privateConstructorUsedError;

  /// Serializes this LeaderboardResponse to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of LeaderboardResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $LeaderboardResponseCopyWith<LeaderboardResponse> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $LeaderboardResponseCopyWith<$Res> {
  factory $LeaderboardResponseCopyWith(
          LeaderboardResponse value, $Res Function(LeaderboardResponse) then) =
      _$LeaderboardResponseCopyWithImpl<$Res, LeaderboardResponse>;
  @useResult
  $Res call({List<LeaderboardEntry> entries, LeaderboardEntry? currentUserRow});

  $LeaderboardEntryCopyWith<$Res>? get currentUserRow;
}

/// @nodoc
class _$LeaderboardResponseCopyWithImpl<$Res, $Val extends LeaderboardResponse>
    implements $LeaderboardResponseCopyWith<$Res> {
  _$LeaderboardResponseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of LeaderboardResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? entries = null,
    Object? currentUserRow = freezed,
  }) {
    return _then(_value.copyWith(
      entries: null == entries
          ? _value.entries
          : entries // ignore: cast_nullable_to_non_nullable
              as List<LeaderboardEntry>,
      currentUserRow: freezed == currentUserRow
          ? _value.currentUserRow
          : currentUserRow // ignore: cast_nullable_to_non_nullable
              as LeaderboardEntry?,
    ) as $Val);
  }

  /// Create a copy of LeaderboardResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $LeaderboardEntryCopyWith<$Res>? get currentUserRow {
    if (_value.currentUserRow == null) {
      return null;
    }

    return $LeaderboardEntryCopyWith<$Res>(_value.currentUserRow!, (value) {
      return _then(_value.copyWith(currentUserRow: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$LeaderboardResponseImplCopyWith<$Res>
    implements $LeaderboardResponseCopyWith<$Res> {
  factory _$$LeaderboardResponseImplCopyWith(_$LeaderboardResponseImpl value,
          $Res Function(_$LeaderboardResponseImpl) then) =
      __$$LeaderboardResponseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({List<LeaderboardEntry> entries, LeaderboardEntry? currentUserRow});

  @override
  $LeaderboardEntryCopyWith<$Res>? get currentUserRow;
}

/// @nodoc
class __$$LeaderboardResponseImplCopyWithImpl<$Res>
    extends _$LeaderboardResponseCopyWithImpl<$Res, _$LeaderboardResponseImpl>
    implements _$$LeaderboardResponseImplCopyWith<$Res> {
  __$$LeaderboardResponseImplCopyWithImpl(_$LeaderboardResponseImpl _value,
      $Res Function(_$LeaderboardResponseImpl) _then)
      : super(_value, _then);

  /// Create a copy of LeaderboardResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? entries = null,
    Object? currentUserRow = freezed,
  }) {
    return _then(_$LeaderboardResponseImpl(
      entries: null == entries
          ? _value._entries
          : entries // ignore: cast_nullable_to_non_nullable
              as List<LeaderboardEntry>,
      currentUserRow: freezed == currentUserRow
          ? _value.currentUserRow
          : currentUserRow // ignore: cast_nullable_to_non_nullable
              as LeaderboardEntry?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$LeaderboardResponseImpl implements _LeaderboardResponse {
  const _$LeaderboardResponseImpl(
      {required final List<LeaderboardEntry> entries, this.currentUserRow})
      : _entries = entries;

  factory _$LeaderboardResponseImpl.fromJson(Map<String, dynamic> json) =>
      _$$LeaderboardResponseImplFromJson(json);

  final List<LeaderboardEntry> _entries;
  @override
  List<LeaderboardEntry> get entries {
    if (_entries is EqualUnmodifiableListView) return _entries;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_entries);
  }

  @override
  final LeaderboardEntry? currentUserRow;

  @override
  String toString() {
    return 'LeaderboardResponse(entries: $entries, currentUserRow: $currentUserRow)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LeaderboardResponseImpl &&
            const DeepCollectionEquality().equals(other._entries, _entries) &&
            (identical(other.currentUserRow, currentUserRow) ||
                other.currentUserRow == currentUserRow));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType,
      const DeepCollectionEquality().hash(_entries), currentUserRow);

  /// Create a copy of LeaderboardResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$LeaderboardResponseImplCopyWith<_$LeaderboardResponseImpl> get copyWith =>
      __$$LeaderboardResponseImplCopyWithImpl<_$LeaderboardResponseImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$LeaderboardResponseImplToJson(
      this,
    );
  }
}

abstract class _LeaderboardResponse implements LeaderboardResponse {
  const factory _LeaderboardResponse(
      {required final List<LeaderboardEntry> entries,
      final LeaderboardEntry? currentUserRow}) = _$LeaderboardResponseImpl;

  factory _LeaderboardResponse.fromJson(Map<String, dynamic> json) =
      _$LeaderboardResponseImpl.fromJson;

  @override
  List<LeaderboardEntry> get entries;
  @override
  LeaderboardEntry? get currentUserRow;

  /// Create a copy of LeaderboardResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$LeaderboardResponseImplCopyWith<_$LeaderboardResponseImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
