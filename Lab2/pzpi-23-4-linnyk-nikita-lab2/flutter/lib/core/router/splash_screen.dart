import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../shared/widgets/loading_indicator.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Lang', style: AppTextStyles.heading1),
                Text('Bang',
                    style: AppTextStyles.heading1
                        .copyWith(color: AppColors.accent)),
              ],
            ),
            const SizedBox(height: 32),
            const LoadingIndicator(size: 28),
          ],
        ),
      ),
    );
  }
}
