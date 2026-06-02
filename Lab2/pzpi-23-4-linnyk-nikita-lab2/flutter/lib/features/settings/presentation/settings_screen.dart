import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../features/auth/domain/auth_notifier.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../data/settings_repository.dart';

const _goals = [5, 10, 15, 20, 25, 30];

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _isLoggingOut = false;

  Future<void> _handleLogout() async {
    setState(() => _isLoggingOut = true);
    try {
      await ref.read(authNotifierProvider.notifier).logout();
      if (mounted) context.go('/auth/login');
    } catch (_) {
      if (mounted) setState(() => _isLoggingOut = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    final settingsAsync = ref.watch(userSettingsProvider);

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.s5),
          children: [
            const SizedBox(height: AppSpacing.s3),
            Text('Settings', style: AppTextStyles.heading2),
            const SizedBox(height: AppSpacing.s6),

            // Account section
            _SectionLabel('Account'),
            _InfoTile(
              label: 'Username',
              value: user?.username ?? '—',
            ),
            _InfoTile(
              label: 'Email',
              value: user?.email ?? '—',
            ),
            const SizedBox(height: AppSpacing.s6),

            // Daily goal
            _SectionLabel('Daily Goal'),
            settingsAsync.when(
              data: (settings) => _GoalSelector(
                current: settings.dailyGoalExercises,
                onChanged: (goal) async {
                  try {
                    await ref
                        .read(settingsRepositoryProvider)
                        .updateSettings(dailyGoalExercises: goal);
                    ref.invalidate(userSettingsProvider);
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(e.toString())));
                    }
                  }
                },
              ),
              loading: () => const LoadingIndicator(),
              error: (e, _) => Text(e.toString(),
                  style:
                      AppTextStyles.bodySm.copyWith(color: AppColors.error)),
            ),
            const SizedBox(height: AppSpacing.s6),

            // Notifications
            _SectionLabel('Notifications'),
            settingsAsync.when(
              data: (settings) => _NotificationsTile(
                enabled: settings.notificationsEnabled,
                onChanged: (val) async {
                  try {
                    await ref
                        .read(settingsRepositoryProvider)
                        .updateSettings(notificationsEnabled: val);
                    ref.invalidate(userSettingsProvider);
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(e.toString())));
                    }
                  }
                },
              ),
              loading: () => const LoadingIndicator(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            const SizedBox(height: AppSpacing.s6),

            // Security
            _SectionLabel('Security'),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text('Change Password', style: AppTextStyles.bodyMd),
              trailing: const Icon(Icons.chevron_right,
                  color: AppColors.muted, size: 20),
              onTap: () => context.push('/auth/reset-password'),
            ),
            const Divider(color: AppColors.border),
            const SizedBox(height: AppSpacing.s6),

            // Sign out
            AppButton(
              label: 'Sign Out',
              variant: AppButtonVariant.danger,
              isLoading: _isLoggingOut,
              onPressed: _handleLogout,
            ),
            const SizedBox(height: AppSpacing.s5),
          ],
        ),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String text;
  const _SectionLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.s3),
      child: Text(
        text.toUpperCase(),
        style: AppTextStyles.labelXs.copyWith(
            color: AppColors.muted, letterSpacing: 1.2),
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  final String label;
  final String value;
  const _InfoTile({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
          vertical: AppSpacing.s4, horizontal: AppSpacing.s4),
      margin: const EdgeInsets.only(bottom: AppSpacing.s2),
      decoration: BoxDecoration(
        color: AppColors.panelSoft,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTextStyles.muted),
          Text(value, style: AppTextStyles.bodyMd),
        ],
      ),
    );
  }
}

class _GoalSelector extends StatelessWidget {
  final int current;
  final void Function(int) onChanged;
  const _GoalSelector({required this.current, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '$current exercises per day',
          style: AppTextStyles.heading4.copyWith(color: AppColors.accent),
        ),
        const SizedBox(height: AppSpacing.s4),
        Wrap(
          spacing: AppSpacing.s3,
          runSpacing: AppSpacing.s3,
          children: _goals.map((g) {
            final selected = g == current;
            return GestureDetector(
              onTap: () => onChanged(g),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.s4, vertical: AppSpacing.s2),
                decoration: BoxDecoration(
                  color: selected ? AppColors.accent : AppColors.panelSoft,
                  borderRadius:
                      BorderRadius.circular(AppSpacing.radiusPill),
                  border: Border.all(
                      color: selected ? AppColors.accent : AppColors.border),
                ),
                child: Text(
                  '$g',
                  style: AppTextStyles.labelSm.copyWith(
                    color: selected ? AppColors.accentInk : AppColors.text,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

class _NotificationsTile extends StatelessWidget {
  final bool enabled;
  final void Function(bool) onChanged;
  const _NotificationsTile(
      {required this.enabled, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
          vertical: AppSpacing.s2, horizontal: AppSpacing.s4),
      decoration: BoxDecoration(
        color: AppColors.panelSoft,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      ),
      child: SwitchListTile(
        contentPadding: EdgeInsets.zero,
        title: Text('Push Notifications', style: AppTextStyles.bodyMd),
        value: enabled,
        onChanged: onChanged,
        activeColor: AppColors.accent,
      ),
    );
  }
}
