import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, space, radius } from '../../../src/theme';
import { getLessonExercises } from '../../../src/api/exercises';
import {
  getAllCourses,
  getMyEnrollments,
  enrollInCourse,
  getCourseProgress,
  unenrollFromCourse,
} from '../../../src/api/courses';
import { Exercise, LessonProgress } from '../../../src/types/api';
import { usePracticeStore } from '../../../src/store/practice.store';

export default function FlashcardsScreen() {
  const { selectedLesson, setLesson, clearLesson } = usePracticeStore();
  const queryClient = useQueryClient();

  const { data: enrollments = [], isLoading: enrollmentsLoading, refetch: refetchEnrollments } =
    useQuery({ queryKey: ['enrollments'], queryFn: getMyEnrollments });

  const firstEnrollment = enrollments[0] ?? null;

  const { data: courseProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['courseProgress', firstEnrollment?.courseId],
    queryFn: () => getCourseProgress(firstEnrollment!.courseId),
    enabled: !!firstEnrollment,
  });

  const { data: exercises = [], isLoading: exercisesLoading } = useQuery({
    queryKey: ['exercises', selectedLesson?.lessonId],
    queryFn: () => getLessonExercises(selectedLesson!.lessonId),
    enabled: !!selectedLesson,
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  const unenrollMutation = useMutation({
    mutationFn: () => unenrollFromCourse(firstEnrollment!.courseId),
    onSuccess: () => {
      clearLesson();
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });

  const handleUnenroll = () => {
    Alert.alert(
      'Unenroll from course?',
      `You will lose your progress in "${firstEnrollment?.course?.title ?? 'this course'}".`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unenroll',
          style: 'destructive',
          onPress: () => unenrollMutation.mutate(),
        },
      ]
    );
  };

  const isLoading = enrollmentsLoading || (!!firstEnrollment && progressLoading);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (enrollments.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <CourseEnrollPanel onEnrolled={refetchEnrollments} />
      </SafeAreaView>
    );
  }

  if (!selectedLesson) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <CourseHub
          courseProgress={courseProgress}
          enrolledCourse={firstEnrollment}
          onSelectLesson={(lesson) =>
            setLesson({
              lessonId: lesson.lessonId,
              title: lesson.title,
              courseId: firstEnrollment!.courseId,
              courseTitle: firstEnrollment!.course?.title ?? '',
            })
          }
          onUnenroll={handleUnenroll}
          unenrolling={unenrollMutation.isPending}
        />
      </SafeAreaView>
    );
  }

  if (exercisesLoading) {
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
          <Text style={styles.emptyText}>No exercises in this lesson yet.</Text>
          <TouchableOpacity onPress={clearLesson} style={styles.backLink}>
            <Text style={styles.backLinkText}>← Back to lessons</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const exercise = exercises[Math.min(currentIndex, exercises.length - 1)];

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.lessonBanner} onPress={clearLesson}>
          <Text style={styles.lessonBannerText} numberOfLines={1}>
            {selectedLesson.courseTitle} · {selectedLesson.title}
          </Text>
          <Text style={styles.lessonBannerChange}>Change ›</Text>
        </TouchableOpacity>

        <View style={styles.meta}>
          <Text style={styles.eyebrow}>FLASHCARDS — TAP TO FLIP</Text>
          <Text style={styles.counter}>
            {currentIndex + 1} / {exercises.length}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / exercises.length) * 100}%` },
            ]}
          />
        </View>

        <FlashCard exercise={exercise} key={exercise.exerciseId} />

        <View style={styles.nav}>
          <TouchableOpacity
            style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
            onPress={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            <Text style={styles.navBtnText}>← Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.navBtn,
              styles.navBtnNext,
              currentIndex === exercises.length - 1 && styles.navBtnDisabled,
            ]}
            onPress={() => setCurrentIndex((i) => Math.min(exercises.length - 1, i + 1))}
            disabled={currentIndex === exercises.length - 1}
          >
            <Text style={[styles.navBtnText, styles.navBtnTextNext]}>Next →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FlashCard({ exercise }: { exercise: Exercise }) {
  const flip = useSharedValue(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` }],
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  }));

  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 1;
    flip.value = withTiming(toValue, { duration: 300 });
    setIsFlipped(!isFlipped);
  };

  return (
    <TouchableOpacity style={styles.cardWrapper} onPress={handleFlip} activeOpacity={1}>
      <Animated.View style={[styles.card, frontStyle]}>
        <Text style={styles.cardQuestion}>{exercise.question}</Text>
        <Text style={styles.cardHint}>TAP TO REVEAL</Text>
      </Animated.View>
      <Animated.View style={[styles.card, styles.cardBack, backStyle]}>
        <Text style={styles.cardAnswer}>{(exercise as any).correctAnswer ?? '—'}</Text>
        {exercise.points && (
          <Text style={styles.cardPoints}>+{exercise.points} XP</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

function CourseHub({
  courseProgress,
  enrolledCourse,
  onSelectLesson,
  onUnenroll,
  unenrolling,
}: {
  courseProgress: any;
  enrolledCourse: any;
  onSelectLesson: (lesson: LessonProgress) => void;
  onUnenroll: () => void;
  unenrolling: boolean;
}) {
  const course = enrolledCourse?.course;
  const lessons: LessonProgress[] = courseProgress?.lessons ?? [];

  return (
    <ScrollView contentContainerStyle={styles.hubContainer}>
      <View style={styles.hubHeader}>
        <View style={styles.hubTopRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{course?.level ?? '—'}</Text>
          </View>
          <Text style={styles.hubLangText}>{course?.language?.name ?? ''}</Text>
        </View>
        <Text style={styles.hubTitle}>{courseProgress?.title ?? course?.title ?? '—'}</Text>

        <View style={styles.overallProgressRow}>
          <Text style={styles.overallProgressLabel}>Overall progress</Text>
          <Text style={styles.overallProgressValue}>{courseProgress?.totalProgress ?? 0}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${courseProgress?.totalProgress ?? 0}%` }]}
          />
        </View>
      </View>

      <Text style={styles.lessonsHeading}>
        {lessons.length === 0 ? 'No lessons yet' : `Lessons (${lessons.length})`}
      </Text>

      {lessons.length === 0 && (
        <Text style={styles.emptySubtext}>
          This course has no lessons yet. Check back soon.
        </Text>
      )}

      {lessons.map((lesson) => (
        <View key={lesson.lessonId} style={styles.lessonCard}>
          <View style={styles.lessonMeta}>
            <Text style={styles.lessonSeq}>Lesson {lesson.sequence}</Text>
            {lesson.isCompleted && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>Done</Text>
              </View>
            )}
          </View>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>

          <View style={styles.lessonProgressRow}>
            <View style={styles.lessonProgressTrack}>
              <View
                style={[styles.lessonProgressFill, { width: `${lesson.progressPercent}%` }]}
              />
            </View>
            <Text style={styles.lessonProgressText}>
              {lesson.completedExercises}/{lesson.totalExercises}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.practiceBtn, lesson.totalExercises === 0 && styles.practiceBtnDisabled]}
            onPress={() => onSelectLesson(lesson)}
            disabled={lesson.totalExercises === 0}
          >
            <Text style={styles.practiceBtnText}>
              {lesson.totalExercises === 0 ? 'No exercises yet' : 'Practice this lesson'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        style={styles.unenrollBtn}
        onPress={onUnenroll}
        disabled={unenrolling}
      >
        <Text style={styles.unenrollBtnText}>
          {unenrolling ? 'Unenrolling...' : 'Unenroll from this course'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function CourseEnrollPanel({ onEnrolled }: { onEnrolled: () => void }) {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: getAllCourses,
  });

  const enrollMutation = useMutation({
    mutationFn: enrollInCourse,
    onSuccess: onEnrolled,
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.enrollContainer}>
      <Text style={styles.enrollTitle}>Pick a course to start</Text>
      <Text style={styles.enrollSub}>You are not enrolled in any course yet.</Text>
      {courses.map((course) => (
        <View key={course.courseId} style={styles.courseCard}>
          <View style={styles.courseTopRow}>
            <Text style={styles.courseLevel}>{course.level}</Text>
            <Text style={styles.courseLang}>{course.language?.name ?? ''}</Text>
          </View>
          <Text style={styles.courseTitle}>{course.title}</Text>
          {course.description ? (
            <Text style={styles.courseDesc} numberOfLines={2}>{course.description}</Text>
          ) : null}
          <TouchableOpacity
            style={[
              styles.enrollBtn,
              enrollMutation.isPending && styles.enrollBtnDisabled,
            ]}
            onPress={() => enrollMutation.mutate(course.courseId)}
            disabled={enrollMutation.isPending}
          >
            <Text style={styles.enrollBtnText}>
              {enrollMutation.isPending ? 'Enrolling...' : 'Enroll'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: {
    flex: 1,
    paddingHorizontal: space[5],
    paddingVertical: space[4],
    gap: space[3],
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    backgroundColor: colors.bg,
  },
  emptyText: { fontSize: fontSize.md, color: colors.text, fontWeight: '600' },
  emptySubtext: { fontSize: fontSize.base, color: colors.muted },
  backLink: { marginTop: space[2] },
  backLinkText: { fontSize: fontSize.base, color: colors.accent, fontWeight: '600' },

  // Lesson banner (shown when a lesson is active)
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

  // Flashcard area
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontSize: fontSize.xs, fontWeight: '600', color: colors.muted, letterSpacing: 0.18 },
  counter: { fontSize: fontSize.sm, color: colors.muted },
  progressTrack: { height: 4, backgroundColor: colors.panelDeep, borderRadius: radius.xs },
  progressFill: { height: 4, backgroundColor: colors.accent, borderRadius: radius.xs },
  cardWrapper: { flex: 1 },
  card: {
    flex: 1,
    backgroundColor: colors.panel,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space[8],
    gap: space[4],
  },
  cardBack: { backgroundColor: colors.panelSoft, borderColor: colors.accent },
  cardQuestion: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  cardHint: { fontSize: fontSize.xs, fontWeight: '600', color: colors.muted, letterSpacing: 0.18 },
  cardAnswer: { fontSize: fontSize['2xl'], fontWeight: '700', color: colors.accent, textAlign: 'center' },
  cardPoints: { fontSize: fontSize.sm, color: colors.secondary, fontWeight: '700' },
  nav: { flexDirection: 'row', gap: space[3] },
  navBtn: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navBtnNext: { backgroundColor: colors.accent, borderColor: colors.accent },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { color: colors.muted, fontWeight: '600', fontSize: fontSize.base },
  navBtnTextNext: { color: colors.accentInk },

  // Hub
  hubContainer: { padding: space[5], gap: space[4] },
  hubHeader: { gap: space[3] },
  hubTopRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  levelBadge: {
    backgroundColor: 'rgba(232,195,158,0.12)',
    borderRadius: radius.sm,
    paddingHorizontal: space[2],
    paddingVertical: 2,
  },
  levelBadgeText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.accent },
  hubLangText: { fontSize: fontSize.xs, color: colors.muted, fontWeight: '600' },
  hubTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, letterSpacing: -0.4 },
  overallProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overallProgressLabel: { fontSize: fontSize.sm, color: colors.muted },
  overallProgressValue: { fontSize: fontSize.sm, fontWeight: '700', color: colors.accent },
  lessonsHeading: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 0.18,
    textTransform: 'uppercase',
  },
  lessonCard: {
    backgroundColor: colors.panel,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space[5],
    gap: space[3],
  },
  lessonMeta: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  lessonSeq: { fontSize: fontSize.xs, color: colors.muted, fontWeight: '600' },
  completedBadge: {
    backgroundColor: 'rgba(168,196,162,0.15)',
    borderRadius: radius.sm,
    paddingHorizontal: space[2],
    paddingVertical: 1,
  },
  completedBadgeText: { fontSize: fontSize.xs, color: colors.success, fontWeight: '700' },
  lessonTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  lessonProgressRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  lessonProgressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.panelDeep,
    borderRadius: radius.xs,
  },
  lessonProgressFill: { height: 4, backgroundColor: colors.accent, borderRadius: radius.xs },
  lessonProgressText: { fontSize: fontSize.xs, color: colors.muted, minWidth: 30, textAlign: 'right' },
  practiceBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 11,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  practiceBtnDisabled: { backgroundColor: colors.panelSoft },
  practiceBtnText: { color: colors.accentInk, fontWeight: '700', fontSize: fontSize.base },
  unenrollBtn: {
    paddingVertical: 12,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(215,114,96,0.3)',
    marginTop: space[2],
  },
  unenrollBtnText: { color: colors.error, fontWeight: '600', fontSize: fontSize.base },

  // Enroll panel
  enrollContainer: { padding: space[5], gap: space[4] },
  enrollTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, letterSpacing: -0.4 },
  enrollSub: { fontSize: fontSize.base, color: colors.muted, marginBottom: space[2] },
  courseCard: {
    backgroundColor: colors.panel,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space[5],
    gap: space[3],
  },
  courseTopRow: { flexDirection: 'row', gap: space[2], alignItems: 'center' },
  courseLevel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.accent,
    backgroundColor: 'rgba(232,195,158,0.12)',
    paddingHorizontal: space[2],
    paddingVertical: 2,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  courseLang: { fontSize: fontSize.xs, color: colors.muted, fontWeight: '600' },
  courseTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  courseDesc: { fontSize: fontSize.sm, color: colors.muted, lineHeight: 20 },
  enrollBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  enrollBtnDisabled: { opacity: 0.5 },
  enrollBtnText: { color: colors.accentInk, fontWeight: '700', fontSize: fontSize.base },
});
