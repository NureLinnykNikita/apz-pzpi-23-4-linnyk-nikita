import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { coursesApi, languagesApi } from '../../api/endpoints';
import { Card, Button, Badge, Input, Select, Modal, Spinner } from '../../components/ui';
import { Icons } from '../../components/ui/icons';
import type { CEFRLevel } from '../../types';

const LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function AdminCoursesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<{ courseId: number; title: string; description: string; level: CEFRLevel; targetLanguageId: number } | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<CEFRLevel>('A1');
  const [languageId, setLanguageId] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getAll().then(r => r.data.courses),
  });

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: () => languagesApi.getAll().then(r => r.data.languages),
  });

  const createMutation = useMutation({
    mutationFn: () => coursesApi.create({ title, description, level, targetLanguageId: Number(languageId) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); setModalOpen(false); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: () => coursesApi.update(editing!.courseId, { title, description, level }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); setModalOpen(false); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => coursesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); setConfirmDelete(null); },
  });

  const resetForm = () => { setTitle(''); setDescription(''); setLevel('A1'); setLanguageId(''); };

  const openCreate = () => { resetForm(); setEditing(null); setModalOpen(true); };
  const openEdit = (c: typeof courses[0]) => {
    setTitle(c.title); setDescription(c.description || ''); setLevel(c.level); setLanguageId(String(c.language.id));
    setEditing({ courseId: c.courseId, title: c.title, description: c.description || '', level: c.level, targetLanguageId: c.language.id });
    setModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lb-section-gap)', animation: 'fadeIn 0.2s ease' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="lb-h1">{t('admin.courses')}</h1>
        <Button size="sm" onClick={openCreate}><Icons.Plus size={14} />{t('admin.create')}</Button>
      </header>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={32} /></div>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 100px', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--lb-line)', background: 'var(--lb-panel-soft)' }}>
            {[t('admin.title'), t('admin.language'), t('admin.level'), t('admin.actions')].map(h => (
              <span key={h} className="lb-eyebrow">{h}</span>
            ))}
          </div>
          {courses.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--lb-text-muted)', fontSize: 13 }}>{t('admin.noData')}</div>
          ) : courses.map((c, idx) => (
            <div key={c.courseId} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 100px', gap: 12, padding: '12px 20px', borderBottom: idx < courses.length - 1 ? '1px solid var(--lb-line)' : 'none', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{c.title}</div>
                {c.description && <div style={{ fontSize: 12, color: 'var(--lb-text-muted)', marginTop: 2 }}>{c.description}</div>}
              </div>
              <Badge variant="accent">{c.language.name}</Badge>
              <Badge variant="muted">{c.level}</Badge>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => openEdit(c)} style={{ padding: 6, borderRadius: 6, background: 'transparent', border: '1px solid var(--lb-line)', cursor: 'pointer' }}>
                  <Icons.Edit size={14} stroke="var(--lb-accent)" />
                </button>
                {confirmDelete === c.courseId ? (
                  <>
                    <button onClick={() => deleteMutation.mutate(c.courseId)} style={{ padding: '4px 8px', borderRadius: 4, background: 'var(--lb-danger)', color: '#fff', border: 'none', fontSize: 11, cursor: 'pointer' }}>{t('admin.yes')}</button>
                    <button onClick={() => setConfirmDelete(null)} style={{ padding: '4px 8px', borderRadius: 4, background: 'var(--lb-panel-soft)', color: 'var(--lb-text-muted)', border: '1px solid var(--lb-line)', fontSize: 11, cursor: 'pointer' }}>{t('admin.no')}</button>
                  </>
                ) : (
                  <button onClick={() => setConfirmDelete(c.courseId)} style={{ padding: 6, borderRadius: 6, background: 'transparent', border: '1px solid var(--lb-line)', cursor: 'pointer' }}>
                    <Icons.Trash size={14} stroke="var(--lb-danger)" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? t('admin.edit') : t('admin.create') + ' ' + t('admin.courses')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label={t('admin.title')} value={title} onChange={e => setTitle(e.target.value)} />
          <Input label={t('admin.description')} value={description} onChange={e => setDescription(e.target.value)} />
          <Select label={t('admin.level')} value={level} onChange={e => setLevel(e.target.value as CEFRLevel)} options={LEVELS.map(l => ({ value: l, label: l }))} />
          {!editing && (
            <Select label={t('admin.language')} value={languageId} onChange={e => setLanguageId(e.target.value)} options={[{ value: '', label: '—' }, ...languages.map(l => ({ value: String(l.id), label: l.name }))]} />
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>{t('admin.cancel')}</Button>
            <Button
              onClick={() => editing ? updateMutation.mutate() : createMutation.mutate()}
              disabled={!title || (!editing && !languageId) || createMutation.isPending || updateMutation.isPending}
            >
              {t('admin.save')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
