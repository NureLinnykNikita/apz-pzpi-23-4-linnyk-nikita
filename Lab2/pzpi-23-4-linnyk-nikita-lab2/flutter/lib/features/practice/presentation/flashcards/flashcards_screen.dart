import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/models/lesson.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../features/home/data/home_repository.dart';
import '../../../../shared/widgets/app_badge.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../shared/widgets/app_card.dart';
import '../../../../shared/widgets/loading_indicator.dart';
import '../../data/practice_repository.dart';
import '../../domain/practice_notifier.dart';
import 'flash_card_widget.dart';

class FlashcardsScreen extends ConsumerStatefulWidget {
  const FlashcardsScreen({super.key});

  @override
  ConsumerState<FlashcardsScreen> createState() => _FlashcardsScreenState();
}

class _FlashcardsScreenState extends ConsumerState<FlashcardsScreen> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final selected = ref.watch(practiceNotifierProvider);
    final enrollmentsAsync = ref.watch(myEnrollmentsAsync);

    return enrollmentsAsync.when(
      data: (enrollments) {
        if (enrollments.isEmpty) {
          return _CourseEnrollView();
        }
        if (selected == null) {
          return _CourseHubView(enrollments: enrollments);
        }
        return _FlashcardsView(
          lesson: selected,
          onBack: () {
            ref.read(practiceNotifierProvider.notifier).clearLesson();
            setState(() => _index = 0);
          },
          currentIndex: _index,
          onIndexChanged: (i) => setState(() => _index = i),
        );
      },
      loading: () => const Center(child: LoadingIndicator()),
      error: (e, _) => Center(
        child: Text(e.toString(),
            style: AppTextStyles.bodySm.copyWith(color: AppColors.error)),
      ),
    );
  }
}

// Lazy alias so we can watch + refresh
final myEnrollmentsAsync = myEnrollmentsProvider;

// ─── Course Hub ──────────────────────────────────────────────────────────────

class _CourseHubView extends ConsumerWidget {
  final List<dynamic> enrollments;
  const _CourseHubView({required this.enrollments});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.s5),
      itemCount: enrollments.length,
      itemBuilder: (context, i) {
        final enrollment = enrollments[i];
        return _EnrolledCourseCard(enrollment: enrollment);
      },
    );
  }
}

class _EnrolledCourseCard extends ConsumerWidget {
  final dynamic enrollment;
  const _EnrolledCourseCard({required this.enrollment});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final progressAsync =
        ref.watch(courseProgressProvider(enrollment.courseId));

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.s4),
      child: AppCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                AppBadge(
                  label: enrollment.course.level,
                  variant: AppBadgeVariant.accent,
                ),
                const SizedBox(width: AppSpacing.s3),
                Expanded(
                  child: Text(
                    enrollment.course.title,
                    style: AppTextStyles.heading4,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.s5),
            progressAsync.when(
              data: (progress) => _LessonList(
                progress: progress,
                enrollment: enrollment,
              ),
              loading: () => const LoadingIndicator(),
              error: (e, _) => Text(e.toString(),
                  style:
                      AppTextStyles.bodySm.copyWith(color: AppColors.error)),
            ),
          ],
        ),
      ),
    );
  }
}

