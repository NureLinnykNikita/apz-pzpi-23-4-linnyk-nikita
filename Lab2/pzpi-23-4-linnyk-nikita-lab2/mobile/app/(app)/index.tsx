import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui/Card';
import { Avatar } from '../../src/components/ui/Avatar';
import { Badge } from '../../src/components/ui/Badge';
import { colors, fontSize, space, radius } from '../../src/theme';
import { useAuthStore } from '../../src/store/auth.store';
import { getMyStats } from '../../src/api/users';
import { getMyEnrollments } from '../../src/api/courses';

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['me/stats'],
    queryFn: getMyStats,
  });

  const { data: enrollments = [], isLoading: langsLoading } = useQuery({
    queryKey: ['enrollments'],
    queryFn: getMyEnrollments,
  });

  const languages = enrollments
    .map((e) => e.course?.language)
    .filter((l, i, arr) => l && arr.findIndex((x) => x?.id === l.id) === i);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.username}>{user?.username ?? '—'}</Text>
          </View>
          <View style={styles.headerRight}>
            {stats && (
              <View style={styles.xpBadge}>
                <Text style={styles.xpText}>⚡ {stats.totalPoints} XP</Text>
              </View>
            )}
            <Avatar username={user?.username ?? '?'} avatarUrl={user?.avatarUrl} size={38} />
          </View>
        </View>

        {statsLoading ? (
          <ActivityIndicator color={colors.accent} />
        ) : stats ? (
          <>
            <Card style={styles.statsCard}>
              <View style={styles.statsRow}>
                <StatPill label="XP" value={String(stats.totalPoints)} />
                <View style={styles.divider} />
                <StatPill
                  label="Level"
                  value={String(Math.floor(stats.totalPoints / 100) + 1)}
                />
                <View style={styles.divider} />
                <StatPill label="Streak" value={`${stats.streak}d`} accent />
              </View>
            </Card>

            <Card style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalLabel}>Today's goal</Text>
                <Text style={styles.goalValue}>
                  {stats.todayExercises} / {stats.dailyGoal} exercises
                </Text>
              </View>
              <View style={styles.goalTrack}>
                <View
                  style={[
                    styles.goalFill,
                    {
                      width: `${Math.min(
                        (stats.todayExercises / Math.max(stats.dailyGoal, 1)) * 100,
                        100
                      )}%`,
                    },
                  ]}
                />
              </View>
              {stats.todayExercises >= stats.dailyGoal && (
                <Text style={styles.goalDone}>Goal reached for today!</Text>
              )}
            </Card>
          </>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>MY LANGUAGES</Text>
        </View>

        {langsLoading ? (
          <ActivityIndicator color={colors.accent} />
        ) : languages.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>
              No languages yet. Enroll in a course to get started.
            </Text>
          </Card>
        ) : (
          <View style={styles.langGrid}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang!.id}
                style={styles.langCard}
                onPress={() => router.push('/(app)/practice')}
                activeOpacity={0.8}
              >
                <Text style={styles.langName}>{lang!.name}</Text>
                <Text style={styles.langCode}>{lang!.code.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.practicePrompt}
          onPress={() => router.push('/(app)/practice')}
          activeOpacity={0.8}
        >
          <Card style={styles.practiceCard}>
            <Text style={styles.practiceTitle}>Ready to practice?</Text>
            <Text style={styles.practiceDesc}>
              Flashcards, quizzes, and AI dialogue are waiting.
            </Text>
            <View style={styles.practiceBtn}>
              <Text style={styles.practiceBtnText}>Start practice →</Text>
            </View>
          </Card>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={statStyles.pill}>
      <Text style={[statStyles.value, accent && statStyles.accentValue]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  container: {
    paddingHorizontal: space[5],
    paddingTop: space[4],
    paddingBottom: space[10],
    gap: space[5],
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft: { gap: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  greeting: { fontSize: fontSize.base, color: colors.muted },
  username: { fontSize: fontSize['2xl'], fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  xpBadge: {
    backgroundColor: colors.panelSoft,
    borderRadius: radius.pill,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    borderWidth: 1,
    borderColor: colors.border,
  },
  xpText: { fontSize: fontSize.sm, color: colors.accent, fontWeight: '600' },
  statsCard: { padding: 0 },
  goalCard: { gap: space[2] },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  goalLabel: { fontSize: fontSize.sm, color: colors.muted, fontWeight: '600' },
  goalValue: { fontSize: fontSize.sm, fontWeight: '700', color: colors.accent },
  goalTrack: { height: 6, backgroundColor: colors.panelDeep, borderRadius: radius.xs },
  goalFill: { height: 6, backgroundColor: colors.accent, borderRadius: radius.xs },
  goalDone: { fontSize: fontSize.xs, color: colors.success, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: space[4],
  },
  divider: { width: 1, backgroundColor: colors.border },
  sectionHeader: { flexDirection: 'row', alignItems: 'center' },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.muted,
    letterSpacing: 0.18,
  },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3] },
  langCard: {
    paddingHorizontal: space[5],
    paddingVertical: space[4],
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: space[1],
    minWidth: 100,
  },
  langName: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  langCode: { fontSize: fontSize.xs, color: colors.muted, fontWeight: '600' },
  practicePrompt: {},
  practiceCard: { gap: space[2] },
  practiceTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  practiceDesc: { fontSize: fontSize.base, color: colors.muted },
  practiceBtn: {
    alignSelf: 'flex-start',
    marginTop: space[2],
    backgroundColor: colors.accent,
    paddingHorizontal: space[4],
    paddingVertical: space[2] + 2,
    borderRadius: radius.lg,
  },
  practiceBtnText: { color: colors.accentInk, fontWeight: '700', fontSize: fontSize.base },
  emptyText: { color: colors.muted, fontSize: fontSize.base },
});

const statStyles = StyleSheet.create({
  pill: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: space[2] },
  value: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  accentValue: { color: colors.secondary },
  label: { fontSize: fontSize.xs, color: colors.muted, fontWeight: '600' },
});
