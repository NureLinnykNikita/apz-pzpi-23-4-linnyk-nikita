// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'chat.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$MessageImpl _$$MessageImplFromJson(Map<String, dynamic> json) =>
    _$MessageImpl(
      messageId: json['messageId'] as String,
      conversationId: json['conversationId'] as String,
      senderType: json['senderType'] as String,
      senderId: json['senderId'] as String?,
      content: json['content'] as String,
      createdAt: json['createdAt'] as String,
    );

Map<String, dynamic> _$$MessageImplToJson(_$MessageImpl instance) =>
    <String, dynamic>{
      'messageId': instance.messageId,
      'conversationId': instance.conversationId,
      'senderType': instance.senderType,
      'senderId': instance.senderId,
      'content': instance.content,
      'createdAt': instance.createdAt,
    };

_$ConversationImpl _$$ConversationImplFromJson(Map<String, dynamic> json) =>
    _$ConversationImpl(
      conversationId: json['conversationId'] as String,
      title: json['title'] as String?,
      isGroup: json['isGroup'] as bool,
      createdAt: json['createdAt'] as String,
    );

Map<String, dynamic> _$$ConversationImplToJson(_$ConversationImpl instance) =>
    <String, dynamic>{
      'conversationId': instance.conversationId,
      'title': instance.title,
      'isGroup': instance.isGroup,
      'createdAt': instance.createdAt,
    };
