import 'dart:math';
import 'package:flutter/material.dart';
import '../../../../core/models/exercise.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_text_styles.dart';

class FlashCardWidget extends StatefulWidget {
  final Exercise exercise;
  const FlashCardWidget({super.key, required this.exercise});

  @override
  State<FlashCardWidget> createState() => _FlashCardWidgetState();
}

class _FlashCardWidgetState extends State<FlashCardWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  bool _isFlipped = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 320),
      vsync: this,
    );
    _animation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    );
  }

  @override
  void didUpdateWidget(FlashCardWidget old) {
    super.didUpdateWidget(old);
    if (old.exercise.exerciseId != widget.exercise.exerciseId) {
      _controller.reset();
      _isFlipped = false;
    }
  }

  void _flip() {
    if (_isFlipped) {
      _controller.reverse();
    } else {
      _controller.forward();
    }
    setState(() => _isFlipped = !_isFlipped);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _flip,
      child: AnimatedBuilder(
        animation: _animation,
        builder: (context, _) {
          final value = _animation.value;
          final showBack = value > 0.5;

          // Front rotates 0 → π; back starts at -π and rotates to 0
          final angle = showBack
              ? (value - 1.0) * pi
              : value * pi;

          return Transform(
            transform: Matrix4.identity()
              ..setEntry(3, 2, 0.001)
              ..rotateY(angle),
            alignment: Alignment.center,
            child: showBack
                ? Transform(
                    transform: Matrix4.identity()..rotateY(pi),
                    alignment: Alignment.center,
                    child: _buildBack(),
                  )
                : _buildFront(),
          );
        },
      ),
    );
  }

  Widget _buildFront() {
    return _CardFace(
      backgroundColor: AppColors.panel,
      borderColor: AppColors.border,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            widget.exercise.type.toUpperCase(),
            style: AppTextStyles.labelXs
                .copyWith(color: AppColors.muted, letterSpacing: 1.5),
          ),
          const SizedBox(height: 16),
          Text(
            widget.exercise.question,
            style: AppTextStyles.heading4,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.touch_app, size: 16, color: AppColors.muted),
              const SizedBox(width: 6),
              Text('Tap to reveal',
                  style: AppTextStyles.mutedSm
                      .copyWith(letterSpacing: 0.5)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBack() {
    final answer = _answerFromMetadata();
    return _CardFace(
      backgroundColor: AppColors.panelSoft,
      borderColor: AppColors.accent,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Answer',
            style: AppTextStyles.labelXs
                .copyWith(color: AppColors.accent, letterSpacing: 1.5),
          ),
          const SizedBox(height: 16),
          Text(
            answer,
            style: AppTextStyles.heading4,
            textAlign: TextAlign.center,
          ),
          if (widget.exercise.points != null) ...[
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.s4, vertical: AppSpacing.s2),
              decoration: BoxDecoration(
                color: AppColors.accent.withOpacity(0.15),
                borderRadius:
                    BorderRadius.circular(AppSpacing.radiusPill),
              ),
              child: Text(
                '+${widget.exercise.points} XP',
                style: AppTextStyles.labelSm
                    .copyWith(color: AppColors.accent),
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _answerFromMetadata() {
    final meta = widget.exercise.metadata;
    if (meta == null) return '—';
    return (meta['answer'] ??
            meta['correctAnswer'] ??
            meta['translation'] ??
            '—')
        .toString();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}

class _CardFace extends StatelessWidget {
  final Color backgroundColor;
  final Color borderColor;
  final Widget child;

  const _CardFace({
    required this.backgroundColor,
    required this.borderColor,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      constraints: const BoxConstraints(minHeight: 260),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
        border: Border.all(color: borderColor, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.15),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      padding: const EdgeInsets.all(AppSpacing.s7),
      child: child,
    );
  }
}
