import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/models/exercise.dart';
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

class QuizScreen extends ConsumerStatefulWidget {
  const QuizScreen({super.key});

  @override
  ConsumerState<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends ConsumerState<QuizScreen> {
  int _index = 0;
  String? _selectedAnswer;
  ExerciseSubmitResult? _result;
  bool _isSubmitting = false;
  int _totalXp = 0;
  bool _completed = false;

  @override
  Widget build(BuildContext context) {
    final selected = ref.watch(practiceNotifierProvider);

    if (selected == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.s7),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.quiz_outlined,
                  color: AppColors.muted, size: 48),
              const SizedBox(height: AppSpacing.s5),
              Text('Select a lesson first', style: AppTextStyles.heading4),
              const SizedBox(height: AppSpacing.s2),
              Text(
                'Go to Flashcards tab and choose a lesson to practice',
                style: AppTextStyles.muted,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    final exercisesAsync = ref.watch(lessonExercisesProvider(selected.lessonId));

    return exercisesAsync.when(
      data: (exercises) {
        if (exercises.isEmpty) {
          return const Center(child: Text('No exercises'));
        }
        if (_completed) {
          return _SummaryView(
            totalXp: _totalXp,
            total: exercises.length,
            onRetry: () => setState(() {
              _index = 0;
              _selectedAnswer = null;
              _result = null;
              _totalXp = 0;
              _completed = false;
            }),
            onBack: () =>
                ref.read(practiceNotifierProvider.notifier).clearLesson(),
          );
        }

        final idx = _index.clamp(0, exercises.length - 1);
        final exercise = exercises[idx];
        final options = _buildOptions(exercise);

        return _buildQuizView(exercise, options, exercises.length, idx);
      },
      loading: () => const Center(child: LoadingIndicator()),
      error: (e, _) => Center(
        child: Text(e.toString(),
            style: AppTextStyles.bodySm.copyWith(color: AppColors.error)),
      ),
    );
  }

  Widget _buildQuizView(
    Exercise exercise,
    List<String> options,
    int total,
    int idx,
  ) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.s5),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Text('${idx + 1} / $total', style: AppTextStyles.mutedSm),
              const Spacer(),
              AppBadge(label: '+$_totalXp XP', variant: AppBadgeVariant.accent),
            ],
          ),
          const SizedBox(height: AppSpacing.s4),

          ClipRRect(
            borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
            child: LinearProgressIndicator(
              value: (idx + 1) / total,
              minHeight: 4,
              backgroundColor: AppColors.panelSoft,
              valueColor: const AlwaysStoppedAnimation(AppColors.accent),
            ),
          ),
          const SizedBox(height: AppSpacing.s6),

          // Question
          AppCard(
            child: Text(exercise.question, style: AppTextStyles.heading4),
          ),
          const SizedBox(height: AppSpacing.s5),

          // Options
          Expanded(
            child: ListView(
              children: options.map((opt) {
                final isSelected = _selectedAnswer == opt;
                final isCorrect = _result != null && isSelected && _result!.isCorrect;
                final isWrong = _result != null && isSelected && !_result!.isCorrect;

                Color borderColor = AppColors.border;
                Color bgColor = AppColors.panelSoft;

                if (isCorrect) {
                  borderColor = AppColors.success;
                  bgColor = AppColors.success.withOpacity(0.1);
                } else if (isWrong) {
                  borderColor = AppColors.error;
                  bgColor = AppColors.error.withOpacity(0.1);
                } else if (isSelected) {
                  borderColor = AppColors.accent;
                  bgColor = AppColors.accent.withOpacity(0.1);
                }

                return Padding(
                  padding: const EdgeInsets.only(bottom: AppSpacing.s3),
                  child: GestureDetector(
                    onTap: _result == null
                        ? () => setState(() => _selectedAnswer = opt)
                        : null,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.all(AppSpacing.s5),
                      decoration: BoxDecoration(
                        color: bgColor,
                        borderRadius:
                            BorderRadius.circular(AppSpacing.radiusMd),
                        border: Border.all(color: borderColor),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                              child: Text(opt, style: AppTextStyles.bodyMd)),
                          if (isCorrect)
                            const Icon(Icons.check_circle,
                                color: AppColors.success, size: 20),
                          if (isWrong)
                            const Icon(Icons.cancel,
                                color: AppColors.error, size: 20),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          // Submit / Next
          if (_result == null)
            AppButton(
              label: 'Submit',
              isLoading: _isSubmitting,
              onPressed: _selectedAnswer != null ? _submit : null,
            )
          else
            AppButton(
              label:
                  _index < (ref.read(lessonExercisesProvider(ref.read(practiceNotifierProvider)!.lessonId)).value?.length ?? 1) - 1
                      ? 'Next'
                      : 'Finish',
              onPressed: _next,
            ),
        ],
      ),
    );
  }

  Future<void> _submit() async {
    if (_selectedAnswer == null) return;
    final selected = ref.read(practiceNotifierProvider)!;
    final exercises =
        ref.read(lessonExercisesProvider(selected.lessonId)).value!;
    final exercise = exercises[_index];

    setState(() => _isSubmitting = true);
    try {
      final result = await ref
          .read(practiceRepositoryProvider)
          .submitExercise(exercise.exerciseId, _selectedAnswer!);
      setState(() {
        _result = result;
        _totalXp += result.earnedPoints;
      });
      if (result.isCorrect) {
        ref.invalidate(myStatsProvider);
        ref.invalidate(courseProgressProvider(selected.courseId));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  void _next() {
    final selected = ref.read(practiceNotifierProvider)!;
    final total = ref
            .read(lessonExercisesProvider(selected.lessonId))
            .value
            ?.length ??
        0;

    if (_index >= total - 1) {
      setState(() => _completed = true);
    } else {
      setState(() {
        _index++;
        _selectedAnswer = null;
        _result = null;
      });
    }
  }

  List<String> _buildOptions(Exercise exercise) {
    final meta = exercise.metadata;
    if (meta != null && meta['options'] is List) {
      return (meta['options'] as List).map((e) => e.toString()).toList();
    }
    // Fallback: show question as only option
    return [exercise.question];
  }
}

class _SummaryView extends StatelessWidget {
  final int totalXp;
  final int total;
  final VoidCallback onRetry;
  final VoidCallback onBack;

  const _SummaryView({
    required this.totalXp,
    required this.total,
    required this.onRetry,
    required this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.s7),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.emoji_events, color: AppColors.accent, size: 64),
          const SizedBox(height: AppSpacing.s5),
          Text('Lesson Complete!', style: AppTextStyles.heading2),
          const SizedBox(height: AppSpacing.s3),
          Text('You earned', style: AppTextStyles.muted),
          const SizedBox(height: AppSpacing.s3),
          Text('+$totalXp XP',
              style: AppTextStyles.heading1
                  .copyWith(color: AppColors.accent)),
          const SizedBox(height: AppSpacing.s8),
          AppButton(label: 'Try Again', onPressed: onRetry),
          const SizedBox(height: AppSpacing.s4),
          AppButton(
            label: 'Back to Lessons',
            variant: AppButtonVariant.outline,
            onPressed: onBack,
          ),
        ],
      ),
    );
  }
}
