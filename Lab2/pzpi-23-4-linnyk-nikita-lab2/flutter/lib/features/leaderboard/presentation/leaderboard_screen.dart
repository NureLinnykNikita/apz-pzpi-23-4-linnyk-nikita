import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/models/leaderboard.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/app_avatar.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../data/leaderboard_repository.dart';

class LeaderboardScreen extends ConsumerStatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  ConsumerState<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends ConsumerState<LeaderboardScreen> {
  String _period = 'week';

  @override
  Widget build(BuildContext context) {
    final dataAsync = ref.watch(leaderboardProvider(_period));

    return Scaffold(
      body: RefreshIndicator(
        color: AppColors.accent,
        backgroundColor: AppColors.panel,
        onRefresh: () async => ref.invalidate(leaderboardProvider(_period)),
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(
                    AppSpacing.s5, AppSpacing.s7, AppSpacing.s5, AppSpacing.s5),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Leaderboard', style: AppTextStyles.heading2),
                    const SizedBox(height: AppSpacing.s5),
                    _PeriodFilter(
                      current: _period,
                      onChanged: (p) => setState(() => _period = p),
                    ),
                  ],
                ),
              ),
            ),
            dataAsync.when(
              data: (data) => _buildContent(data),
              loading: () => const SliverToBoxAdapter(
                child: Center(
                  child: Padding(
                    padding: EdgeInsets.only(top: 48),
                    child: LoadingIndicator(),
                  ),
                ),
              ),
              error: (e, _) => SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.s5),
                  child: Text(e.toString(),
                      style: AppTextStyles.bodySm
                          .copyWith(color: AppColors.error)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(LeaderboardResponse data) {
    final top3 = data.entries.take(3).toList();
    final rest = data.entries.skip(3).toList();

    return SliverList(
      delegate: SliverChildListDelegate([
        if (top3.isNotEmpty) ...[
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s5),
            child: _Podium(entries: top3),
          ),
          const SizedBox(height: AppSpacing.s5),
        ],
        ...rest.map((e) => Padding(
              padding: const EdgeInsets.fromLTRB(
                  AppSpacing.s5, 0, AppSpacing.s5, AppSpacing.s3),
              child: _RankRow(entry: e),
            )),
        if (data.currentUserRow != null &&
            !data.entries.any((e) => e.isCurrentUser)) ...[
          const Padding(
            padding: EdgeInsets.symmetric(
                horizontal: AppSpacing.s5, vertical: AppSpacing.s3),
            child: Divider(color: AppColors.border),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s5),
            child: _RankRow(
              entry: data.currentUserRow!,
              highlight: true,
            ),
          ),
        ],
        const SizedBox(height: AppSpacing.s8),
      ]),
    );
  }
}

class _PeriodFilter extends StatelessWidget {
  final String current;
  final void Function(String) onChanged;

  const _PeriodFilter({required this.current, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    final periods = [
      ('week', 'This Week'),
      ('month', 'This Month'),
      ('all', 'All Time'),
    ];

    return Row(
      children: periods.map((p) {
        final active = p.$1 == current;
        return Padding(
          padding: const EdgeInsets.only(right: AppSpacing.s3),
          child: GestureDetector(
            onTap: () => onChanged(p.$1),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.s4, vertical: AppSpacing.s2),
              decoration: BoxDecoration(
                color: active ? AppColors.accent : AppColors.panelSoft,
                borderRadius:
                    BorderRadius.circular(AppSpacing.radiusPill),
                border: Border.all(
                    color: active ? AppColors.accent : AppColors.border),
              ),
              child: Text(
                p.$2,
                style: AppTextStyles.labelSm.copyWith(
                  color: active ? AppColors.accentInk : AppColors.text,
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _Podium extends StatelessWidget {
  final List<LeaderboardEntry> entries;
  const _Podium({required this.entries});

  @override
  Widget build(BuildContext context) {
    // Podium order: 2nd (left), 1st (center, taller), 3rd (right)
    final order = [
      if (entries.length > 1) entries[1],
      entries[0],
      if (entries.length > 2) entries[2],
    ];
    final heights = [100.0, 130.0, 80.0];

    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: order.asMap().entries.map((e) {
        final i = e.key;
        final entry = e.value;
        final h = heights[i];
        final isMid = i == 1;

        return Expanded(
          child: Padding(
            padding:
                EdgeInsets.symmetric(horizontal: isMid ? 0 : AppSpacing.s2),
            child: Column(
              children: [
                AppAvatar(
                    imageUrl: entry.avatarUrl,
                    name: entry.username,
                    size: isMid ? 56 : 44),
                const SizedBox(height: 6),
                Text(
                  entry.username,
                  style: isMid
                      ? AppTextStyles.labelMd
                      : AppTextStyles.labelSm,
                  textAlign: TextAlign.center,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text('${entry.totalPoints} XP',
                    style: AppTextStyles.mutedSm),
                const SizedBox(height: 6),
                Container(
                  height: h,
                  decoration: BoxDecoration(
                    color: isMid
                        ? AppColors.accent.withOpacity(0.25)
                        : AppColors.panelSoft,
                    borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(AppSpacing.radiusSm)),
                    border: isMid
                        ? Border.all(
                            color: AppColors.accent, width: 1.5)
                        : null,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    '#${entry.rank}',
                    style: isMid
                        ? AppTextStyles.heading4
                            .copyWith(color: AppColors.accent)
                        : AppTextStyles.labelMd,
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _RankRow extends StatelessWidget {
  final LeaderboardEntry entry;
  final bool highlight;
  const _RankRow({required this.entry, this.highlight = false});

  @override
  Widget build(BuildContext context) {
    final isMe = entry.isCurrentUser || highlight;
    return AppCard(
      color: isMe ? AppColors.accent.withOpacity(0.07) : null,
      showBorder: isMe,
      child: Row(
        children: [
          SizedBox(
            width: 32,
            child: Text(
              '#${entry.rank}',
              style: AppTextStyles.labelMd.copyWith(
                color: entry.rank <= 3 ? AppColors.accent : AppColors.muted,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(width: AppSpacing.s4),
          AppAvatar(
              imageUrl: entry.avatarUrl, name: entry.username, size: 36),
          const SizedBox(width: AppSpacing.s4),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  entry.username + (isMe ? ' (you)' : ''),
                  style: AppTextStyles.labelMd,
                ),
                Text('${entry.streak}🔥 streak',
                    style: AppTextStyles.mutedSm),
              ],
            ),
          ),
          AppBadge(
            label: '${entry.totalPoints} XP',
            variant: AppBadgeVariant.muted,
          ),
        ],
      ),
    );
  }
}
