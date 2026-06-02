// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_profile.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserProfileImpl _$$UserProfileImplFromJson(Map<String, dynamic> json) =>
    _$UserProfileImpl(
      userId: json['userId'] as String,
      username: json['username'] as String,
      email: json['email'] as String,
      role: json['role'] as String,
      avatarUrl: json['avatarUrl'] as String?,
      bio: json['bio'] as String?,
      streak: (json['streak'] as num).toInt(),
      dailyGoalExercises: (json['dailyGoalExercises'] as num).toInt(),
      nativeLanguage: json['nativeLanguage'] == null
          ? null
          : Language.fromJson(json['nativeLanguage'] as Map<String, dynamic>),
      createdAt: json['createdAt'] as String,
    );

Map<String, dynamic> _$$UserProfileImplToJson(_$UserProfileImpl instance) =>
    <String, dynamic>{
      'userId': instance.userId,
      'username': instance.username,
      'email': instance.email,
      'role': instance.role,
      'avatarUrl': instance.avatarUrl,
      'bio': instance.bio,
      'streak': instance.streak,
      'dailyGoalExercises': instance.dailyGoalExercises,
      'nativeLanguage': instance.nativeLanguage,
      'createdAt': instance.createdAt,
    };