class _LessonList extends ConsumerWidget {
  final CourseProgress progress;
  final dynamic enrollment;
  const _LessonList(
      {required this.progress, required this.enrollment});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      children: progress.lessons.map((lesson) {
        return Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.s3),
          child: GestureDetector(
            onTap: () {
              ref.read(practiceNotifierProvider.notifier).setLesson(
                    SelectedLesson(
                      lessonId: lesson.lessonId,
                      title: lesson.title,
                      courseId: enrollment.courseId,
                      courseTitle: enrollment.course.title,
                    ),
                  );
            },
            child: Container(
              padding: const EdgeInsets.all(AppSpacing.s4),
              decoration: BoxDecoration(
                color: AppColors.panelSoft,
                borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              ),
              child: Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: lesson.isCompleted
                          ? AppColors.success.withOpacity(0.15)
                          : AppColors.panel,
                      shape: BoxShape.circle,
                    ),
                    alignment: Alignment.center,
                    child: Icon(
                      lesson.isCompleted
                          ? Icons.check
                          : Icons.play_arrow,
                      color: lesson.isCompleted
                          ? AppColors.success
                          : AppColors.accent,
                      size: 16,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.s4),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(lesson.title, style: AppTextStyles.labelMd),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Text(
                              '${lesson.completedExercises}/${lesson.totalExercises}',
                              style: AppTextStyles.mutedSm,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(
                                    AppSpacing.radiusPill),
                                child: LinearProgressIndicator(
                                  value:
                                      lesson.progressPercent / 100,
                                  minHeight: 4,
                                  backgroundColor:
                                      AppColors.panel,
                                  valueColor:
                                      const AlwaysStoppedAnimation(
                                          AppColors.accent),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

// ─── Course Enroll ───────────────────────────────────────────────────────────

class _CourseEnrollView extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final coursesAsync = ref.watch(allCoursesProvider);

    return coursesAsync.when(
      data: (courses) => ListView.builder(
        padding: const EdgeInsets.all(AppSpacing.s5),
        itemCount: courses.length,
        itemBuilder: (context, i) => _CourseCard(course: courses[i]),
      ),
      loading: () => const Center(child: LoadingIndicator()),
      error: (e, _) => Center(
        child: Text(e.toString(),
            style: AppTextStyles.bodySm.copyWith(color: AppColors.error)),
      ),
    );
  }
}

class _CourseCard extends ConsumerStatefulWidget {
  final dynamic course;
  const _CourseCard({required this.course});

  @override
  ConsumerState<_CourseCard> createState() => _CourseCardState();
}

class _CourseCardState extends ConsumerState<_CourseCard> {
  bool _loading = false;

  Future<void> _enroll() async {
    setState(() => _loading = true);
    try {
      await ref
          .read(practiceRepositoryProvider)
          .enroll(widget.course.courseId);
      ref.invalidate(myEnrollmentsProvider);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.s4),
      child: AppCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                AppBadge(
                  label: widget.course.level,
                  variant: AppBadgeVariant.accent,
                ),
                const SizedBox(width: AppSpacing.s3),
                AppBadge(
                  label: widget.course.language.name,
                  variant: AppBadgeVariant.muted,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.s3),
            Text(widget.course.title, style: AppTextStyles.heading4),
            if (widget.course.description != null) ...[
              const SizedBox(height: AppSpacing.s2),
              Text(widget.course.description!,
                  style: AppTextStyles.muted,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis),
            ],
            const SizedBox(height: AppSpacing.s5),
            AppButton(
              label: 'Enroll',
              isLoading: _loading,
              onPressed: _enroll,
              height: 40,
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Flashcards View ─────────────────────────────────────────────────────────

class _FlashcardsView extends ConsumerWidget {
  final SelectedLesson lesson;
  final VoidCallback onBack;
  final int currentIndex;
  final void Function(int) onIndexChanged;

  const _FlashcardsView({
    required this.lesson,
    required this.onBack,
    required this.currentIndex,
    required this.onIndexChanged,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final exercisesAsync = ref.watch(lessonExercisesProvider(lesson.lessonId));

    return exercisesAsync.when(
      data: (exercises) {
        if (exercises.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('No exercises yet', style: AppTextStyles.heading4),
                const SizedBox(height: AppSpacing.s5),
                AppButton(
                  label: 'Back',
                  variant: AppButtonVariant.outline,
                  onPressed: onBack,
                  fullWidth: false,
                ),
              ],
            ),
          );
        }

        final idx = currentIndex.clamp(0, exercises.length - 1);
        final exercise = exercises[idx];

        return Padding(
          padding: const EdgeInsets.all(AppSpacing.s5),
          child: Column(
            children: [
              // Lesson banner
              GestureDetector(
                onTap: onBack,
                child: Row(
                  children: [
                    const Icon(Icons.arrow_back_ios,
                        size: 16, color: AppColors.muted),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        lesson.title,
                        style: AppTextStyles.labelMd
                            .copyWith(color: AppColors.muted),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Text(
                      '${idx + 1} / ${exercises.length}',
                      style: AppTextStyles.mutedSm,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.s4),

              // Progress bar
              ClipRRect(
                borderRadius:
                    BorderRadius.circular(AppSpacing.radiusPill),
                child: LinearProgressIndicator(
                  value: (idx + 1) / exercises.length,
                  minHeight: 4,
                  backgroundColor: AppColors.panelSoft,
                  valueColor:
                      const AlwaysStoppedAnimation(AppColors.accent),
                ),
              ),
              const SizedBox(height: AppSpacing.s6),

              // Flashcard
              Expanded(child: FlashCardWidget(exercise: exercise)),

              const SizedBox(height: AppSpacing.s6),

              // Prev / Next
              Row(
                children: [
                  Expanded(
                    child: AppButton(
                      label: 'Previous',
                      variant: AppButtonVariant.outline,
                      onPressed:
                          idx > 0 ? () => onIndexChanged(idx - 1) : null,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.s4),
                  Expanded(
                    child: AppButton(
                      label: idx < exercises.length - 1 ? 'Next' : 'Done',
                      onPressed: idx < exercises.length - 1
                          ? () => onIndexChanged(idx + 1)
                          : onBack,
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
      loading: () => const Center(child: LoadingIndicator()),
      error: (e, _) => Center(
        child: Text(e.toString(),
            style: AppTextStyles.bodySm.copyWith(color: AppColors.error)),
      ),
    );
  }
}
