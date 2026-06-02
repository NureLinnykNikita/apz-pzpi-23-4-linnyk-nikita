// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'leaderboard.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$LeaderboardEntryImpl _$$LeaderboardEntryImplFromJson(
        Map<String, dynamic> json) =>
    _$LeaderboardEntryImpl(
      rank: (json['rank'] as num).toInt(),
      userId: json['userId'] as String,
      username: json['username'] as String,
      avatarUrl: json['avatarUrl'] as String?,
      streak: (json['streak'] as num).toInt(),
      totalPoints: (json['totalPoints'] as num).toInt(),
      isCurrentUser: json['isCurrentUser'] as bool,
    );

Map<String, dynamic> _$$LeaderboardEntryImplToJson(
        _$LeaderboardEntryImpl instance) =>
    <String, dynamic>{
      'rank': instance.rank,
      'userId': instance.userId,
      'username': instance.username,
      'avatarUrl': instance.avatarUrl,
      'streak': instance.streak,
      'totalPoints': instance.totalPoints,
      'isCurrentUser': instance.isCurrentUser,
    };

_$LeaderboardResponseImpl _$$LeaderboardResponseImplFromJson(
        Map<String, dynamic> json) =>
    _$LeaderboardResponseImpl(
      entries: (json['entries'] as List<dynamic>)
          .map((e) => LeaderboardEntry.fromJson(e as Map<String, dynamic>))
          .toList(),
      currentUserRow: json['currentUserRow'] == null
          ? null
          : LeaderboardEntry.fromJson(
              json['currentUserRow'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$$LeaderboardResponseImplToJson(
        _$LeaderboardResponseImpl instance) =>
    <String, dynamic>{
      'entries': instance.entries,
      'currentUserRow': instance.currentUserRow,
    };
