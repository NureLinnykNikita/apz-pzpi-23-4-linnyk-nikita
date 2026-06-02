import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';

class AppAvatar extends StatelessWidget {
  final String? imageUrl;
  final String? name;
  final double size;

  const AppAvatar({
    super.key,
    this.imageUrl,
    this.name,
    this.size = 40,
  });

  @override
  Widget build(BuildContext context) {
    final radius = size / 2;
    final initials = _initials(name);

    if (imageUrl != null && imageUrl!.isNotEmpty) {
      return ClipOval(
        child: CachedNetworkImage(
          imageUrl: imageUrl!,
          width: size,
          height: size,
          fit: BoxFit.cover,
          placeholder: (_, __) => _placeholder(radius, initials),
          errorWidget: (_, __, ___) => _placeholder(radius, initials),
        ),
      );
    }

    return _placeholder(radius, initials);
  }

  Widget _placeholder(double radius, String initials) {
    return Container(
      width: size,
      height: size,
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
        color: AppColors.panelSoft,
      ),
      alignment: Alignment.center,
      child: Text(
        initials,
        style: AppTextStyles.labelMd.copyWith(
          fontSize: size * 0.35,
          color: AppColors.accent,
        ),
      ),
    );
  }

  static String _initials(String? name) {
    if (name == null || name.isEmpty) return '?';
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
  }
}
