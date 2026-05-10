import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { coursesApi, lessonsApi } from '../../api/endpoints';
import { Card, Button, Input, Select, Modal, Spinner } from '../../components/ui';
import { Icons } from '../../components/ui/icons';

export function AdminLessonsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<{ lessonId: number; title: string; description: string; sequence: number } | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getAll().then(r => r.data.courses),
  });

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['lessons', selectedCourseId],
    queryFn: () => coursesApi.getLessons(Number(selectedCourseId)).then(r => r.data.lessons),
    enabled: !!selectedCourseId,
  });

  const createMutation = useMutation({
    mutationFn: () => lessonsApi.create({ courseId: Number(selectedCourseId), title, description, sequence: lessons.length + 1 }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lessons'] }); setModalOpen(false); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: () => lessonsApi.update(editing!.lessonId, { title, description }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lessons'] }); setModalOpen(false); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => lessonsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lessons'] }); setConfirmDelete(null); },
  });

  const resetForm = () => { setTitle(''); setDescription(''); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lb-section-gap)', animation: 'fadeIn 0.2s ease' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="lb-h1">{t('admin.lessons')}</h1>
        <Button size="sm" onClick={() => { resetForm(); setEditing(null); setModalOpen(true); }} disabled={!selectedCourseId}>
          <Icons.Plus size={14} />{t('admin.create')}
        </Button>
      </header>

      <Select
        label={t('admin.courses')}
        value={selectedCourseId}
        onChange={e => setSelectedCourseId(e.target.value)}
        options={[{ value: '', label: '— Select course —' }, ...courses.map(c => ({ value: String(c.courseId), label: `${c.title} (${c.language.name})` }))]}
      />

      {selectedCourseId && (
        isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>
        ) : (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '40px 2fr 1fr 100px', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--lb-line)', background: 'var(--lb-panel-soft)' }}>
              {['#', t('admin.title'), t('admin.description'), t('admin.actions')].map(h => <span key={h} className="lb-eyebrow">{h}</span>)}
            </div>
            {lessons.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--lb-text-muted)', fontSize: 13 }}>{t('admin.noData')}</div>
            ) : lessons.map((l, idx) => (
              <div key={l.lessonId} style={{ display: 'grid', gridTemplateColumns: '40px 2fr 1fr 100px', gap: 12, padding: '12px 20px', borderBottom: idx < lessons.length - 1 ? '1px solid var(--lb-line)' : 'none', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--lb-font-mono)', fontSize: 12, color: 'var(--lb-text-muted)' }}>{l.sequence}</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{l.title}</span>
                <span style={{ fontSize: 12, color: 'var(--lb-text-muted)' }}>{l.description || '—'}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => { setTitle(l.title); setDescription(l.description || ''); setEditing({ lessonId: l.lessonId, title: l.title, description: l.description || '', sequence: l.sequence }); setModalOpen(true); }} style={{ padding: 6, borderRadius: 6, background: 'transparent', border: '1px solid var(--lb-line)', cursor: 'pointer' }}>
                    <Icons.Edit size={14} stroke="var(--lb-accent)" />
                  </button>
                  {confirmDelete === l.lessonId ? (
                    <>
                      <button onClick={() => deleteMutation.mutate(l.lessonId)} style={{ padding: '4px 8px', borderRadius: 4, background: 'var(--lb-danger)', color: '#fff', border: 'none', fontSize: 11, cursor: 'pointer' }}>{t('admin.yes')}</button>
                      <button onClick={() => setConfirmDelete(null)} style={{ padding: '4px 8px', borderRadius: 4, background: 'var(--lb-panel-soft)', color: 'var(--lb-text-muted)', border: '1px solid var(--lb-line)', fontSize: 11, cursor: 'pointer' }}>{t('admin.no')}</button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmDelete(l.lessonId)} style={{ padding: 6, borderRadius: 6, background: 'transparent', border: '1px solid var(--lb-line)', cursor: 'pointer' }}>
                      <Icons.Trash size={14} stroke="var(--lb-danger)" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </Card>
        )
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? t('admin.edit') : t('admin.create') + ' lesson'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label={t('admin.title')} value={title} onChange={e => setTitle(e.target.value)} />
          <Input label={t('admin.description')} value={description} onChange={e => setDescription(e.target.value)} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>{t('admin.cancel')}</Button>
            <Button onClick={() => editing ? updateMutation.mutate() : createMutation.mutate()} disabled={!title}>
              {t('admin.save')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
