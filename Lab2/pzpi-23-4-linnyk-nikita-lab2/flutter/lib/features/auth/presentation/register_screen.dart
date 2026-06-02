import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/app_input.dart';
import '../domain/auth_notifier.dart';

const _levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const _goals = [5, 10, 15, 20, 25, 30];

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  int _step = 1;
  bool _isLoading = false;
  String? _error;

  // Step 1
  final _formKey = GlobalKey<FormState>();
  final _usernameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();

  // Step 2
  String? _selectedLevel;

  // Step 3
  int _dailyGoal = 10;

  @override
  void dispose() {
    _usernameCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleFinish() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      await ref.read(authNotifierProvider.notifier).register(
            username: _usernameCtrl.text.trim(),
            email: _emailCtrl.text.trim(),
            password: _passwordCtrl.text,
          );
      if (mounted) context.go('/app/home');
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.s5,
            vertical: AppSpacing.s6,
          ),
          child: Column(
            children: [
              _StepIndicator(current: _step, total: 3),
              const SizedBox(height: AppSpacing.s7),
              Expanded(
                child: SingleChildScrollView(
                  child: _buildStep(),
                ),
              ),
              if (_error != null) ...[
                const SizedBox(height: AppSpacing.s3),
                Container(
                  padding: const EdgeInsets.all(AppSpacing.s4),
                  decoration: BoxDecoration(
                    color: AppColors.error.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                  ),
                  child: Text(_error!,
                      style:
                          AppTextStyles.bodySm.copyWith(color: AppColors.error)),
                ),
              ],
              const SizedBox(height: AppSpacing.s5),
              _buildNavRow(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStep() {
    return switch (_step) {
      1 => _Step1(
          formKey: _formKey,
          usernameCtrl: _usernameCtrl,
          emailCtrl: _emailCtrl,
          passwordCtrl: _passwordCtrl,
        ),
      2 => _Step2(
          selectedLevel: _selectedLevel,
          onLevelChanged: (l) => setState(() => _selectedLevel = l),
        ),
      3 => _Step3(
          dailyGoal: _dailyGoal,
          onGoalChanged: (g) => setState(() => _dailyGoal = g),
        ),
      _ => const SizedBox.shrink(),
    };
  }

  Widget _buildNavRow() {
    final isLast = _step == 3;
    return Row(
      children: [
        if (_step > 1) ...[
          Expanded(
            child: AppButton(
              label: 'Back',
              variant: AppButtonVariant.outline,
              onPressed: () => setState(() => _step--),
            ),
          ),
          const SizedBox(width: AppSpacing.s4),
        ],
        Expanded(
          child: AppButton(
            label: isLast ? 'Get Started' : 'Continue',
            isLoading: _isLoading,
            onPressed: isLast ? _handleFinish : _handleNext,
          ),
        ),
      ],
    );
  }

  void _handleNext() {
    if (_step == 1 && !_formKey.currentState!.validate()) return;
    if (_step == 2 && _selectedLevel == null) {
      setState(() => _error = 'Please select your level');
      return;
    }
    setState(() {
      _error = null;
      _step++;
    });
  }
}

class _StepIndicator extends StatelessWidget {
  final int current;
  final int total;
  const _StepIndicator({required this.current, required this.total});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(total, (i) {
        final active = i + 1 == current;
        final done = i + 1 < current;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          margin: const EdgeInsets.symmetric(horizontal: 4),
          width: active ? 24 : 8,
          height: 8,
          decoration: BoxDecoration(
            color: done || active ? AppColors.accent : AppColors.panelSoft,
            borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
          ),
        );
      }),
    );
  }
}

