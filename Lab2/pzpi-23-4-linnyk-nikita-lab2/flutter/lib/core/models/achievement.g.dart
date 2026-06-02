// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'achievement.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$AchievementImpl _$$AchievementImplFromJson(Map<String, dynamic> json) =>
    _$AchievementImpl(
      achievementId: (json['achievementId'] as num).toInt(),
      code: json['code'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      iconUrl: json['iconUrl'] as String?,
      earnedAt: json['earnedAt'] as String?,
    );

Map<String, dynamic> _$$AchievementImplToJson(_$AchievementImpl instance) =>
    <String, dynamic>{
      'achievementId': instance.achievementId,
      'code': instance.code,
      'title': instance.title,
      'description': instance.description,
      'iconUrl': instance.iconUrl,
      'earnedAt': instance.earnedAt,
    };
