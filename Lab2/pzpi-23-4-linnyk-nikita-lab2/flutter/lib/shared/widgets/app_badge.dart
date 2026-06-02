import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/theme/app_spacing.dart';

enum AppBadgeVariant { accent, secondary, muted, success, error, info }

class AppBadge extends StatelessWidget {
  final String label;
  final AppBadgeVariant variant;
  final double? fontSize;

  const AppBadge({
    super.key,
    required this.label,
    this.variant = AppBadgeVariant.accent,
    this.fontSize,
  });

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = _colors();
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.s3,
        vertical: AppSpacing.s1 + 1,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius:
            BorderRadius.circular(AppSpacing.radiusPill),
      ),
      child: Text(
        label,
        style: AppTextStyles.labelXs.copyWith(
          color: fg,
          fontSize: fontSize ?? 10,
        ),
      ),
    );
  }

  (Color, Color) _colors() => switch (variant) {
        AppBadgeVariant.accent => (
            AppColors.accent.withOpacity(0.15),
            AppColors.accent
          ),
        AppBadgeVariant.secondary => (
            AppColors.secondary.withOpacity(0.15),
            AppColors.secondary
          ),
        AppBadgeVariant.muted => (
            AppColors.muted.withOpacity(0.15),
            AppColors.muted
          ),
        AppBadgeVariant.success => (
            AppColors.success.withOpacity(0.15),
            AppColors.success
          ),
        AppBadgeVariant.error => (
            AppColors.error.withOpacity(0.15),
            AppColors.error
          ),
        AppBadgeVariant.info => (
            AppColors.info.withOpacity(0.15),
            AppColors.info
          ),
      };
}
