import { prisma } from '../lib/prisma.js';

type Period = 'week' | 'month' | 'all';

const periodToDate = (period: Period): Date | undefined => {
    if (period === 'all') return undefined;
    const d = new Date();
    d.setDate(d.getDate() - (period === 'week' ? 7 : 30));
    return d;
};

export const getLeaderboard = async (params: {
    period: Period;
    languageId?: number;
    limit: number;
    currentUserId: string;
}) => {
    const { period, languageId, limit, currentUserId } = params;
    const since = periodToDate(period);

    const grouped = await prisma.exerciseProgress.groupBy({
        by: ['userId'],
        where: {
            isCorrect: true,
            ...(since ? { createdAt: { gte: since } } : {}),
            ...(languageId
                ? {
                      exercise: {
                          lesson: {
                              course: { targetLanguageId: languageId },
                          },
                      },
                  }
                : {}),
        },
        _sum: { earnedPoints: true },
        orderBy: { _sum: { earnedPoints: 'desc' } },
    });

    const userIds = [...new Set([
        ...grouped.slice(0, limit).map(g => g.userId),
        currentUserId,
    ])];

    const users = await prisma.user.findMany({
        where: { userId: { in: userIds } },
        select: { userId: true, username: true, avatarUrl: true, streak: true },
    });

    const userMap = new Map(users.map(u => [u.userId, u]));

    const entries = grouped
        .slice(0, limit)
        .map((g, idx) => {
            const user = userMap.get(g.userId);
            return {
                rank: idx + 1,
                userId: g.userId,
                username: user?.username ?? 'Unknown',
                avatarUrl: user?.avatarUrl ?? null,
                streak: user?.streak ?? 0,
                totalPoints: g._sum.earnedPoints ?? 0,
                isCurrentUser: g.userId === currentUserId,
            };
        });

    const currentUserInList = entries.some(e => e.isCurrentUser);
    const currentUserEntry = !currentUserInList
        ? grouped.findIndex(g => g.userId === currentUserId)
        : -1;

    let currentUserRow = null;
    if (!currentUserInList && currentUserEntry !== -1) {
        const g = grouped[currentUserEntry];
        const user = userMap.get(g.userId);
        currentUserRow = {
            rank: currentUserEntry + 1,
            userId: g.userId,
            username: user?.username ?? 'Unknown',
            avatarUrl: user?.avatarUrl ?? null,
            streak: user?.streak ?? 0,
            totalPoints: g._sum.earnedPoints ?? 0,
            isCurrentUser: true,
        };
    }

    return { entries, currentUserRow };
};
