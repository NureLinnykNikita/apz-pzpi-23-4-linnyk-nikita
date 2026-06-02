import 'package:freezed_annotation/freezed_annotation.dart';

part 'chat.freezed.dart';
part 'chat.g.dart';

@freezed
class Message with _$Message {
  const factory Message({
    required String messageId,
    required String conversationId,
    required String senderType,
    String? senderId,
    required String content,
    required String createdAt,
  }) = _Message;

  factory Message.fromJson(Map<String, dynamic> json) =>
      _$MessageFromJson(json);
}

@freezed
class Conversation with _$Conversation {
  const factory Conversation({
    required String conversationId,
    String? title,
    required bool isGroup,
    required String createdAt,
  }) = _Conversation;

  factory Conversation.fromJson(Map<String, dynamic> json) =>
      _$ConversationFromJson(json);
}
