import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { colors, fontSize, space } from '../../src/theme';
import {
  requestPasswordReset,
  verifyResetCode,
  confirmPasswordReset,
} from '../../src/api/auth';

type Stage = 'email' | 'code' | 'password';

export default function ResetPasswordScreen() {
  const [stage, setStage] = useState<Stage>('email');
  const [email, setEmailState] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailForm = useForm<{ email: string }>({
    resolver: zodResolver(z.object({ email: z.string().email() })),
  });

  const codeForm = useForm<{ code: string }>({
    resolver: zodResolver(
      z.object({ code: z.string().length(6).regex(/^\d+$/, 'Must be 6 digits') })
    ),
  });

  const passwordForm = useForm<{ newPassword: string; confirm: string }>({
    resolver: zodResolver(
      z
        .object({
          newPassword: z.string().min(8),
          confirm: z.string(),
        })
        .refine((d) => d.newPassword === d.confirm, {
          message: "Passwords don't match",
          path: ['confirm'],
        })
    ),
  });

  const handleRequestReset = emailForm.handleSubmit(async (data) => {
    try {
      setError('');
      setLoading(true);
      await requestPasswordReset(data.email);
      setEmailState(data.email);
      setStage('code');
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  });

  const handleVerifyCode = codeForm.handleSubmit(async (data) => {
    try {
      setError('');
      setLoading(true);
      const result = await verifyResetCode(email, data.code);
      setResetToken(result.resetToken);
      setStage('password');
    } catch {
      setError('Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  });

  const handleConfirmReset = passwordForm.handleSubmit(async (data) => {
    try {
      setError('');
      setLoading(true);
      await confirmPasswordReset(resetToken, data.newPassword);
      router.replace('/(auth)/login');
    } catch {
      setError('Failed to reset password. Please start over.');
    } finally {
      setLoading(false);
    }
  });

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {stage === 'email' && (
          <View style={styles.section}>
            <Text style={styles.title}>Reset password</Text>
            <Text style={styles.subtitle}>
              Enter your email and we&apos;ll send you a 6-digit code.
            </Text>
            <Controller
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={emailForm.formState.errors.email?.message}
                />
              )}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button
              label="Send reset code"
              onPress={handleRequestReset}
              loading={loading}
            />
          </View>
        )}

        {stage === 'code' && (
          <View style={styles.section}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
            <Text style={styles.title}>Check your inbox</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to {email}. Enter it below.
            </Text>
            <Controller
              control={codeForm.control}
              name="code"
              render={({ field }) => (
                <Input
                  label="Code"
                  placeholder="123456"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={field.value}
                  onChangeText={field.onChange}
                  error={codeForm.formState.errors.code?.message}
                />
              )}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button label="Verify code" onPress={handleVerifyCode} loading={loading} />
            <Button
              label="Resend code"
              onPress={handleRequestReset}
              variant="ghost"
              loading={loading}
            />
          </View>
        )}

        {stage === 'password' && (
          <View style={styles.section}>
            <Text style={styles.title}>New password</Text>
            <Controller
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <Input
                  label="New password"
                  placeholder="min 8 characters"
                  secureTextEntry
                  value={field.value}
                  onChangeText={field.onChange}
                  error={passwordForm.formState.errors.newPassword?.message}
                />
              )}
            />
            <Controller
              control={passwordForm.control}
              name="confirm"
              render={({ field }) => (
                <Input
                  label="Confirm password"
                  placeholder="repeat password"
                  secureTextEntry
                  value={field.value}
                  onChangeText={field.onChange}
                  error={passwordForm.formState.errors.confirm?.message}
                />
              )}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button
              label="Set new password"
              onPress={handleConfirmReset}
              loading={loading}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: {
    flexGrow: 1,
    paddingHorizontal: space[6],
    paddingVertical: space[8],
    gap: space[6],
  },
  back: { alignSelf: 'flex-start' },
  backText: { color: colors.accent, fontSize: fontSize.base },
  section: { gap: space[4] },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.4,
  },
  subtitle: { fontSize: fontSize.base, color: colors.muted, lineHeight: 22 },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: space[2],
  },
  checkIcon: { fontSize: 28, color: colors.accent },
  error: { fontSize: fontSize.sm, color: colors.error },
});
