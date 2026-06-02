import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_input.dart';
import '../data/auth_repository.dart';

enum _Stage { email, code, password, done }

class ResetPasswordScreen extends ConsumerStatefulWidget {
  const ResetPasswordScreen({super.key});

  @override
  ConsumerState<ResetPasswordScreen> createState() =>
      _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends ConsumerState<ResetPasswordScreen> {
  _Stage _stage = _Stage.email;
  bool _isLoading = false;
  String? _error;
  String? _resetToken;

  final _emailCtrl = TextEditingController();
  final _codeCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();

  @override
  void dispose() {
    _emailCtrl.dispose();
    _codeCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleRequestReset() async {
    if (_emailCtrl.text.trim().isEmpty) {
      setState(() => _error = 'Email is required');
      return;
    }
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      await ref
          .read(authRepositoryProvider)
          .requestPasswordReset(email: _emailCtrl.text.trim());
      if (mounted) setState(() => _stage = _Stage.code);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleVerifyCode() async {
    if (_codeCtrl.text.trim().isEmpty) {
      setState(() => _error = 'Code is required');
      return;
    }
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final token = await ref.read(authRepositoryProvider).verifyResetCode(
            email: _emailCtrl.text.trim(),
            code: _codeCtrl.text.trim(),
          );
      if (mounted) setState(() {
        _resetToken = token;
        _stage = _Stage.password;
      });
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleConfirmReset() async {
    if (_passwordCtrl.text.isEmpty) {
      setState(() => _error = 'Password is required');
      return;
    }
    if (_passwordCtrl.text != _confirmCtrl.text) {
      setState(() => _error = 'Passwords do not match');
      return;
    }
    if (_passwordCtrl.text.length < 6) {
      setState(() => _error = 'Minimum 6 characters');
      return;
    }
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      await ref.read(authRepositoryProvider).confirmPasswordReset(
            resetToken: _resetToken!,
            newPassword: _passwordCtrl.text,
          );
      if (mounted) setState(() => _stage = _Stage.done);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: BackButton(
          onPressed: () => context.canPop() ? context.pop() : context.go('/auth/login'),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.s5),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Reset Password', style: AppTextStyles.heading2),
              const SizedBox(height: AppSpacing.s7),
              if (_stage == _Stage.email) _buildEmailStage(),
              if (_stage == _Stage.code) _buildCodeStage(),
              if (_stage == _Stage.password) _buildPasswordStage(),
              if (_stage == _Stage.done) _buildDoneStage(),
              if (_error != null) ...[
                const SizedBox(height: AppSpacing.s4),
                Container(
                  padding: const EdgeInsets.all(AppSpacing.s4),
                  decoration: BoxDecoration(
                    color: AppColors.error.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                  ),
                  child: Text(_error!,
                      style: AppTextStyles.bodySm
                          .copyWith(color: AppColors.error)),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmailStage() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Enter your email address and we\'ll send you a reset code.',
          style: AppTextStyles.muted,
        ),
        const SizedBox(height: AppSpacing.s6),
        AppInput(
          label: 'Email',
          hint: 'your@email.com',
          controller: _emailCtrl,
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.done,
          onSubmitted: (_) => _handleRequestReset(),
        ),
        const SizedBox(height: AppSpacing.s6),
        AppButton(
          label: 'Send Reset Code',
          isLoading: _isLoading,
          onPressed: _handleRequestReset,
        ),
      ],
    );
  }

  Widget _buildCodeStage() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Enter the 6-digit code sent to ${_emailCtrl.text}',
          style: AppTextStyles.muted,
        ),
        const SizedBox(height: AppSpacing.s6),
        AppInput(
          label: 'Reset Code',
          hint: '000000',
          controller: _codeCtrl,
          keyboardType: TextInputType.number,
          textInputAction: TextInputAction.done,
          onSubmitted: (_) => _handleVerifyCode(),
        ),
        const SizedBox(height: AppSpacing.s6),
        AppButton(
          label: 'Verify Code',
          isLoading: _isLoading,
          onPressed: _handleVerifyCode,
        ),
      ],
    );
  }

  Widget _buildPasswordStage() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Create a new password', style: AppTextStyles.muted),
        const SizedBox(height: AppSpacing.s6),
        AppInput(
          label: 'New Password',
          hint: '••••••••',
          controller: _passwordCtrl,
          obscureText: true,
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: AppSpacing.s5),
        AppInput(
          label: 'Confirm Password',
          hint: '••••••••',
          controller: _confirmCtrl,
          obscureText: true,
          textInputAction: TextInputAction.done,
          onSubmitted: (_) => _handleConfirmReset(),
        ),
        const SizedBox(height: AppSpacing.s6),
        AppButton(
          label: 'Reset Password',
          isLoading: _isLoading,
          onPressed: _handleConfirmReset,
        ),
      ],
    );
  }

  Widget _buildDoneStage() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(Icons.check_circle_outline,
            color: AppColors.success, size: 48),
        const SizedBox(height: AppSpacing.s5),
        Text('Password reset successfully!', style: AppTextStyles.heading4),
        const SizedBox(height: AppSpacing.s2),
        Text('You can now log in with your new password.',
            style: AppTextStyles.muted),
        const SizedBox(height: AppSpacing.s7),
        AppButton(
          label: 'Back to Login',
          onPressed: () => context.go('/auth/login'),
        ),
      ],
    );
  }
}
