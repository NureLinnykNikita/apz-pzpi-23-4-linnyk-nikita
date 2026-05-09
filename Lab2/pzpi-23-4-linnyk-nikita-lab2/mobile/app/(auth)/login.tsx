import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { colors, fontSize, space, radius } from '../../src/theme';
import { loginWithEmail } from '../../src/api/auth';
import { useAuthStore } from '../../src/store/auth.store';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await loginWithEmail(data.email, data.password);
      await setAuth(result.token, result.refreshToken, result.user);
      router.replace('/(app)');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Invalid email or password';
      setError('email', { message: msg });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logo}>
          <Text style={styles.logoLang}>Lang</Text>
          <Text style={styles.logoBang}>Bang</Text>
        </View>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue learning</Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Input
                label="Email"
                placeholder="you@example.com"
                keyboardType="email-address"
                value={field.value}
                onChangeText={field.onChange}
                error={errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Input
                label="Password"
                placeholder="••••••••"
                secureTextEntry
                value={field.value}
                onChangeText={field.onChange}
                error={errors.password?.message}
              />
            )}
          />

          <Link href="/(auth)/reset-password" asChild>
            <TouchableOpacity>
              <Text style={styles.forgotLink}>Forgot password?</Text>
            </TouchableOpacity>
          </Link>

          <Button
            label="Sign in"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>No account? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Register</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: space[6],
    paddingVertical: space[10],
    gap: space[5],
  },
  logo: { flexDirection: 'row', justifyContent: 'center', marginBottom: space[4] },
  logoLang: { fontSize: fontSize['2xl'] + 4, fontWeight: '800', color: colors.text },
  logoBang: { fontSize: fontSize['2xl'] + 4, fontWeight: '800', color: colors.accent },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.muted,
    textAlign: 'center',
    marginTop: -space[3],
  },
  form: { gap: space[4] },
  forgotLink: {
    color: colors.accent,
    fontSize: fontSize.sm,
    alignSelf: 'flex-end',
    marginTop: -space[2],
  },
  submitBtn: { marginTop: space[2] },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: space[2],
  },
  footerText: { color: colors.muted, fontSize: fontSize.base },
  footerLink: { color: colors.accent, fontSize: fontSize.base, fontWeight: '600' },
});
