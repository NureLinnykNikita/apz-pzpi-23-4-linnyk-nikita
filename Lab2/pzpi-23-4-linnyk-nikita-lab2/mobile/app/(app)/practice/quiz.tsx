import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, space, radius } from '../../../src/theme';
import { getLessonExercises, submitExercise } from '../../../src/api/exercises';
import { Badge } from '../../../src/components/ui/Badge';
import { usePracticeStore } from '../../../src/store/practice.store';

type AnswerState = 'idle' | 'correct' | 'wrong';

export default function QuizScreen() {
  const { selectedLesson, clearLesson } = usePracticeStore();
  const queryClient = useQueryClient();

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ['exercises', selectedLesson?.lessonId],
    queryFn: () => getLessonExercises(selectedLesson!.lessonId),
    enabled: !!selectedLesson,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [totalXp, setTotalXp] = useState(0);
  const [completed, setCompleted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: ({ exerciseId, answer }: { exerciseId: number; answer: string }) =>
      submitExercise(exerciseId, answer),
    onSuccess: (data) => {
      setAnswerState(data.isCorrect ? 'correct' : 'wrong');
      if (data.isCorrect) {
        setTotalXp((x) => x + (data.earnedPoints ?? 0));
        queryClient.invalidateQueries({ queryKey: ['courseProgress', selectedLesson?.courseId] });
        queryClient.invalidateQueries({ queryKey: ['me/stats'] });
      }
    },
  });

  const exercise = exercises[currentIndex];

  const options = useMemo(() => {
    if (!exercise) return [];
    const correct = (exercise as any).correctAnswer ?? '';
    const distractors = exercises
      .filter((e) => e.exerciseId !== exercise.exerciseId)
      .map((e) => (e as any).correctAnswer ?? '')
      .filter(Boolean)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [correct, ...distractors].sort(() => Math.random() - 0.5);
  }, [exercise?.exerciseId]);

  const handleSelect = (option: string) => {
    if (answerState !== 'idle') return;
    setSelectedAnswer(option);
    submitMutation.mutate({ exerciseId: exercise.exerciseId, answer: option });
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((i) => i + 1);
      setAnswerState('idle');
      setSelectedAnswer(null);
    } else {
      setCompleted(true);
    }
  };

  // No lesson selected — direct user to the Flashcards tab (hub)
  if (!selectedLesson) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No lesson selected</Text>
          <Text style={styles.emptySubtext}>
            Go to the Flashcards tab to pick a lesson first.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (exercises.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No exercises in this lesson.</Text>
          <TouchableOpacity onPress={clearLesson} style={styles.backLink}>
            <Text style={styles.backLinkText}>← Back to lessons</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (completed) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.centered}>
          <Badge label={`+${totalXp} XP`} variant="accent" style={styles.xpBadge} />
          <Text style={styles.completedTitle}>Quiz complete!</Text>
          <Text style={styles.completedSub}>You earned {totalXp} XP this session.</Text>
          <TouchableOpacity
            style={styles.tryAgainBtn}
            onPress={() => {
              setCurrentIndex(0);
              setAnswerState('idle');
              setSelectedAnswer(null);
              setTotalXp(0);
              setCompleted(false);
            }}
          >
            <Text style={styles.tryAgainText}>Try again</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearLesson} style={styles.backLink}>
            <Text style={styles.backLinkText}>← Back to lessons</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Lesson banner */}
        <TouchableOpacity style={styles.lessonBanner} onPress={clearLesson}>
          <Text style={styles.lessonBannerText} numberOfLines={1}>
            {selectedLesson.courseTitle} · {selectedLesson.title}
          </Text>
          <Text style={styles.lessonBannerChange}>Change ›</Text>
        </TouchableOpacity>

        <View style={styles.meta}>
          <Text style={styles.counter}>{currentIndex + 1} / {exercises.length}</Text>
          {totalXp > 0 && <Badge label={`+${totalXp} XP`} variant="secondary" />}
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / exercises.length) * 100}%` },
            ]}
          />
        </View>

        <Text style={styles.question}>{exercise.question}</Text>

        <View style={styles.options}>
          {options.map((option) => {
            const isCorrect = option === (exercise as any).correctAnswer;
            const isSelected = option === selectedAnswer;
            let extra = {};
            if (answerState !== 'idle') {
              if (isCorrect) extra = styles.optionCorrect;
              else if (isSelected) extra = styles.optionWrong;
            }
            return (
              <TouchableOpacity
                key={option}
                style={[styles.option, styles.optionBase, extra]}
                onPress={() => handleSelect(option)}
                activeOpacity={0.8}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {answerState !== 'idle' && (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>
              {currentIndex < exercises.length - 1 ? 'Next question →' : 'Finish quiz'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: {
    flexGrow: 1,
    paddingHorizontal: space[5],
    paddingVertical: space[4],
    gap: space[4],
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[4],
    backgroundColor: colors.bg,
  },
  emptyText: { fontSize: fontSize.md, color: colors.text, fontWeight: '600' },
  emptySubtext: { fontSize: fontSize.base, color: colors.muted, textAlign: 'center', paddingHorizontal: space[8] },
  backLink: {},
  backLinkText: { fontSize: fontSize.base, color: colors.accent, fontWeight: '600' },

  lessonBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.panelSoft,
    borderRadius: radius.lg,
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    borderWidth: 1,
    borderColor: colors.border,
  },
  lessonBannerText: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600', flex: 1 },
  lessonBannerChange: { fontSize: fontSize.sm, color: colors.accent, fontWeight: '600' },

  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  counter: { fontSize: fontSize.sm, color: colors.muted, fontWeight: '600' },
  progressTrack: { height: 4, backgroundColor: colors.panelDeep, borderRadius: radius.xs },
  progressFill: { height: 4, backgroundColor: colors.accent, borderRadius: radius.xs },
  question: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  options: { gap: space[3] },
  option: { padding: space[4], borderRadius: radius.lg, borderWidth: 1 },
  optionBase: { backgroundColor: colors.panel, borderColor: colors.border },
  optionCorrect: { backgroundColor: 'rgba(168,196,162,0.15)', borderColor: colors.success },
  optionWrong: { backgroundColor: 'rgba(215,114,96,0.15)', borderColor: colors.error },
  optionText: { fontSize: fontSize.base, color: colors.text, fontWeight: '500' },
  nextBtn: {
    backgroundColor: colors.accent,
    padding: 13,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  nextBtnText: { color: colors.accentInk, fontWeight: '700', fontSize: fontSize.base },
  xpBadge: { paddingHorizontal: space[5], paddingVertical: space[2] },
  completedTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, textAlign: 'center' },
  completedSub: { fontSize: fontSize.base, color: colors.muted, textAlign: 'center' },
  tryAgainBtn: {
    paddingHorizontal: space[8],
    paddingVertical: 13,
    backgroundColor: colors.panelSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tryAgainText: { color: colors.text, fontWeight: '600', fontSize: fontSize.base },
});
