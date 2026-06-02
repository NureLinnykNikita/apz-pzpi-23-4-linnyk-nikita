import 'package:freezed_annotation/freezed_annotation.dart';
import 'language.dart';

part 'user_profile.freezed.dart';
part 'user_profile.g.dart';

@freezed
class UserProfile with _$UserProfile {
  const factory UserProfile({
    required String userId,
    required String username,
    required String email,
    required String role,
    String? avatarUrl,
    String? bio,
    required int streak,
    required int dailyGoalExercises,
    Language? nativeLanguage,
    required String createdAt,
  }) = _UserProfile;

  factory UserProfile.fromJson(Map<String, dynamic> json) =>
      _$UserProfileFromJson(json);
}
