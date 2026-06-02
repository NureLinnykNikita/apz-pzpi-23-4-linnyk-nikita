import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import 'loading_indicator.dart';

enum AppButtonVariant { primary, secondary, outline, ghost, danger }

class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final bool isLoading;
  final bool fullWidth;
  final IconData? icon;
  final double? height;

  const AppButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.isLoading = false,
    this.fullWidth = true,
    this.icon,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    final child = isLoading
        ? const LoadingIndicator(size: 20)
        : _buildLabel();

    final h = height ?? 52.0;

    switch (variant) {
      case AppButtonVariant.primary:
        return SizedBox(
          width: fullWidth ? double.infinity : null,
          height: h,
          child: ElevatedButton(
            onPressed: isLoading ? null : _handlePress,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.accent,
              foregroundColor: AppColors.accentInk,
              disabledBackgroundColor: AppColors.accent.withOpacity(0.5),
            ),
            child: child,
          ),
        );

      case AppButtonVariant.secondary:
        return SizedBox(
          width: fullWidth ? double.infinity : null,
          height: h,
          child: ElevatedButton(
            onPressed: isLoading ? null : _handlePress,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.secondary,
              foregroundColor: AppColors.text,
            ),
            child: child,
          ),
        );

      case AppButtonVariant.outline:
        return SizedBox(
          width: fullWidth ? double.infinity : null,
          height: h,
          child: OutlinedButton(
            onPressed: isLoading ? null : _handlePress,
            child: child,
          ),
        );

      case AppButtonVariant.ghost:
        return SizedBox(
          width: fullWidth ? double.infinity : null,
          height: h,
          child: TextButton(
            onPressed: isLoading ? null : _handlePress,
            child: child,
          ),
        );

      case AppButtonVariant.danger:
        return SizedBox(
          width: fullWidth ? double.infinity : null,
          height: h,
          child: OutlinedButton(
            onPressed: isLoading ? null : _handlePress,
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.error,
              side: const BorderSide(color: AppColors.error),
            ),
            child: child,
          ),
        );
    }
  }

  Widget _buildLabel() {
    if (icon != null) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18),
          const SizedBox(width: 8),
          Text(label, style: AppTextStyles.labelMd),
        ],
      );
    }
    return Text(label, style: AppTextStyles.labelMd);
  }

  void _handlePress() {
    HapticFeedback.lightImpact();
    onPressed?.call();
  }
}
