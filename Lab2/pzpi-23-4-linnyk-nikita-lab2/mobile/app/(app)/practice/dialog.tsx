import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, space, radius } from '../../../src/theme';
import { createConversation, getMessages, sendMessage } from '../../../src/api/chat';
import { Message } from '../../../src/types/api';
import { useAuthStore } from '../../../src/store/auth.store';

export default function AiDialogScreen() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    createConversation()
      .then((conv) => setConversationId(conv.conversationId))
      .catch(console.error);
  }, []);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId!),
    enabled: !!conversationId,
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => sendMessage(conversationId!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      setInput('');
    },
  });

  const handleSend = () => {
    const text = input.trim();
    if (!text || !conversationId || sendMutation.isPending) return;
    sendMutation.mutate(text);
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Language Partner</Text>
          <Text style={styles.headerSub}>Practice conversation • Italian</Text>
        </View>

        {!conversationId || isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(m) => m.messageId}
            contentContainerStyle={styles.messageList}
            renderItem={({ item }) => (
              <MessageBubble message={item} isOwn={item.senderId === user?.userId} />
            )}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Text style={styles.emptyChatText}>Start the conversation!</Text>
                <Text style={styles.emptyChatSub}>
                  Say hello or ask your AI partner a question.
                </Text>
              </View>
            }
          />
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message…"
            placeholderTextColor={colors.muted}
            multiline
            maxLength={500}
            selectionColor={colors.accent}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || sendMutation.isPending}
          >
            {sendMutation.isPending ? (
              <ActivityIndicator color={colors.accentInk} size="small" />
            ) : (
              <Text style={styles.sendBtnText}>→</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <View style={[styles.bubbleRow, isOwn ? styles.bubbleRowOwn : styles.bubbleRowAi]}>
      {!isOwn && (
        <View style={styles.aiAvatar}>
          <Text style={styles.aiAvatarText}>AI</Text>
        </View>
      )}
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleAi]}>
        <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: space[5],
    paddingVertical: space[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 2,
  },
  headerTitle: { fontSize: fontSize.base, fontWeight: '700', color: colors.text },
  headerSub: { fontSize: fontSize.xs, color: colors.muted },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messageList: {
    paddingHorizontal: space[4],
    paddingVertical: space[4],
    gap: space[3],
    flexGrow: 1,
  },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space[2] },
  bubbleRowOwn: { justifyContent: 'flex-end' },
  bubbleRowAi: { justifyContent: 'flex-start' },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  aiAvatarText: { fontSize: 9, fontWeight: '700', color: colors.text },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: space[4],
    paddingVertical: space[2] + 2,
    borderRadius: radius.lg,
  },
  bubbleOwn: { backgroundColor: colors.accent, borderBottomRightRadius: radius.xs },
  bubbleAi: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: radius.xs,
  },
  bubbleText: { fontSize: fontSize.base, color: colors.text, lineHeight: 21 },
  bubbleTextOwn: { color: colors.accentInk },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: space[3],
    gap: space[2],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.panel,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.panelSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: space[4],
    paddingVertical: space[2] + 2,
    color: colors.text,
    fontSize: fontSize.base,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { fontSize: 18, color: colors.accentInk, fontWeight: '700' },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: space[2] },
  emptyChatText: { fontSize: fontSize.md, color: colors.text, fontWeight: '600' },
  emptyChatSub: { fontSize: fontSize.base, color: colors.muted, textAlign: 'center' },
});
