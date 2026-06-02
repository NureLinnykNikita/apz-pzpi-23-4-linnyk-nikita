import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/models/course.dart';
import '../../../core/models/user_stats.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../features/auth/domain/auth_notifier.dart';
import '../../../shared/widgets/app_avatar.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../data/home_repository.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final statsAsync = ref.watch(myStatsProvider);
    final enrollmentsAsync = ref.watch(myEnrollmentsProvider);

    return Scaffold(
      body: RefreshIndicator(
        color: AppColors.accent,
        backgroundColor: AppColors.panel,
        onRefresh: () async {
          ref.invalidate(myStatsProvider);
          ref.invalidate(myEnrollmentsProvider);
        },
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(
                    AppSpacing.s5, AppSpacing.s7, AppSpacing.s5, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _Header(user: user),
                    const SizedBox(height: AppSpacing.s6),
                    statsAsync.when(
                      data: (s) => _StatsCard(stats: s),
                      loading: () => const LoadingIndicator(),
                      error: (e, _) => Text(e.toString(),
                          style: AppTextStyles.bodySm
                              .copyWith(color: AppColors.error)),
                    ),
                    const SizedBox(height: AppSpacing.s5),
                    statsAsync.when(
                      data: (s) => _GoalCard(stats: s),
                      loading: () => const SizedBox.shrink(),
                      error: (_, __) => const SizedBox.shrink(),
                    ),
                    const SizedBox(height: AppSpacing.s6),
                    Text('Your Languages', style: AppTextStyles.heading4),
                    const SizedBox(height: AppSpacing.s4),
                  ],
                ),
              ),
            ),
            enrollmentsAsync.when(
              data: (enrollments) => _EnrollmentsList(
                  enrollments: enrollments),
              loading: () => const SliverToBoxAdapter(
                  child: Center(child: LoadingIndicator())),
              error: (e, _) => SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.s5),
                  child: Text(e.toString(),
                      style: AppTextStyles.bodySm
                          .copyWith(color: AppColors.error)),
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.s5),
                child: _PracticePromptCard(
                    onTap: () => context.go('/app/practice')),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.s8)),
          ],
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  final dynamic user;
  const _Header({this.user});

  @override
  Widget build(BuildContext context) {
    final username = user?.username ?? 'Learner';
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _greeting(),
                style: AppTextStyles.muted,
              ),
              Text(username, style: AppTextStyles.heading3),
            ],
          ),
        ),
        AppAvatar(
          imageUrl: user?.avatarUrl,
          name: username,
          size: 44,
        ),
      ],
    );
  }

  String _greeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good morning 🌅';
    if (h < 17) return 'Good afternoon ☀️';
    return 'Good evening 🌙';
  }
}

class _StatsCard extends StatelessWidget {
  final UserStats stats;
  const _StatsCard({required this.stats});

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Row(
        children: [
          _StatPill(value: stats.totalPoints.toString(), label: 'XP'),
          _Divider(),
          _StatPill(
              value: _level(stats.totalPoints).toString(), label: 'Level'),
          _Divider(),
          _StatPill(
              value: '${stats.streak}🔥', label: 'Streak'),
        ],
      ),
    );
  }

  int _level(int xp) => (xp / 100).floor() + 1;
}

class _StatPill extends StatelessWidget {
  final String value;
  final String label;
  const _StatPill({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text(value, style: AppTextStyles.heading4),
          const SizedBox(height: 2),
          Text(label, style: AppTextStyles.mutedSm),
        ],
      ),
    );
  }
}

class _Divider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 1,
      height: 32,
      color: AppColors.border,
    );
  }
}

class _GoalCard extends StatelessWidget {
  final UserStats stats;
  const _GoalCard({required this.stats});

