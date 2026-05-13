import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { coursesApi, lessonsApi, exercisesApi } from '../../api/endpoints';
import { usersApi } from '../../api/endpoints';
import { Card, Button, Badge, ProgressBar, Spinner } from '../../components/ui';
import { Icons } from '../../components/ui/icons';
import type { Course, Lesson, Exercise } from '../../types';

type View = 'courses' | 'lessons' | 'exercise';
type Tab = 'vocab' | 'quiz' | 'ai';

interface SessionStats {
  correct: number;
  incorrect: number;
  points: number;
  reviewed: number;
}

export function PracticePage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [view, setView] = useState<View>('courses');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [tab, setTab] = useState<Tab>('vocab');
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<boolean | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({ correct: 0, incorrect: 0, points: 0, reviewed: 0 });
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [aiInput, setAiInput] = useState('');

  const { data: enrollments = [], isLoading: enrollLoading } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => usersApi.getMyEnrollments().then(r => r.data.enrollments),
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getAll().then(r => r.data.courses),
  });

  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons', selectedCourse?.courseId],
    queryFn: () => coursesApi.getLessons(selectedCourse!.courseId).then(r => r.data.lessons),
    enabled: !!selectedCourse,
  });

  const { data: exercises = [], isLoading: exLoading } = useQuery({
    queryKey: ['exercises', selectedLesson?.lessonId],
    queryFn: () => lessonsApi.getExercises(selectedLesson!.lessonId).then(r => r.data.exercises),
    enabled: !!selectedLesson,
  });

  const enrollMutation = useMutation({
    mutationFn: (courseId: number) => coursesApi.enroll(courseId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['enrollments'] }),
  });

  const unenrollMutation = useMutation({
    mutationFn: (courseId: number) => coursesApi.unenroll(courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      setView('courses');
      setSelectedCourse(null);
    },
  });

  const submitMutation = useMutation({
    mutationFn: ({ id, answer }: { id: number; answer: string }) =>
      exercisesApi.submit(id, answer),
    onSuccess: (res) => {
      const { isCorrect, earnedPoints: pts } = res.data.submittedExercise;
      setQuizResult(isCorrect);
      setEarnedPoints(pts);
      setSessionStats(prev => ({
        ...prev,
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
        points: prev.points + pts,
      }));
      // Refresh progress & leaderboard in background
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      qc.invalidateQueries({ queryKey: ['me/stats'] });
      qc.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });

  const enrolledIds = new Set(enrollments.map(e => e.courseId));
  const currentExercise: Exercise | undefined = exercises[cardIdx];
  const isLastCard = cardIdx >= exercises.length - 1;

  const enterLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCardIdx(0);
    setFlipped(false);
    setQuizSelected(null);
    setQuizResult(null);
    setEarnedPoints(0);
    setCompleted(false);
    setSessionStats({ correct: 0, incorrect: 0, points: 0, reviewed: 0 });
    setView('exercise');
  };

  const handleSubmitQuiz = (optIdx: number, opts: string[]) => {
    if (quizSelected !== null) return;
    setQuizSelected(optIdx);
    if (!currentExercise) return;
    submitMutation.mutate({ id: currentExercise.exerciseId, answer: opts[optIdx] });
  };

  const handleSendAi = () => {
    if (!aiInput.trim()) return;
    setAiMessages(prev => [...prev, { role: 'user', text: aiInput }]);
    setAiInput('');
    setTimeout(() => {
      setAiMessages(prev => [...prev, { role: 'ai', text: 'Great question! Keep practicing and you\'ll improve quickly.' }]);
    }, 800);
  };

  const nextCard = () => {
    if (isLastCard) {
      // Mark vocab card as reviewed then show summary
      if (tab === 'vocab') {
        setSessionStats(prev => ({ ...prev, reviewed: prev.reviewed + 1 }));
      }
      setCompleted(true);
    } else {
      setCardIdx(i => i + 1);
      setFlipped(false);
      setQuizSelected(null);
      setQuizResult(null);
      setEarnedPoints(0);
      if (tab === 'vocab') {
        setSessionStats(prev => ({ ...prev, reviewed: prev.reviewed + 1 }));
      }
    }
  };

  const prevCard = () => {
    setCardIdx(i => Math.max(i - 1, 0));
    setFlipped(false);
    setQuizSelected(null);
    setQuizResult(null);
    setEarnedPoints(0);
  };

  const restartLesson = () => {
    setCardIdx(0);
    setFlipped(false);
    setQuizSelected(null);
    setQuizResult(null);
    setEarnedPoints(0);
    setCompleted(false);
    setSessionStats({ correct: 0, incorrect: 0, points: 0, reviewed: 0 });
  };

  const goBack = () => {
    if (view === 'exercise') {
      setView('lessons');
      setSelectedLesson(null);
      setCompleted(false);
      // Refresh enrollments so course progress shows updated
      qc.invalidateQueries({ queryKey: ['enrollments'] });
    } else {
      setView('courses');
      setSelectedCourse(null);
    }
  };

  if (enrollLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}><Spinner size={32} /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lb-section-gap)', maxWidth: 900, animation: 'fadeIn 0.2s ease' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {view !== 'courses' && (
          <button
            onClick={goBack}
            style={{ background: 'transparent', border: '1px solid var(--lb-line)', borderRadius: 'var(--lb-radius-sm)', padding: '6px 12px', color: 'var(--lb-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
          >
            <Icons.Arrow size={14} stroke="var(--lb-text-muted)" style={{ transform: 'rotate(180deg)' }} />
            {t('common.back')}
          </button>
        )}
        <h1 className="lb-h1">{t('practice.title')}</h1>
      </header>

      {/* COURSES VIEW */}
      {view === 'courses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="lb-eyebrow">{t('practice.selectCourse')}</div>
          {allCourses.length === 0 ? (
            <Card><p style={{ color: 'var(--lb-text-muted)', textAlign: 'center' }}>{t('practice.noCourses')}</p></Card>
          ) : allCourses.map(course => {
            const enrolled = enrolledIds.has(course.courseId);
            const enrollment = enrollments.find(e => e.courseId === course.courseId);
            return (
              <Card key={course.courseId} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{course.title}</span>
                    <Badge variant="muted">{course.level}</Badge>
                    <Badge variant="accent">{course.language.name}</Badge>
                  </div>
                  {course.description && <div style={{ fontSize: 13, color: 'var(--lb-text-muted)' }}>{course.description}</div>}
                  {enrolled && enrollment && (
                    <div style={{ marginTop: 10 }}>
                      <ProgressBar value={enrollment.progress} height={4} />
                      <div style={{ fontSize: 11, color: 'var(--lb-text-muted)', marginTop: 4 }}>{Math.round(enrollment.progress)}%</div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {enrolled ? (
                    <>
                      <Button size="sm" onClick={() => { setSelectedCourse(course); setView('lessons'); }}>
                        {t('practice.startPractice')}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => unenrollMutation.mutate(course.courseId)}>
                        {t('practice.unenroll')}
                      </Button>
                    </>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => enrollMutation.mutate(course.courseId)} disabled={enrollMutation.isPending}>
                      {t('practice.enroll')}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* LESSONS VIEW */}
      {view === 'lessons' && selectedCourse && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="lb-eyebrow">{selectedCourse.title} · {t('practice.selectLesson')}</div>
          {lessonsLoading ? <Spinner /> : lessons.map((lesson) => (
            <Card
              key={lesson.lessonId}
              hoverable
              onClick={() => enterLesson(lesson)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 'var(--lb-radius-md)', background: 'var(--lb-panel-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icons.Book size={16} stroke="var(--lb-accent)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{lesson.title}</div>
                {lesson.description && <div style={{ fontSize: 12, color: 'var(--lb-text-muted)', marginTop: 2 }}>{lesson.description}</div>}
              </div>
              <Icons.Arrow size={16} stroke="var(--lb-text-muted)" />
            </Card>
          ))}
        </div>
      )}

      {/* EXERCISE VIEW */}
      {view === 'exercise' && selectedLesson && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* COMPLETION SUMMARY */}
          {completed ? (
            <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '40px 32px', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ fontSize: 56, lineHeight: 1 }}>🎉</div>
              <div>
                <h2 className="lb-h2" style={{ marginBottom: 6 }}>{t('practice.lessonComplete')}</h2>
                <div style={{ fontSize: 14, color: 'var(--lb-text-muted)' }}>{selectedLesson.title}</div>
              </div>

              {tab === 'quiz' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, width: '100%', maxWidth: 360 }}>
                  <div style={{ padding: '16px 8px', borderRadius: 'var(--lb-radius-lg)', background: 'rgba(168,196,162,0.12)', border: '1px solid var(--lb-success)' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--lb-success)' }}>{sessionStats.correct}</div>
                    <div style={{ fontSize: 12, color: 'var(--lb-text-muted)', marginTop: 4 }}>{t('practice.correct')}</div>
                  </div>
                  <div style={{ padding: '16px 8px', borderRadius: 'var(--lb-radius-lg)', background: 'var(--lb-accent-tint)', border: '1px solid var(--lb-accent)' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--lb-accent)' }}>{sessionStats.points}</div>
                    <div style={{ fontSize: 12, color: 'var(--lb-text-muted)', marginTop: 4 }}>XP</div>
                  </div>
                  <div style={{ padding: '16px 8px', borderRadius: 'var(--lb-radius-lg)', background: 'rgba(215,114,96,0.1)', border: '1px solid var(--lb-danger)' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--lb-danger)' }}>{sessionStats.incorrect}</div>
                    <div style={{ fontSize: 12, color: 'var(--lb-text-muted)', marginTop: 4 }}>{t('practice.incorrect')}</div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '16px 32px', borderRadius: 'var(--lb-radius-lg)', background: 'var(--lb-accent-tint)', border: '1px solid var(--lb-accent)' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--lb-accent)' }}>{exercises.length}</div>
                  <div style={{ fontSize: 12, color: 'var(--lb-text-muted)', marginTop: 4 }}>{t('practice.cardsReviewed')}</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button variant="ghost" onClick={restartLesson}>
                  {t('practice.tryAgain')}
                </Button>
                <Button onClick={() => { setView('lessons'); setSelectedLesson(null); setCompleted(false); qc.invalidateQueries({ queryKey: ['enrollments'] }); }}>
                  {t('practice.backToLessons')}
                </Button>
              </div>
            </Card>
          ) : (
            <>
              {/* Progress header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--lb-text-muted)' }}>
                  {selectedCourse?.language.name} · {selectedLesson.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--lb-font-mono)', fontSize: 12, color: 'var(--lb-text-muted)' }}>
                    {cardIdx + 1} / {exercises.length}
                  </span>
                  <div style={{ width: 100, height: 4, borderRadius: 2, background: 'var(--lb-panel-deep)', overflow: 'hidden' }}>
                    <div style={{ width: `${((cardIdx + 1) / exercises.length) * 100}%`, height: '100%', background: 'var(--lb-accent)', borderRadius: 2, transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 4, background: 'var(--lb-panel)', border: '1px solid var(--lb-line)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
                {([['vocab', t('practice.vocabulary')], ['quiz', t('practice.quiz')], ['ai', t('practice.aiDialogue')]] as const).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => { setTab(id); setQuizSelected(null); setQuizResult(null); setEarnedPoints(0); }}
                    style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: tab === id ? 'var(--lb-panel-soft)' : 'transparent', color: tab === id ? 'var(--lb-accent)' : 'var(--lb-text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'var(--lb-trans)' }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {exLoading ? <Spinner /> : currentExercise ? (
                <>
                  {/* VOCAB tab — flashcard */}
                  {tab === 'vocab' && (
                    <div
                      onClick={() => setFlipped(f => !f)}
                      style={{
                        minHeight: 220,
                        borderRadius: 'var(--lb-radius-xl)',
                        background: flipped ? 'var(--lb-accent-tint)' : 'var(--lb-panel)',
                        border: `1px solid ${flipped ? 'var(--lb-accent)' : 'var(--lb-line)'}`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', padding: 32, textAlign: 'center',
                        transition: 'all 0.3s ease', gap: 12,
                      }}
                    >
                      <div style={{ fontSize: 11, color: 'var(--lb-text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                        {flipped ? 'Answer' : 'Question'}
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: flipped ? 'var(--lb-accent)' : 'var(--lb-text)' }}>
                        {flipped ? currentExercise.correctAnswer : currentExercise.question}
                      </div>
                      {!flipped && <div style={{ fontSize: 12, color: 'var(--lb-text-muted)' }}>Click to reveal</div>}
                    </div>
                  )}

                  {/* QUIZ tab */}
                  {tab === 'quiz' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <Card>
                        <div style={{ fontSize: 18, fontWeight: 600, textAlign: 'center', padding: '16px 0' }}>
                          {currentExercise.question}
                        </div>
                      </Card>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {[currentExercise.correctAnswer, 'Option B', 'Option C', 'Option D'].map((opt, idx) => {
                          const isSelected = quizSelected === idx;
                          const isCorrectOpt = opt === currentExercise.correctAnswer;
                          let borderColor = 'var(--lb-line)';
                          let bg = 'var(--lb-panel)';
                          if (quizSelected !== null) {
                            if (isSelected) {
                              borderColor = quizResult ? 'var(--lb-success)' : 'var(--lb-danger)';
                              bg = quizResult ? 'rgba(168,196,162,0.15)' : 'rgba(215,114,96,0.15)';
                            } else if (isCorrectOpt && !quizResult) {
                              // Highlight correct answer when user got it wrong
                              borderColor = 'var(--lb-success)';
                              bg = 'rgba(168,196,162,0.08)';
                            }
                          }
                          return (
                            <button
                              key={idx}
                              onClick={() => handleSubmitQuiz(idx, [currentExercise.correctAnswer, 'Option B', 'Option C', 'Option D'])}
                              style={{
                                padding: '14px 16px', borderRadius: 'var(--lb-radius-lg)',
                                border: `1px solid ${borderColor}`, background: bg,
                                color: 'var(--lb-text)', fontSize: 14, fontWeight: 500,
                                cursor: quizSelected !== null ? 'default' : 'pointer',
                                transition: 'var(--lb-trans)', textAlign: 'left',
                              }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {quizResult !== null && (
                        <div style={{ fontSize: 14, fontWeight: 600, textAlign: 'center', color: quizResult ? 'var(--lb-success)' : 'var(--lb-danger)' }}>
                          {quizResult ? t('practice.correct') : t('practice.incorrect')}
                          {quizResult && earnedPoints > 0 && ` +${earnedPoints} ${t('practice.points')}`}
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI DIALOGUE tab */}
                  {tab === 'ai' && (
                    <Card style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 300 }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 200, overflow: 'auto' }}>
                        {aiMessages.length === 0 && (
                          <div style={{ color: 'var(--lb-text-muted)', fontSize: 13, textAlign: 'center', padding: 24 }}>
                            Ask the AI tutor anything about this lesson.
                          </div>
                        )}
                        {aiMessages.map((m, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                            <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: 12, background: m.role === 'user' ? 'var(--lb-accent)' : 'var(--lb-panel-soft)', color: m.role === 'user' ? 'var(--lb-accent-ink)' : 'var(--lb-text)', fontSize: 14 }}>
                              {m.text}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          value={aiInput}
                          onChange={e => setAiInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSendAi()}
                          placeholder={t('community.typeMessage')}
                          style={{ flex: 1, background: 'var(--lb-panel-soft)', border: '1px solid var(--lb-line)', borderRadius: 'var(--lb-radius-sm)', color: 'var(--lb-text)', fontFamily: 'var(--lb-font-sans)', fontSize: 14, padding: '10px 14px', outline: 'none' }}
                        />
                        <Button size="sm" onClick={handleSendAi} disabled={!aiInput.trim()}>
                          <Icons.Send size={14} />
                        </Button>
                      </div>
                    </Card>
                  )}

                  {/* Navigation */}
                  {tab !== 'ai' && (
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
                      <Button variant="ghost" size="sm" onClick={prevCard} disabled={cardIdx === 0}>
                        {t('practice.prev')}
                      </Button>
                      <div style={{ fontSize: 12, color: 'var(--lb-text-muted)' }}>
                        {tab === 'quiz' && quizSelected === null && cardIdx > 0 ? t('practice.selectAnswer') : ''}
                      </div>
                      <Button
                        size="sm"
                        onClick={nextCard}
                        disabled={tab === 'quiz' && quizSelected === null}
                      >
                        {isLastCard ? t('practice.finish') : t('practice.next')}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <Card><p style={{ textAlign: 'center', color: 'var(--lb-text-muted)' }}>No exercises in this lesson.</p></Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
