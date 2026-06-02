import 'package:freezed_annotation/freezed_annotation.dart';

part 'leaderboard.freezed.dart';
part 'leaderboard.g.dart';

@freezed
class LeaderboardEntry with _$LeaderboardEntry {
  const factory LeaderboardEntry({
    required int rank,
    required String userId,
    required String username,
    String? avatarUrl,
    required int streak,
    required int totalPoints,
    required bool isCurrentUser,
  }) = _LeaderboardEntry;

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) =>
      _$LeaderboardEntryFromJson(json);
}

@freezed
class LeaderboardResponse with _$LeaderboardResponse {
  const factory LeaderboardResponse({
    required List<LeaderboardEntry> entries,
    LeaderboardEntry? currentUserRow,
  }) = _LeaderboardResponse;

  factory LeaderboardResponse.fromJson(Map<String, dynamic> json) =>
      _$LeaderboardResponseFromJson(json);
}
