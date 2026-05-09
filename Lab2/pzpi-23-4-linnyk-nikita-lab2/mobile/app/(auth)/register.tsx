import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { colors, fontSize, space, radius } from '../../src/theme';
import { registerUser, loginWithEmail } from '../../src/api/auth';
import { completeOnboarding } from '../../src/api/users';
import { getAllLanguages } from '../../src/api/courses';
import { useAuthStore } from '../../src/store/auth.store';

const accountSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
});
type AccountData = z.infer<typeof accountSchema>;

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const GOAL_OPTIONS = [5, 10, 15, 20, 25, 30];

export default function RegisterScreen() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedLanguageId, setSelectedLanguageId] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('A1');
  const [dailyGoal, setDailyGoal] = useState(10);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<AccountData>({ resolver: zodResolver(accountSchema) });

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: getAllLanguages,
    enabled: step === 2,
  });

  const handleNextStep1 = handleSubmit(() => setStep(2));

  const handleNextStep2 = () => {
    if (!selectedLanguageId) return;
    setStep(3);
  };

  const handleFinish = async () => {
    try {
      const { username, email, password } = getValues();
      await registerUser(username, email, password);
      const loginResult = await loginWithEmail(email, password);
      await setAuth(loginResult.token, loginResult.refreshToken, loginResult.user);
      if (selectedLanguageId) {
        await completeOnboarding(selectedLanguageId, dailyGoal);
      }
      router.replace('/(app)');
    } catch (err: any) {
      console.error(err?.response?.data ?? err);
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
        <StepIndicator current={step} />

        {step === 1 && (
          <Step1
            control={control}
            errors={errors}
            onNext={handleNextStep1}
          />
        )}
        {step === 2 && (
          <Step2
            languages={languages}
            selectedId={selectedLanguageId}
            onSelectLanguage={setSelectedLanguageId}
            selectedLevel={selectedLevel}
            onSelectLevel={setSelectedLevel}
            onBack={() => setStep(1)}
            onNext={handleNextStep2}
          />
        )}
        {step === 3 && (
          <Step3
            goal={dailyGoal}
            goalOptions={GOAL_OPTIONS}
            onSelectGoal={setDailyGoal}
            onBack={() => setStep(2)}
            onFinish={handleFinish}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <View style={stepStyles.row}>
      {[1, 2, 3].map((n) => (
        <View
          key={n}
          style={[
            stepStyles.dot,
            n === current
              ? stepStyles.active
              : n < current
              ? stepStyles.done
              : stepStyles.inactive,
          ]}
        >
          <Text style={stepStyles.num}>{n < current ? '✓' : n}</Text>
        </View>
      ))}
    </View>
  );
}

function Step1({ control, errors, onNext }: any) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Create your account</Text>
      <View style={styles.form}>
        <Controller
          control={control}
          name="username"
          render={({ field }) => (
            <Input
              label="Username"
              placeholder="langlearner42"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.username?.message}
            />
          )}
        />
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
              placeholder="min 8 characters"
              secureTextEntry
              value={field.value}
              onChangeText={field.onChange}
              error={errors.password?.message}
            />
          )}
        />
        <Button label="Continue" onPress={onNext} style={{ marginTop: space[2] }} />
      </View>
    </View>
  );
}

function Step2({
  languages,
  selectedId,
  onSelectLanguage,
  selectedLevel,
  onSelectLevel,
  onBack,
  onNext,
}: any) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What do you want to learn?</Text>
      <View style={styles.langGrid}>
        {languages.map((lang: any) => (
          <TouchableOpacity
            key={lang.id}
            style={[styles.langCard, selectedId === lang.id && styles.langCardSelected]}
            onPress={() => onSelectLanguage(lang.id)}
          >
            <Text style={styles.langName}>{lang.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>LEVEL</Text>
      <View style={styles.levelRow}>
        {LEVELS.map((lvl) => (
          <TouchableOpacity
            key={lvl}
            style={[styles.levelChip, selectedLevel === lvl && styles.levelChipSelected]}
            onPress={() => onSelectLevel(lvl)}
          >
            <Text
              style={[
                styles.levelText,
                selectedLevel === lvl && styles.levelTextSelected,
              ]}
            >
              {lvl}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.navRow}>
        <Button label="Back" onPress={onBack} variant="ghost" style={{ flex: 1 }} />
        <Button
          label="Continue"
          onPress={onNext}
          disabled={!selectedId}
          style={{ flex: 2 }}
        />
      </View>
    </View>
  );
}

function Step3({ goal, goalOptions, onSelectGoal, onBack, onFinish }: any) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Set your daily goal</Text>
      <Text style={styles.goalDisplay}>{goal}</Text>
      <Text style={styles.goalDesc}>
        {goal <= 5
          ? 'Casual — just getting started'
          : goal <= 15
          ? 'Regular — building a habit'
          : 'Serious — fast progress'}
        {'\n'}exercises per day
      </Text>

      <View style={styles.goalGrid}>
        {goalOptions.map((opt: number) => (
          <TouchableOpacity
            key={opt}
            style={[styles.goalChip, goal === opt && styles.goalChipSelected]}
            onPress={() => onSelectGoal(opt)}
          >
            <Text
              style={[styles.goalChipText, goal === opt && styles.goalChipTextSelected]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.navRow}>
        <Button label="Back" onPress={onBack} variant="ghost" style={{ flex: 1 }} />
        <Button label="Get started" onPress={onFinish} style={{ flex: 2 }} />
      </View>
    </View>
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
  stepContainer: { gap: space[5] },
  stepTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.4,
  },
  form: { gap: space[4] },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[3],
  },
  langCard: {
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
  },
  langCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.panelSoft,
  },
  langName: { color: colors.text, fontSize: fontSize.base, fontWeight: '500' },
  sectionLabel: {
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: '600',
    letterSpacing: 0.18,
  },
  levelRow: { flexDirection: 'row', gap: space[2] },
  levelChip: {
    flex: 1,
    paddingVertical: space[2],
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
  },
  levelChipSelected: { borderColor: colors.accent, backgroundColor: colors.panelSoft },
  levelText: { color: colors.muted, fontSize: fontSize.sm, fontWeight: '600' },
  levelTextSelected: { color: colors.accent },
  goalDisplay: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.accent,
    textAlign: 'center',
    letterSpacing: -2,
  },
  goalDesc: { fontSize: fontSize.base, color: colors.muted, textAlign: 'center' },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
    justifyContent: 'center',
  },
  goalChip: {
    paddingHorizontal: space[5],
    paddingVertical: space[2] + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
  },
  goalChipSelected: { borderColor: colors.accent, backgroundColor: colors.panelSoft },
  goalChipText: { color: colors.muted, fontSize: fontSize.sm, fontWeight: '600' },
  goalChipTextSelected: { color: colors.accent },
  navRow: { flexDirection: 'row', gap: space[3], marginTop: space[2] },
});

const stepStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: space[3] },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  active: { backgroundColor: colors.accent, borderColor: colors.accent },
  done: { backgroundColor: colors.panelSoft, borderColor: colors.accent },
  inactive: { backgroundColor: colors.panel, borderColor: colors.border },
  num: { fontSize: fontSize.xs, fontWeight: '700', color: colors.accentInk },
});
