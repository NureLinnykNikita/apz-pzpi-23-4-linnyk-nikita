import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, space, radius } from '../../src/theme';
import { useAuthStore } from '../../src/store/auth.store';
import { getSettings, updateSettings } from '../../src/api/users';
import { logoutUser } from '../../src/api/auth';
import { storage } from '../../src/utils/storage';
import { Card } from '../../src/components/ui/Card';

const GOAL_OPTIONS = [5, 10, 15, 20, 25, 30];

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  const [dailyGoal, setDailyGoal] = useState(settings?.dailyGoalMinutes ?? 10);
  const [notificationsOn, setNotificationsOn] = useState(
    settings?.notificationsEnabled ?? true
  );

  useEffect(() => {
    if (settings) {
      setDailyGoal(settings.dailyGoalMinutes);
      setNotificationsOn(settings.notificationsEnabled);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  const handleGoalChange = (goal: number) => {
    setDailyGoal(goal);
    updateMutation.mutate({ dailyGoalMinutes: goal });
  };

  const handleToggleNotifications = (value: boolean) => {
    setNotificationsOn(value);
    updateMutation.mutate({ notificationsEnabled: value });
  };

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          try {
            const refreshToken = await storage.get('refreshToken');
            if (refreshToken) await logoutUser(refreshToken);
          } catch {}
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <SectionLabel>ACCOUNT</SectionLabel>
        <Card>
          <View style={styles.accountRow}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{user?.username}</Text>
              <Text style={styles.accountEmail}>{user?.email}</Text>
            </View>
          </View>
        </Card>

        <SectionLabel>DAILY GOAL</SectionLabel>
        <Card>
          <Text style={styles.goalDisplay}>{dailyGoal} exercises / day</Text>
          <View style={styles.goalGrid}>
            {GOAL_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.goalChip, dailyGoal === opt && styles.goalChipActive]}
                onPress={() => handleGoalChange(opt)}
              >
                <Text
                  style={[
                    styles.goalChipText,
                    dailyGoal === opt && styles.goalChipTextActive,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <SectionLabel>NOTIFICATIONS</SectionLabel>
        <Card>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Daily reminders</Text>
            <Switch
              value={notificationsOn}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.panelDeep, true: colors.accent }}
              thumbColor={colors.bg}
            />
          </View>
        </Card>

        <SectionLabel>ACCOUNT & SECURITY</SectionLabel>
        <Card>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(auth)/reset-password')}
          >
            <Text style={styles.menuItemText}>Change password</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </Card>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <Text style={sectionStyles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: {
    paddingHorizontal: space[5],
    paddingTop: space[4],
    paddingBottom: space[10],
    gap: space[4],
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: space[2],
  },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  accountInfo: { gap: 2 },
  accountName: { fontSize: fontSize.base, fontWeight: '700', color: colors.text },
  accountEmail: { fontSize: fontSize.sm, color: colors.muted },
  goalDisplay: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.accent,
    textAlign: 'center',
    marginBottom: space[4],
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
    justifyContent: 'center',
  },
  goalChip: {
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panelSoft,
  },
  goalChipActive: { borderColor: colors.accent, backgroundColor: colors.panelSoft },
  goalChipText: { color: colors.muted, fontSize: fontSize.sm, fontWeight: '600' },
  goalChipTextActive: { color: colors.accent },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: { fontSize: fontSize.base, color: colors.text, fontWeight: '500' },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: space[2],
  },
  menuItemText: { fontSize: fontSize.base, color: colors.text },
  menuArrow: { fontSize: fontSize.base, color: colors.muted },
  logoutBtn: {
    paddingVertical: 13,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
    marginTop: space[4],
  },
  logoutText: { color: colors.error, fontWeight: '700', fontSize: fontSize.base },
});

const sectionStyles = StyleSheet.create({
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.muted,
    letterSpacing: 0.18,
  },
});
