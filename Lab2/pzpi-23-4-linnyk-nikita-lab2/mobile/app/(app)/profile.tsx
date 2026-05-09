import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, space, radius } from '../../src/theme';
import { useAuthStore } from '../../src/store/auth.store';
import { getMyStats, getUserAchievements, getMyProfile, updateMyProfile } from '../../src/api/users';
import { getMyEnrollments } from '../../src/api/courses';
import { Card } from '../../src/components/ui/Card';
import { Avatar } from '../../src/components/ui/Avatar';
import { Badge } from '../../src/components/ui/Badge';
import { Achievement } from '../../src/types/api';

export default function ProfileScreen() {
  const storeUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['me/profile'],
    queryFn: getMyProfile,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['me/stats'],
    queryFn: getMyStats,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', storeUser?.userId],
    queryFn: () => getUserAchievements(storeUser!.userId),
    enabled: !!storeUser?.userId,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments'],
    queryFn: getMyEnrollments,
  });

  const languages = enrollments
    .map((e) => e.course?.language)
    .filter((l, i, arr) => l && arr.findIndex((x) => x?.id === l.id) === i);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const updateMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me/profile'] });
      setEditing(false);
    },
    onError: (err: any) => {
      Alert.alert('Update failed', err?.response?.data?.message ?? 'Please try again.');
    },
  });

  const handleStartEdit = () => {
    setUsername(profile?.username ?? '');
    setEmail(profile?.email ?? '');
    setEditing(true);
  };

  const handleSave = () => {
    const changes: Record<string, string> = {};
    if (username.trim() && username !== profile?.username) changes.username = username.trim();
    if (email.trim() && email !== profile?.email) changes.email = email.trim();
    if (Object.keys(changes).length === 0) { setEditing(false); return; }
    updateMutation.mutate(changes as any);
  };

  const user = profile ?? storeUser;

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar username={user.username} avatarUrl={user.avatarUrl} size={56} />
            <View style={styles.profileInfo}>
              {editing ? (
                <>
                  <TextInput
                    style={styles.editInput}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Username"
                    placeholderTextColor={colors.muted}
                    autoCapitalize="none"
                  />
                  <TextInput
                    style={styles.editInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    placeholderTextColor={colors.muted}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </>
              ) : (
                <>
                  <Text style={styles.profileName}>{user.username}</Text>
                  <Text style={styles.profileEmail}>{(user as any).email ?? ''}</Text>
                  <Text style={styles.profileSince}>
                    Member since{' '}
                    {user.createdAt
                      ? new Date(user.createdAt).getFullYear()
                      : '—'}
                  </Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.editRow}>
            {editing ? (
              <>
                <TouchableOpacity
                  style={[styles.editBtn, styles.editBtnSave]}
                  onPress={handleSave}
                  disabled={updateMutation.isPending}
                >
                  <Text style={styles.editBtnSaveText}>
                    {updateMutation.isPending ? 'Saving…' : 'Save'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => setEditing(false)}
                >
                  <Text style={styles.editBtnText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.editBtn} onPress={handleStartEdit}>
                <Text style={styles.editBtnText}>Edit profile</Text>
              </TouchableOpacity>
            )}
          </View>

          {statsLoading ? (
            <ActivityIndicator color={colors.accent} style={{ marginTop: space[4] }} />
          ) : stats ? (
            <View style={styles.statsRow}>
              <StatItem label="XP" value={String(stats.totalPoints)} color={colors.accent} />
              <View style={styles.statDivider} />
              <StatItem
                label="Level"
                value={String(Math.floor(stats.totalPoints / 100) + 1)}
                color={colors.text}
              />
              <View style={styles.statDivider} />
              <StatItem label="Streak" value={`${stats.streak}d`} color={colors.secondary} />
              <View style={styles.statDivider} />
              <StatItem label="Courses" value={String(stats.coursesEnrolled)} color={colors.text} />
            </View>
          ) : null}
        </Card>

        {languages.length > 0 && (
          <>
            <SectionLabel>LANGUAGES</SectionLabel>
            <Card>
              <View style={styles.langList}>
                {languages.map((lang, i) => (
                  <View key={lang!.id} style={styles.langRow}>
                    <Text style={styles.langName}>{lang!.name}</Text>
                    <Text style={styles.langCode}>{lang!.code.toUpperCase()}</Text>
                    {i === 0 && <Badge label="NOW" variant="secondary" />}
                  </View>
                ))}
              </View>
            </Card>
          </>
        )}

        {stats && (
          <>
            <SectionLabel>SKILL BREAKDOWN</SectionLabel>
            <Card>
              <View style={styles.skillList}>
                <SkillBar label="Exercises done" value={stats.exercisesCompleted} max={100} />
                <SkillBar
                  label="Correct rate"
                  value={Math.round(stats.correctAnswersRate * 100)}
                  max={100}
                  accent={colors.success}
                />
                <SkillBar
                  label="Achievements"
                  value={stats.achievementsCount}
                  max={20}
                  accent={colors.secondary}
                />
              </View>
            </Card>
          </>
        )}

        {achievements.length > 0 && (
          <>
            <SectionLabel>{`ACHIEVEMENTS (${achievements.length})`}</SectionLabel>
            <View style={styles.achievementsGrid}>
              {achievements.map((a) => (
                <AchievementBadge key={a.achievementId} achievement={a} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={statStyles.item}>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

function SkillBar({
  label,
  value,
  max,
  accent = colors.accent,
}: {
  label: string;
  value: number;
  max: number;
  accent?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <View style={skillStyles.row}>
      <Text style={skillStyles.label}>{label}</Text>
      <View style={skillStyles.track}>
        <View style={[skillStyles.fill, { width: `${pct}%`, backgroundColor: accent }]} />
      </View>
      <Text style={skillStyles.value}>{value}</Text>
    </View>
  );
}

function AchievementBadge({ achievement }: { achievement: Achievement }) {
  return (
    <View style={achStyles.badge}>
      <View style={achStyles.checkCircle}>
        <Text style={achStyles.checkMark}>✓</Text>
      </View>
      <Text style={achStyles.title} numberOfLines={2}>{achievement.title}</Text>
      <Text style={achStyles.desc} numberOfLines={3}>{achievement.description}</Text>
      {achievement.earnedAt && (
        <Text style={achStyles.date}>
          {new Date(achievement.earnedAt).toLocaleDateString()}
        </Text>
      )}
    </View>
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
  profileCard: { gap: space[4] },
  profileHeader: { flexDirection: 'row', gap: space[4], alignItems: 'flex-start' },
  profileInfo: { flex: 1, gap: space[1] },
  profileName: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  profileEmail: { fontSize: fontSize.sm, color: colors.muted },
  profileSince: { fontSize: fontSize.sm, color: colors.muted },
  editInput: {
    fontSize: fontSize.base,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    backgroundColor: colors.panelDeep,
  },
  editRow: { flexDirection: 'row', gap: space[3] },
  editBtn: {
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panelSoft,
  },
  editBtnSave: { backgroundColor: colors.accent, borderColor: colors.accent },
  editBtnText: { fontSize: fontSize.sm, color: colors.muted, fontWeight: '600' },
  editBtnSaveText: { fontSize: fontSize.sm, color: colors.accentInk, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: space[4],
  },
  statDivider: { width: 1, backgroundColor: colors.border, marginHorizontal: space[2] },
  langList: { gap: space[3] },
  langRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  langName: { flex: 1, fontSize: fontSize.base, fontWeight: '600', color: colors.text },
  langCode: { fontSize: fontSize.xs, color: colors.muted, fontWeight: '600' },
  achievementsGrid: { gap: space[3] },
  skillList: { gap: space[4] },
});

const statStyles = StyleSheet.create({
  item: { flex: 1, alignItems: 'center', gap: 2 },
  value: { fontSize: fontSize.lg, fontWeight: '700' },
  label: { fontSize: fontSize.xs, color: colors.muted, fontWeight: '600' },
});

const skillStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  label: { width: 110, fontSize: fontSize.sm, color: colors.muted },
  track: { flex: 1, height: 6, backgroundColor: colors.panelDeep, borderRadius: radius.xs },
  fill: { height: 6, borderRadius: radius.xs },
  value: { width: 30, fontSize: fontSize.sm, color: colors.muted, textAlign: 'right' },
});

const achStyles = StyleSheet.create({
  badge: {
    backgroundColor: colors.panel,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(168,196,162,0.3)',
    padding: space[4],
    gap: space[2],
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(168,196,162,0.15)',
    borderWidth: 1,
    borderColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { fontSize: 13, color: colors.success, fontWeight: '700' },
  title: { fontSize: fontSize.base, fontWeight: '700', color: colors.text },
  desc: { fontSize: fontSize.sm, color: colors.muted, lineHeight: 18 },
  date: { fontSize: fontSize.xs, color: colors.success, fontWeight: '600', marginTop: 2 },
});

const sectionStyles = StyleSheet.create({
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.muted,
    letterSpacing: 0.18,
  },
});