  @override
  Widget build(BuildContext context) {
    final progress =
        stats.dailyGoal > 0 ? stats.todayExercises / stats.dailyGoal : 0.0;
    final pct = (progress * 100).clamp(0.0, 100.0).toInt();

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Daily Goal', style: AppTextStyles.labelMd),
              AppBadge(
                label: '$pct%',
                variant: progress >= 1
                    ? AppBadgeVariant.success
                    : AppBadgeVariant.accent,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.s4),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
            child: LinearProgressIndicator(
              value: progress.clamp(0.0, 1.0),
              minHeight: 8,
              backgroundColor: AppColors.panelSoft,
              valueColor:
                  const AlwaysStoppedAnimation(AppColors.accent),
            ),
          ),
          const SizedBox(height: AppSpacing.s3),
          Text(
            '${stats.todayExercises} / ${stats.dailyGoal} exercises',
            style: AppTextStyles.mutedSm,
          ),
        ],
      ),
    );
  }
}

class _EnrollmentsList extends StatelessWidget {
  final List<Enrollment> enrollments;
  const _EnrollmentsList({required this.enrollments});

  @override
  Widget build(BuildContext context) {
    if (enrollments.isEmpty) {
      return SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.s5, vertical: AppSpacing.s4),
          child: AppCard(
            child: Column(
              children: [
                const Icon(Icons.translate, color: AppColors.muted, size: 40),
                const SizedBox(height: AppSpacing.s4),
                Text('No courses yet', style: AppTextStyles.heading4),
                const SizedBox(height: AppSpacing.s2),
                Text('Start learning by enrolling in a course',
                    style: AppTextStyles.muted,
                    textAlign: TextAlign.center),
                const SizedBox(height: AppSpacing.s5),
                TextButton(
                  onPressed: () => context.go('/app/practice'),
                  child: Text('Browse Courses',
                      style: AppTextStyles.labelMd
                          .copyWith(color: AppColors.accent)),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return SliverList(
      delegate: SliverChildBuilderDelegate(
        (context, i) {
          final e = enrollments[i];
          return Padding(
            padding: const EdgeInsets.fromLTRB(
                AppSpacing.s5, 0, AppSpacing.s5, AppSpacing.s3),
            child: _EnrollmentCard(enrollment: e),
          );
        },
        childCount: enrollments.length,
      ),
    );
  }
}

class _EnrollmentCard extends StatelessWidget {
  final Enrollment enrollment;
  const _EnrollmentCard({required this.enrollment});

  @override
  Widget build(BuildContext context) {
    final pct = (enrollment.progress * 100).toInt();
    return AppCard(
      onTap: () => context.go('/app/practice'),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.panelSoft,
              borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
            ),
            alignment: Alignment.center,
            child: Text(
              enrollment.course.language.code.toUpperCase(),
              style: AppTextStyles.labelMd,
            ),
          ),
          const SizedBox(width: AppSpacing.s4),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(enrollment.course.title,
                    style: AppTextStyles.labelMd,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
                const SizedBox(height: 4),
                Row(
                  children: [
                    AppBadge(
                      label: enrollment.course.level,
                      variant: AppBadgeVariant.muted,
                    ),
                    const SizedBox(width: 8),
                    Text('$pct% complete',
                        style: AppTextStyles.mutedSm),
                  ],
                ),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius:
                      BorderRadius.circular(AppSpacing.radiusPill),
                  child: LinearProgressIndicator(
                    value: enrollment.progress.clamp(0.0, 1.0),
                    minHeight: 4,
                    backgroundColor: AppColors.panelSoft,
                    valueColor:
                        const AlwaysStoppedAnimation(AppColors.accent),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: AppSpacing.s3),
          const Icon(Icons.chevron_right, color: AppColors.muted, size: 20),
        ],
      ),
    );
  }
}

class _PracticePromptCard extends StatelessWidget {
  final VoidCallback onTap;
  const _PracticePromptCard({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return AppCard(
      color: AppColors.panelSoft,
      onTap: onTap,
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Ready to practice?', style: AppTextStyles.heading4),
                const SizedBox(height: 4),
                Text('Continue where you left off',
                    style: AppTextStyles.muted),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(AppSpacing.s4),
            decoration: BoxDecoration(
              color: AppColors.accent.withOpacity(0.15),
              borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
            ),
            child: const Icon(Icons.play_arrow,
                color: AppColors.accent, size: 24),
          ),
        ],
      ),
    );
  }
}
