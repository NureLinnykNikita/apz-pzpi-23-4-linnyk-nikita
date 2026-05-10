import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { coursesApi, lessonsApi, exercisesApi } from '../../api/endpoints';
import { Card, Button, Input, Select, Modal, Badge, Spinner } from '../../components/ui';
import { Icons } from '../../components/ui/icons';
import type { ExerciseType } from '../../types';

const EXERCISE_TYPES: ExerciseType[] = ['reading', 'listening', 'writing', 'speaking', 'translation'];

export function AdminExercisesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [exType, setExType] = useState<ExerciseType>('reading');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [points, setPoints] = useState('10');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const { data: courses = [] } = useQuery({ queryKey: ['courses'], queryFn: () => coursesApi.getAll().then(r => r.data.courses) });
  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', selectedCourseId],
    queryFn: () => coursesApi.getLessons(Number(selectedCourseId)).then(r => r.data.lessons),
    enabled: !!selectedCourseId,
  });
  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ['exercises', selectedLessonId],
    queryFn: () => lessonsApi.getExercises(Number(selectedLessonId)).then(r => r.data.exercises),
    enabled: !!selectedLessonId,
  });

  const createMutation = useMutation({
    mutationFn: () => exercisesApi.create({ lessonId: Number(selectedLessonId), type: exType, question, correctAnswer: answer, points: Number(points), sequence: exercises.length + 1 }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exercises'] }); setModalOpen(false); setQuestion(''); setAnswer(''); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => exercisesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exercises'] }); setConfirmDelete(null); },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lb-section-gap)', animation: 'fadeIn 0.2s ease' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="lb-h1">{t('admin.exercises')}</h1>
        <Button size="sm" onClick={() => setModalOpen(true)} disabled={!selectedLessonId}>
          <Icons.Plus size={14} />{t('admin.create')}
        </Button>
      </header>

      <div style={{ display: 'flex', gap: 12 }}>
        <Select label={t('admin.courses')} value={selectedCourseId} onChange={e => { setSelectedCourseId(e.target.value); setSelectedLessonId(''); }} options={[{ value: '', label: '— Select course —' }, ...courses.map(c => ({ value: String(c.courseId), label: c.title }))]} style={{ flex: 1 }} />
        <Select label={t('admin.lessons')} value={selectedLessonId} onChange={e => setSelectedLessonId(e.target.value)} options={[{ value: '', label: '— Select lesson —' }, ...lessons.map(l => ({ value: String(l.lessonId), label: l.title }))]} style={{ flex: 1 }} />
      </div>

      {selectedLessonId && (
        isLoading ? <Spinner /> : (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 2fr 1.5fr 80px 80px', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--lb-line)', background: 'var(--lb-panel-soft)' }}>
              {[t('admin.type'), t('admin.question'), t('admin.answer'), t('admin.points'), t('admin.actions')].map(h => <span key={h} className="lb-eyebrow">{h}</span>)}
            </div>
            {exercises.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--lb-text-muted)', fontSize: 13 }}>{t('admin.noData')}</div>
            ) : exercises.map((ex, idx) => (
              <div key={ex.exerciseId} style={{ display: 'grid', gridTemplateColumns: '80px 2fr 1.5fr 80px 80px', gap: 12, padding: '12px 20px', borderBottom: idx < exercises.length - 1 ? '1px solid var(--lb-line)' : 'none', alignItems: 'center' }}>
                <Badge variant="muted">{ex.type}</Badge>
                <span style={{ fontSize: 13 }}>{ex.question}</span>
                <span style={{ fontSize: 13, color: 'var(--lb-text-muted)' }}>{ex.correctAnswer}</span>
                <span style={{ fontFamily: 'var(--lb-font-mono)', fontSize: 13 }}>{ex.points ?? '—'}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {confirmDelete === ex.exerciseId ? (
                    <>
                      <button onClick={() => deleteMutation.mutate(ex.exerciseId)} style={{ padding: '4px 8px', borderRadius: 4, background: 'var(--lb-danger)', color: '#fff', border: 'none', fontSize: 11, cursor: 'pointer' }}>{t('admin.yes')}</button>
                      <button onClick={() => setConfirmDelete(null)} style={{ padding: '4px 8px', borderRadius: 4, background: 'var(--lb-panel-soft)', color: 'var(--lb-text-muted)', border: '1px solid var(--lb-line)', fontSize: 11, cursor: 'pointer' }}>{t('admin.no')}</button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmDelete(ex.exerciseId)} style={{ padding: 6, borderRadius: 6, background: 'transparent', border: '1px solid var(--lb-line)', cursor: 'pointer' }}>
                      <Icons.Trash size={14} stroke="var(--lb-danger)" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </Card>
        )
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('admin.create') + ' exercise'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label={t('admin.type')} value={exType} onChange={e => setExType(e.target.value as ExerciseType)} options={EXERCISE_TYPES.map(t => ({ value: t, label: t }))} />
          <Input label={t('admin.question')} value={question} onChange={e => setQuestion(e.target.value)} />
          <Input label={t('admin.answer')} value={answer} onChange={e => setAnswer(e.target.value)} />
          <Input label={t('admin.points')} type="number" value={points} onChange={e => setPoints(e.target.value)} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>{t('admin.cancel')}</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!question || !answer || createMutation.isPending}>{t('admin.save')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
