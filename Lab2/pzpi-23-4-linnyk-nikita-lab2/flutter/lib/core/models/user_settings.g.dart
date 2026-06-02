// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_settings.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserSettingsImpl _$$UserSettingsImplFromJson(Map<String, dynamic> json) =>
    _$UserSettingsImpl(
      dailyGoalExercises: (json['dailyGoalExercises'] as num).toInt(),
      notificationsEnabled: json['notificationsEnabled'] as bool,
      reminderTime: json['reminderTime'] as String?,
    );

Map<String, dynamic> _$$UserSettingsImplToJson(_$UserSettingsImpl instance) =>
    <String, dynamic>{
      'dailyGoalExercises': instance.dailyGoalExercises,
      'notificationsEnabled': instance.notificationsEnabled,
      'reminderTime': instance.reminderTime,
    };
