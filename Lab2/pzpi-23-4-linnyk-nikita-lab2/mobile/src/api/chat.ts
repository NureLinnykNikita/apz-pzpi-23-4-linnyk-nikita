import { apiClient } from './client';
import { Conversation, Message } from '../types/api';

export const createConversation = async (participantId?: string) => {
  const body = participantId ? { participantId } : {};
  const { data } = await apiClient.post<{ conversation: Conversation }>(
    '/conversations',
    body
  );
  return data.conversation;
};

export const getMessages = async (conversationId: string) => {
  const { data } = await apiClient.get<{ messages: Message[] }>(
    `/conversations/${conversationId}/messages`
  );
  return data.messages;
};

export const sendMessage = async (conversationId: string, content: string) => {
  const { data } = await apiClient.post<{ message: Message }>(
    `/conversations/${conversationId}/messages`,
    { content }
  );
  return data.message;
};
