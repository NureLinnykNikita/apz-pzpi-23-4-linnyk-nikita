import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { chatApi } from '../../api/endpoints';
import { Card, Button, Input } from '../../components/ui';
import { Icons } from '../../components/ui/icons';

export function AdminModerationPage() {
  const { t } = useTranslation();
  const [conversationId, setConversationId] = useState('');
  const [messageId, setMessageId] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [success, setSuccess] = useState('');

  const deleteMutation = useMutation({
    mutationFn: () => chatApi.deleteMessage(conversationId, messageId),
    onSuccess: () => {
      setSuccess('Message deleted successfully.');
      setConversationId('');
      setMessageId('');
      setConfirmDelete(false);
      setTimeout(() => setSuccess(''), 3000);
    },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lb-section-gap)', animation: 'fadeIn 0.2s ease' }}>
      <h1 className="lb-h1">{t('admin.moderation')}</h1>

      <Card>
        <div className="lb-eyebrow" style={{ marginBottom: 16 }}>{t('admin.deleteMessage')}</div>

        {success && (
          <div style={{ padding: '10px 14px', background: 'rgba(168,196,162,0.15)', border: '1px solid var(--lb-success)', borderRadius: 'var(--lb-radius-sm)', color: 'var(--lb-success)', fontSize: 13, marginBottom: 16 }}>
            {success}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input
            label="Conversation ID"
            value={conversationId}
            onChange={e => setConversationId(e.target.value)}
            placeholder="UUID of conversation"
          />
          <Input
            label="Message ID"
            value={messageId}
            onChange={e => setMessageId(e.target.value)}
            placeholder="UUID of message"
          />

          {!confirmDelete ? (
            <Button
              variant="danger"
              onClick={() => setConfirmDelete(true)}
              disabled={!conversationId || !messageId}
              style={{ alignSelf: 'flex-start' }}
            >
              <Icons.Trash size={14} />
              {t('admin.deleteMessage')}
            </Button>
          ) : (
            <div style={{ padding: 16, borderRadius: 'var(--lb-radius-lg)', border: '1px solid var(--lb-danger)', background: 'rgba(215,114,96,0.08)' }}>
              <div style={{ fontSize: 13, marginBottom: 14 }}>{t('admin.deleteConfirm')}</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>{t('admin.no')}</Button>
                <Button variant="danger" size="sm" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
                  {t('admin.yes')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card style={{ background: 'var(--lb-panel-soft)' }}>
        <div style={{ fontSize: 13, color: 'var(--lb-text-muted)', lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, color: 'var(--lb-text)', marginBottom: 8 }}>How to find message IDs</div>
          <p style={{ margin: 0 }}>
            Use the community page to view conversations and messages. Copy the conversation and message IDs from the URL or API response to moderate specific messages.
          </p>
        </div>
      </Card>
    </div>
  );
}