class _Step1 extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final TextEditingController usernameCtrl;
  final TextEditingController emailCtrl;
  final TextEditingController passwordCtrl;

  const _Step1({
    required this.formKey,
    required this.usernameCtrl,
    required this.emailCtrl,
    required this.passwordCtrl,
  });

  @override
  Widget build(BuildContext context) {
    return Form(
      key: formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Create your account', style: AppTextStyles.heading3),
          const SizedBox(height: AppSpacing.s2),
          Text('Start your language learning journey',
              style: AppTextStyles.muted),
          const SizedBox(height: AppSpacing.s7),
          AppInput(
            label: 'Username',
            hint: 'your_username',
            controller: usernameCtrl,
            textInputAction: TextInputAction.next,
            validator: (v) {
              if (v == null || v.trim().isEmpty) return 'Username is required';
              if (v.trim().length < 3) return 'Min 3 characters';
              return null;
            },
          ),
          const SizedBox(height: AppSpacing.s5),
          AppInput(
            label: 'Email',
            hint: 'your@email.com',
            controller: emailCtrl,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.next,
            validator: (v) {
              if (v == null || v.trim().isEmpty) return 'Email is required';
              if (!v.contains('@')) return 'Invalid email';
              return null;
            },
          ),
          const SizedBox(height: AppSpacing.s5),
          AppInput(
            label: 'Password',
            hint: '••••••••',
            controller: passwordCtrl,
            obscureText: true,
            textInputAction: TextInputAction.done,
            validator: (v) {
              if (v == null || v.isEmpty) return 'Password is required';
              if (v.length < 6) return 'Min 6 characters';
              return null;
            },
          ),
        ],
      ),
    );
  }
}

class _Step2 extends StatelessWidget {
  final String? selectedLevel;
  final void Function(String) onLevelChanged;

  const _Step2({required this.selectedLevel, required this.onLevelChanged});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('What is your level?', style: AppTextStyles.heading3),
        const SizedBox(height: AppSpacing.s2),
        Text('We\'ll personalise content for you',
            style: AppTextStyles.muted),
        const SizedBox(height: AppSpacing.s7),
        Wrap(
          spacing: AppSpacing.s3,
          runSpacing: AppSpacing.s3,
          children: _levels.map((level) {
            final selected = level == selectedLevel;
            return GestureDetector(
              onTap: () => onLevelChanged(level),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.s5,
                  vertical: AppSpacing.s4,
                ),
                decoration: BoxDecoration(
                  color: selected ? AppColors.accent : AppColors.panelSoft,
                  borderRadius:
                      BorderRadius.circular(AppSpacing.radiusMd),
                  border: Border.all(
                    color: selected
                        ? AppColors.accent
                        : AppColors.border,
                  ),
                ),
                child: Text(
                  level,
                  style: AppTextStyles.labelMd.copyWith(
                    color: selected
                        ? AppColors.accentInk
                        : AppColors.text,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: AppSpacing.s5),
        AppBadge(label: _levelDescription(selectedLevel)),
      ],
    );
  }

  String _levelDescription(String? level) => switch (level) {
        'A1' => 'Beginner — just starting out',
        'A2' => 'Elementary — basic communication',
        'B1' => 'Intermediate — can handle most situations',
        'B2' => 'Upper Intermediate — fluent in many contexts',
        'C1' => 'Advanced — near-native proficiency',
        'C2' => 'Mastery — native-like fluency',
        _ => 'Select your proficiency level',
      };
}

class _Step3 extends StatelessWidget {
  final int dailyGoal;
  final void Function(int) onGoalChanged;

  const _Step3({required this.dailyGoal, required this.onGoalChanged});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Set your daily goal', style: AppTextStyles.heading3),
        const SizedBox(height: AppSpacing.s2),
        Text('Consistency is the key to fluency', style: AppTextStyles.muted),
        const SizedBox(height: AppSpacing.s8),
        Center(
          child: Text(
            '$dailyGoal',
            style: AppTextStyles.heading1.copyWith(
              fontSize: 72,
              color: AppColors.accent,
            ),
          ),
        ),
        Center(
          child: Text('exercises per day', style: AppTextStyles.muted),
        ),
        const SizedBox(height: AppSpacing.s7),
        Wrap(
          spacing: AppSpacing.s3,
          runSpacing: AppSpacing.s3,
          children: _goals.map((g) {
            final selected = g == dailyGoal;
            return GestureDetector(
              onTap: () => onGoalChanged(g),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.s5,
                  vertical: AppSpacing.s3,
                ),
                decoration: BoxDecoration(
                  color: selected ? AppColors.accent : AppColors.panelSoft,
                  borderRadius:
                      BorderRadius.circular(AppSpacing.radiusPill),
                  border: Border.all(
                    color: selected ? AppColors.accent : AppColors.border,
                  ),
                ),
                child: Text(
                  '$g',
                  style: AppTextStyles.labelMd.copyWith(
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
