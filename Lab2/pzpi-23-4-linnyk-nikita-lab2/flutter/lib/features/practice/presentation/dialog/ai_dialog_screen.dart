import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/models/chat.dart';
import '../../../../core/network/api_error.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/loading_indicator.dart';

// ─── Repository ──────────────────────────────────────────────────────────────

class ChatRepository {
  final Dio _dio;
  ChatRepository(this._dio);

  Future<Conversation> createConversation() async {
    try {
      final res = await _dio.post('/conversations', data: {});
      return Conversation.fromJson(
          res.data['conversation'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }

  Future<List<Message>> getMessages(String conversationId) async {
    try {
      final res =
          await _dio.get('/conversations/$conversationId/messages');
      final list = (res.data['messages'] ?? res.data) as List;
      return list
          .map((e) => Message.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }

  Future<Message> sendMessage(
      String conversationId, String content) async {
    try {
      final res = await _dio.post(
          '/conversations/$conversationId/messages',
          data: {'content': content});
      return Message.fromJson(
          res.data['message'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw AppException.fromDio(e);
    }
  }
}

final chatRepositoryProvider = Provider<ChatRepository>((ref) {
  return ChatRepository(ref.read(dioProvider));
});

// ─── Screen ──────────────────────────────────────────────────────────────────

class AiDialogScreen extends ConsumerStatefulWidget {
  const AiDialogScreen({super.key});

  @override
  ConsumerState<AiDialogScreen> createState() => _AiDialogScreenState();
}

class _AiDialogScreenState extends ConsumerState<AiDialogScreen> {
  Conversation? _conversation;
  final List<Message> _messages = [];
  final _ctrl = TextEditingController();
  final _scroll = ScrollController();
  bool _isLoading = true;
  bool _isSending = false;
  String? _error;
  Timer? _pollTimer;

  @override
  void initState() {
    super.initState();
    _initConversation();
  }

  Future<void> _initConversation() async {
    try {
      final repo = ref.read(chatRepositoryProvider);
      final conv = await repo.createConversation();
      final msgs = await repo.getMessages(conv.conversationId);
      if (mounted) {
        setState(() {
          _conversation = conv;
          _messages.addAll(msgs);
          _isLoading = false;
        });
        _startPolling();
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  void _startPolling() {
    _pollTimer = Timer.periodic(const Duration(seconds: 3), (_) async {
      if (_conversation == null) return;
      try {
        final msgs = await ref
            .read(chatRepositoryProvider)
            .getMessages(_conversation!.conversationId);
        if (mounted && msgs.length > _messages.length) {
          setState(() {
            _messages
              ..clear()
              ..addAll(msgs);
          });
          _scrollToBottom();
        }
      } catch (_) {}
    });
  }

  Future<void> _send() async {
    final content = _ctrl.text.trim();
    if (content.isEmpty || _conversation == null) return;

    _ctrl.clear();
    setState(() => _isSending = true);

    // Optimistic UI: add user message immediately
    final optimistic = Message(
      messageId: 'tmp_${DateTime.now().millisecondsSinceEpoch}',
      conversationId: _conversation!.conversationId,
      senderType: 'user',
      senderId: null,
      content: content,
      createdAt: DateTime.now().toIso8601String(),
    );
    setState(() => _messages.add(optimistic));
    _scrollToBottom();

    try {
      await ref
          .read(chatRepositoryProvider)
          .sendMessage(_conversation!.conversationId, content);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(
          _scroll.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _ctrl.dispose();
    _scroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: LoadingIndicator());
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.s7),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline,
                  color: AppColors.error, size: 48),
              const SizedBox(height: AppSpacing.s4),
              Text(_error!,
                  style:
                      AppTextStyles.bodySm.copyWith(color: AppColors.error),
                  textAlign: TextAlign.center),
              const SizedBox(height: AppSpacing.s5),
              TextButton(
                onPressed: () {
                  setState(() {
                    _error = null;
                    _isLoading = true;
                  });
                  _initConversation();
                },
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      children: [
        // Header
        Container(
          padding: const EdgeInsets.all(AppSpacing.s5),
          decoration: const BoxDecoration(
            border: Border(bottom: BorderSide(color: AppColors.border)),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: const BoxDecoration(
                  color: AppColors.panelSoft,
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: Text('AI',
                    style: AppTextStyles.labelSm
                        .copyWith(color: AppColors.accent)),
              ),
              const SizedBox(width: AppSpacing.s4),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('AI Conversation Partner',
                      style: AppTextStyles.labelMd),
                  Text('Practice your language skills',
                      style: AppTextStyles.mutedSm),
                ],
              ),
            ],
          ),
        ),

        // Messages
        Expanded(
          child: ListView.builder(
            controller: _scroll,
            padding: const EdgeInsets.all(AppSpacing.s5),
            itemCount: _messages.length,
            itemBuilder: (context, i) =>
                _MessageBubble(message: _messages[i]),
          ),
        ),

        // Input
        Container(
          padding: EdgeInsets.only(
            left: AppSpacing.s4,
            right: AppSpacing.s4,
            top: AppSpacing.s3,
            bottom: AppSpacing.s3 +
                MediaQuery.of(context).viewInsets.bottom,
          ),
          decoration: const BoxDecoration(
            color: AppColors.panelDeep,
            border: Border(top: BorderSide(color: AppColors.border)),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _ctrl,
                  maxLines: null,
                  maxLength: 500,
                  buildCounter: (_, {required currentLength, required isFocused, maxLength}) => null,
                  style: AppTextStyles.bodyMd,
                  decoration: const InputDecoration(
                    hintText: 'Type a message…',
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    fillColor: Colors.transparent,
                    contentPadding: EdgeInsets.symmetric(
                        horizontal: AppSpacing.s4, vertical: 10),
                  ),
                  onSubmitted: (_) => _send(),
                ),
              ),
              const SizedBox(width: AppSpacing.s2),
              _isSending
                  ? const LoadingIndicator(size: 20)
                  : IconButton(
                      icon: const Icon(Icons.send, color: AppColors.accent),
                      onPressed: _send,
                    ),
            ],
          ),
        ),
      ],
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final Message message;
  const _MessageBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    final isUser = message.senderType == 'user';
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.s4),
      child: Align(
        alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            if (!isUser) ...[
              Container(
                width: 28,
                height: 28,
                decoration: const BoxDecoration(
                  color: AppColors.panelSoft,
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: Text('AI',
                    style: AppTextStyles.xs
                        .copyWith(color: AppColors.accent, fontSize: 9)),
              ),
              const SizedBox(width: AppSpacing.s2),
            ],
            Flexible(
              child: Container(
                constraints: BoxConstraints(
                  maxWidth: MediaQuery.of(context).size.width * 0.72,
                ),
                padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.s4, vertical: AppSpacing.s3),
                decoration: BoxDecoration(
                  color:
                      isUser ? AppColors.accent : AppColors.panelSoft,
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(AppSpacing.radiusMd),
                    topRight: const Radius.circular(AppSpacing.radiusMd),
                    bottomLeft: Radius.circular(
                        isUser ? AppSpacing.radiusMd : 4),
                    bottomRight: Radius.circular(
                        isUser ? 4 : AppSpacing.radiusMd),
                  ),
                ),
                child: Text(
                  message.content,
                  style: AppTextStyles.bodyMd.copyWith(
                    color: isUser ? AppColors.accentInk : AppColors.text,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
