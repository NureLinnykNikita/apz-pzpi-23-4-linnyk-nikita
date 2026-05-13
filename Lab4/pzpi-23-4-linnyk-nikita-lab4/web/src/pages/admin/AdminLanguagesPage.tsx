import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { languagesApi } from '../../api/endpoints';
import { Card, Button, Input, Modal, Spinner } from '../../components/ui';
import { Icons } from '../../components/ui/icons';

export function AdminLanguagesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: number } | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const { data: languages = [], isLoading } = useQuery({
    queryKey: ['languages'],
    queryFn: () => languagesApi.getAll().then(r => r.data.languages),
  });

  const createMutation = useMutation({
    mutationFn: () => languagesApi.create({ code, name }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['languages'] }); setModalOpen(false); setCode(''); setName(''); },
  });

  const updateMutation = useMutation({
    mutationFn: () => languagesApi.update(editing!.id, { code, name }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['languages'] }); setModalOpen(false); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => languagesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['languages'] }); setConfirmDelete(null); },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lb-section-gap)', animation: 'fadeIn 0.2s ease' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="lb-h1">{t('admin.languages')}</h1>
        <Button size="sm" onClick={() => { setCode(''); setName(''); setEditing(null); setModalOpen(true); }}>
          <Icons.Plus size={14} />{t('admin.create')}
        </Button>
      </header>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={32} /></div>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--lb-line)', background: 'var(--lb-panel-soft)' }}>
            {[t('admin.code'), t('admin.title'), t('admin.actions')].map(h => <span key={h} className="lb-eyebrow">{h}</span>)}
          </div>
          {languages.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--lb-text-muted)', fontSize: 13 }}>{t('admin.noData')}</div>
          ) : languages.map((lang, idx) => (
            <div key={lang.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px', gap: 12, padding: '12px 20px', borderBottom: idx < languages.length - 1 ? '1px solid var(--lb-line)' : 'none', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--lb-font-mono)', fontSize: 13, color: 'var(--lb-accent)' }}>{lang.code}</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{lang.name}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setCode(lang.code); setName(lang.name); setEditing({ id: lang.id }); setModalOpen(true); }} style={{ padding: 6, borderRadius: 6, background: 'transparent', border: '1px solid var(--lb-line)', cursor: 'pointer' }}>
                  <Icons.Edit size={14} stroke="var(--lb-accent)" />
                </button>
                {confirmDelete === lang.id ? (
                  <>
                    <button onClick={() => deleteMutation.mutate(lang.id)} style={{ padding: '4px 8px', borderRadius: 4, background: 'var(--lb-danger)', color: '#fff', border: 'none', fontSize: 11, cursor: 'pointer' }}>{t('admin.yes')}</button>
                    <button onClick={() => setConfirmDelete(null)} style={{ padding: '4px 8px', borderRadius: 4, background: 'var(--lb-panel-soft)', color: 'var(--lb-text-muted)', border: '1px solid var(--lb-line)', fontSize: 11, cursor: 'pointer' }}>{t('admin.no')}</button>
                  </>
                ) : (
                  <button onClick={() => setConfirmDelete(lang.id)} style={{ padding: 6, borderRadius: 6, background: 'transparent', border: '1px solid var(--lb-line)', cursor: 'pointer' }}>
                    <Icons.Trash size={14} stroke="var(--lb-danger)" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? t('admin.edit') : t('admin.create') + ' language'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label={t('admin.code')} value={code} onChange={e => setCode(e.target.value)} placeholder="en" />
          <Input label={t('admin.title')} value={name} onChange={e => setName(e.target.value)} placeholder="English" />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>{t('admin.cancel')}</Button>
            <Button onClick={() => editing ? updateMutation.mutate() : createMutation.mutate()} disabled={!code || !name}>
              {t('admin.save')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
