import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/models/achievement.dart';
import '../../../core/models/user_profile.dart';
import '../../../core/models/user_stats.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../features/auth/domain/auth_notifier.dart';
import '../../../shared/widgets/app_avatar.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_input.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../data/profile_repository.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _isEditing = false;
  bool _isSaving = false;
  String? _saveError;

  final _usernameCtrl = TextEditingController();
  final _bioCtrl = TextEditingController();

  @override
  void dispose() {
    _usernameCtrl.dispose();
    _bioCtrl.dispose();
    super.dispose();
  }

  void _startEdit(UserProfile profile) {
    _usernameCtrl.text = profile.username;
    _bioCtrl.text = profile.bio ?? '';
    setState(() {
      _isEditing = true;
      _saveError = null;
    });
  }

  Future<void> _saveEdit() async {
    setState(() {
      _isSaving = true;
      _saveError = null;
    });
    try {
      final updated = await ref.read(profileRepositoryProvider).updateMyProfile(
            username: _usernameCtrl.text.trim(),
            bio: _bioCtrl.text.trim().isEmpty ? null : _bioCtrl.text.trim(),
          );
      ref.invalidate(myProfileProvider);
      // Update auth store so header shows new username
      final current =
          ref.read(authNotifierProvider).valueOrNull;
      if (current != null && current.user != null) {
        await ref.read(authNotifierProvider.notifier).setAuth(
              accessToken: current.accessToken!,
              refreshToken: '',
              user: updated,
            );
      }
      if (mounted) setState(() => _isEditing = false);
    } catch (e) {
      if (mounted) setState(() => _saveError = e.toString());
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final profileAsync = ref.watch(myProfileProvider);
    final statsAsync = ref.watch(profileStatsProvider);
    final achievementsAsync = ref.watch(myAchievementsProvider);

    return Scaffold(
      body: RefreshIndicator(
        color: AppColors.accent,
        backgroundColor: AppColors.panel,
        onRefresh: () async {
          ref.invalidate(myProfileProvider);
          ref.invalidate(profileStatsProvider);
          ref.invalidate(myAchievementsProvider);
        },
        child: profileAsync.when(
          data: (profile) => CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(
                      AppSpacing.s5, AppSpacing.s7, AppSpacing.s5, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Profile', style: AppTextStyles.heading2),
                      const SizedBox(height: AppSpacing.s6),
                      _ProfileCard(
                        profile: profile,
                        isEditing: _isEditing,
                        isSaving: _isSaving,
                        saveError: _saveError,
                        usernameCtrl: _usernameCtrl,
                        bioCtrl: _bioCtrl,
                        onEdit: () => _startEdit(profile),
                        onSave: _saveEdit,
                        onCancel: () => setState(() {
                          _isEditing = false;
                          _saveError = null;
                        }),
                      ),
                      const SizedBox(height: AppSpacing.s5),
                      statsAsync.when(
                        data: (s) => _StatsRow(stats: s),
                        loading: () => const LoadingIndicator(),
                        error: (_, __) => const SizedBox.shrink(),
                      ),
                      const SizedBox(height: AppSpacing.s6),
                      Text('Achievements', style: AppTextStyles.heading4),
                      const SizedBox(height: AppSpacing.s4),
                    ],
                  ),
                ),
              ),
              achievementsAsync.when(
                data: (list) => _AchievementsList(achievements: list),
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
              const SliverToBoxAdapter(
                  child: SizedBox(height: AppSpacing.s8)),
            ],
          ),
          loading: () => const FullScreenLoader(),
          error: (e, _) => Center(
            child: Text(e.toString(),
                style:
                    AppTextStyles.bodySm.copyWith(color: AppColors.error)),
          ),
        ),
      ),
    );
  }
}

class _ProfileCard extends StatelessWidget {
  final UserProfile profile;
  final bool isEditing;
  final bool isSaving;
  final String? saveError;
  final TextEditingController usernameCtrl;
  final TextEditingController bioCtrl;
  final VoidCallback onEdit;
  final VoidCallback onSave;
  final VoidCallback onCancel;

