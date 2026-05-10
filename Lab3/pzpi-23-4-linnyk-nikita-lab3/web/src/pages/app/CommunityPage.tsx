import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { chatApi } from '../../api/endpoints';
import { useAuthStore } from '../../store/auth.store';
import { Card, Button, Spinner } from '../../components/ui';
import { Icons, InitialAvatar } from '../../components/ui/icons';
import type { Conversation } from '../../types';
import { formatDate } from '../../i18n/locale';

export function CommunityPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading: msgLoading } = useQuery({
    queryKey: ['messages', activeConv?.conversationId],
    queryFn: () => chatApi.getMessages(activeConv!.conversationId).then(r => r.data.messages),
    enabled: !!activeConv,
    refetchInterval: 5000,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createMutation = useMutation({
    mutationFn: () => chatApi.createConversation({ title: 'AI Tutor' }),
    onSuccess: (res) => {
      setActiveConv(res.data);
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => chatApi.sendMessage(activeConv!.conversationId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', activeConv?.conversationId] });
      setInput('');
    },
  });

  const handleSend = () => {
    if (!input.trim() || !activeConv) return;
    sendMutation.mutate(input.trim());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lb-section-gap)', maxWidth: 900, animation: 'fadeIn 0.2s ease' }}>
      <header>
        <h1 className="lb-h1">{t('community.title')}</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 'var(--lb-section-gap)', height: 600 }}>
        {/* Sidebar */}
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, overflowY: 'auto' }}>
          <Button size="sm" onClick={() => createMutation.mutate()} disabled={createMutation.isPending} style={{ width: '100%' }}>
            <Icons.Plus size={14} />
            {t('community.newConversation')}
          </Button>
          <div className="lb-eyebrow" style={{ marginTop: 8 }}>{t('community.aiTutor')}</div>
          {activeConv ? (
            <div
              style={{ padding: '10px 12px', borderRadius: 'var(--lb-radius-sm)', background: 'var(--lb-panel-soft)', border: '1px solid var(--lb-accent)', cursor: 'pointer' }}
            >
              <div style={{ fontSize: 13, fontWeight: 600 }}>{activeConv.title || 'Conversation'}</div>
              <div style={{ fontSize: 11, color: 'var(--lb-text-muted)', marginTop: 2 }}>
                {formatDate(activeConv.createdAt, i18n.language, { day: 'numeric', month: 'short' })}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--lb-text-muted)', padding: '8px 0' }}>
              {t('community.noConversations')}
            </div>
          )}
        </Card>

        {/* Chat area */}
        <Card style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          {!activeConv ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'var(--lb-text-muted)' }}>
              <Icons.Chat size={48} stroke="var(--lb-text-muted)" />
              <p style={{ fontSize: 14, margin: 0 }}>{t('community.startConversation')}</p>
              <Button onClick={() => createMutation.mutate()}>{t('community.newConversation')}</Button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>
                {msgLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {messages.map(msg => {
                      const isMe = msg.senderId === user?.userId;
                      const isAI = msg.senderType === 'ai';
                      return (
                        <div key={msg.messageId} style={{ display: 'flex', gap: 10, justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end' }}>
                          {!isMe && (
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: isAI ? 'var(--lb-accent-tint-strong)' : 'var(--lb-panel-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {isAI ? <Icons.Spark size={14} stroke="var(--lb-accent)" /> : <InitialAvatar name={msg.sender?.username} size={28} />}
                            </div>
                          )}
                          <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: 12, background: isMe ? 'var(--lb-accent)' : 'var(--lb-panel-soft)', color: isMe ? 'var(--lb-accent-ink)' : 'var(--lb-text)', fontSize: 14, lineHeight: 1.5 }}>
                            {msg.content}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--lb-line)', display: 'flex', gap: 10 }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={t('community.typeMessage')}
                  style={{ flex: 1, background: 'var(--lb-panel-soft)', border: '1px solid var(--lb-line)', borderRadius: 'var(--lb-radius-sm)', color: 'var(--lb-text)', fontFamily: 'var(--lb-font-sans)', fontSize: 14, padding: '10px 14px', outline: 'none' }}
                />
                <Button onClick={handleSend} disabled={!input.trim() || sendMutation.isPending}>
                  <Icons.Send size={16} />
                  {t('community.send')}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
