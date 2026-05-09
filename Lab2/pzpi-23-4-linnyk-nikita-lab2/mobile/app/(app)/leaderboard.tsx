import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, space, radius } from '../../src/theme';
import { getLeaderboard } from '../../src/api/leaderboard';
import { Avatar } from '../../src/components/ui/Avatar';
import { Badge } from '../../src/components/ui/Badge';
import { LeaderboardEntry } from '../../src/types/api';

type Period = 'week' | 'month' | 'all';
const PERIODS: { key: Period; label: string }[] = [
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'Month' },
  { key: 'all', label: 'All time' },
];

export default function LeaderboardScreen() {
  const [period, setPeriod] = useState<Period>('week');

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () => getLeaderboard({ period }),
  });

  const entries = data?.entries ?? [];
  const top3 = entries.slice(0, 3);
  const showPodium = top3.length >= 3;
  const listEntries = showPodium ? entries.slice(3) : entries;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Leaderboard</Text>

        <View style={styles.filters}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.filterChip, period === p.key && styles.filterChipActive]}
              onPress={() => setPeriod(p.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  period === p.key && styles.filterTextActive,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (
          <>
            {showPodium && <Podium entries={top3} />}

            <FlatList
              data={listEntries}
              keyExtractor={(item) => item.userId}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => <RankRow entry={item} />}
              ListHeaderComponent={
                data?.currentUserRow && !entries.some((e) => e.isCurrentUser) ? (
                  <View style={styles.youSection}>
                    <Text style={styles.youLabel}>YOUR RANK</Text>
                    <RankRow entry={data.currentUserRow} />
                    <View style={styles.separator} />
                  </View>
                ) : null
              }
              ListEmptyComponent={
                entries.length === 0 ? (
                  <Text style={styles.emptyText}>No data for this period yet.</Text>
                ) : null
              }
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const [second, first, third] = [entries[1], entries[0], entries[2]];
  return (
    <View style={podiumStyles.row}>
      <PodiumItem entry={second} rank={2} height={80} />
      <PodiumItem entry={first} rank={1} height={100} />
      <PodiumItem entry={third} rank={3} height={65} />
    </View>
  );
}

function PodiumItem({
  entry,
  rank,
  height,
}: {
  entry: LeaderboardEntry;
  rank: number;
  height: number;
}) {
  const medals = ['', '🥇', '🥈', '🥉'];
  return (
    <View style={podiumStyles.item}>
      <Text style={podiumStyles.medal}>{medals[rank]}</Text>
      <Avatar username={entry.username} avatarUrl={entry.avatarUrl} size={40} />
      <Text style={podiumStyles.name} numberOfLines={1}>
        {entry.username}
      </Text>
      <Text style={podiumStyles.points}>{entry.totalPoints}</Text>
      {entry.isCurrentUser && <Badge label="YOU" variant="secondary" />}
      <View style={[podiumStyles.bar, { height }]} />
    </View>
  );
}

function RankRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <View style={[rowStyles.row, entry.isCurrentUser && rowStyles.rowHighlight]}>
      <Text style={rowStyles.rank}>
        {entry.rank <= 3 ? ['', '🥇', '🥈', '🥉'][entry.rank] : String(entry.rank)}
      </Text>
      <Avatar username={entry.username} avatarUrl={entry.avatarUrl} size={36} />
      <View style={rowStyles.info}>
        <View style={rowStyles.nameRow}>
          <Text style={rowStyles.username} numberOfLines={1}>
            {entry.username}
          </Text>
          {entry.isCurrentUser && <Badge label="YOU" variant="secondary" />}
        </View>
        {entry.streak > 0 && (
          <Text style={rowStyles.streak}>🔥 {entry.streak}d streak</Text>
        )}
      </View>
      <Text style={rowStyles.points}>{entry.totalPoints}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1 },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: space[5],
    paddingTop: space[4],
    letterSpacing: -0.5,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: space[5],
    paddingVertical: space[3],
    gap: space[2],
  },
  filterChip: {
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
  },
  filterChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterText: { fontSize: fontSize.sm, color: colors.muted, fontWeight: '600' },
  filterTextActive: { color: colors.accentInk },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: space[5], gap: space[2], paddingBottom: space[8] },
  emptyText: { color: colors.muted, fontSize: fontSize.base, textAlign: 'center', marginTop: space[8] },
  youSection: { marginBottom: space[3], gap: space[2] },
  youLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.muted,
    letterSpacing: 0.18,
  },
  separator: { height: 1, backgroundColor: colors.border, marginTop: space[2] },
});

const podiumStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: space[5],
    paddingVertical: space[4],
    gap: space[3],
  },
  item: { flex: 1, alignItems: 'center', gap: space[1] },
  medal: { fontSize: 20 },
  name: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  points: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.accent,
    fontVariant: ['tabular-nums'],
  },
  bar: {
    width: '100%',
    backgroundColor: colors.panel,
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowHighlight: { borderColor: colors.secondary, backgroundColor: colors.panelSoft },
  rank: { width: 24, fontSize: fontSize.base, fontWeight: '700', color: colors.muted, textAlign: 'center' },
  info: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  username: { fontSize: fontSize.base, fontWeight: '600', color: colors.text, flex: 1 },
  streak: { fontSize: fontSize.xs, color: colors.secondary },
  points: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.accent,
    fontVariant: ['tabular-nums'],
  },
});