  const _ProfileCard({
    required this.profile,
    required this.isEditing,
    required this.isSaving,
    this.saveError,
    required this.usernameCtrl,
    required this.bioCtrl,
    required this.onEdit,
    required this.onSave,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        children: [
          Row(
            children: [
              AppAvatar(
                  imageUrl: profile.avatarUrl,
                  name: profile.username,
                  size: 56),
              const SizedBox(width: AppSpacing.s4),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (!isEditing)
                      Text(profile.username, style: AppTextStyles.heading4)
                    else
                      AppInput(
                        label: 'Username',
                        controller: usernameCtrl,
                      ),
                    const SizedBox(height: 4),
                    Text(profile.email, style: AppTextStyles.muted),
                  ],
                ),
              ),
              if (!isEditing)
                IconButton(
                  icon: const Icon(Icons.edit_outlined,
                      color: AppColors.muted, size: 20),
                  onPressed: onEdit,
                ),
            ],
          ),
          if (isEditing) ...[
            const SizedBox(height: AppSpacing.s4),
            AppInput(
              label: 'Bio',
              controller: bioCtrl,
              maxLines: 3,
              hint: 'Tell us about yourself…',
            ),
            if (saveError != null) ...[
              const SizedBox(height: AppSpacing.s3),
              Text(saveError!,
                  style:
                      AppTextStyles.bodySm.copyWith(color: AppColors.error)),
            ],
            const SizedBox(height: AppSpacing.s4),
            Row(
              children: [
                Expanded(
                  child: AppButton(
                    label: 'Cancel',
                    variant: AppButtonVariant.outline,
                    onPressed: onCancel,
                    height: 40,
                  ),
                ),
                const SizedBox(width: AppSpacing.s4),
                Expanded(
                  child: AppButton(
                    label: 'Save',
                    isLoading: isSaving,
                    onPressed: onSave,
                    height: 40,
                  ),
                ),
              ],
            ),
          ] else if (profile.bio != null && profile.bio!.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.s4),
            Align(
              alignment: Alignment.centerLeft,
              child: Text(profile.bio!, style: AppTextStyles.muted),
            ),
          ],
        ],
      ),
    );
  }
}

class _StatsRow extends StatelessWidget {
  final UserStats stats;
  const _StatsRow({required this.stats});

  @override
  Widget build(BuildContext context) {
    final items = [
      ('${stats.totalPoints}', 'Total XP'),
      ('${stats.streak}🔥', 'Streak'),
      ('${stats.exercisesCompleted}', 'Exercises'),
      ('${stats.coursesEnrolled}', 'Courses'),
    ];

    return AppCard(
      child: Row(
        children: items.asMap().entries.map((e) {
          final i = e.key;
          final item = e.value;
          return Expanded(
            child: Row(
              children: [
                if (i > 0)
                  Container(
                      width: 1, height: 32, color: AppColors.border),
                Expanded(
                  child: Column(
                    children: [
                      Text(item.$1, style: AppTextStyles.heading4),
                      const SizedBox(height: 2),
                      Text(item.$2, style: AppTextStyles.mutedSm),
                    ],
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _AchievementsList extends StatelessWidget {
  final List<Achievement> achievements;
  const _AchievementsList({required this.achievements});

  @override
  Widget build(BuildContext context) {
    if (achievements.isEmpty) {
      return SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s5),
          child: AppCard(
            child: Column(
              children: [
                const Icon(Icons.emoji_events_outlined,
                    color: AppColors.muted, size: 40),
                const SizedBox(height: AppSpacing.s3),
                Text('No achievements yet', style: AppTextStyles.muted),
              ],
            ),
          ),
        ),
      );
    }

    return SliverList(
      delegate: SliverChildBuilderDelegate(
        (context, i) {
          final a = achievements[i];
          return Padding(
            padding: const EdgeInsets.fromLTRB(
                AppSpacing.s5, 0, AppSpacing.s5, AppSpacing.s3),
            child: AppCard(
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: a.earnedAt != null
                          ? AppColors.accent.withOpacity(0.15)
                          : AppColors.panelSoft,
                      borderRadius:
                          BorderRadius.circular(AppSpacing.radiusSm),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      a.earnedAt != null ? '🏆' : '🔒',
                      style: const TextStyle(fontSize: 22),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.s4),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(a.title, style: AppTextStyles.labelMd),
                        const SizedBox(height: 2),
                        Text(a.description, style: AppTextStyles.mutedSm),
                      ],
                    ),
                  ),
                  if (a.earnedAt != null)
                    AppBadge(
                      label: 'Earned',
                      variant: AppBadgeVariant.success,
                    ),
                ],
              ),
            ),
          );
        },
        childCount: achievements.length,
      ),
    );
  }
}
