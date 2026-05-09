import {prisma} from "../lib/prisma.js";
import {
    UpdateProfileInput
} from "../middlewares/validation/user.schema.js";
import {ConflictError, NotFoundError} from "../errors/index.js";

export const getMyProfile = async (userId: string) => {
    return prisma.user.findUnique({
        where: {userId},
        select: {
            userId: true,
            username: true,
            email: true,
            role: true,
            avatarUrl: true,
            bio: true,
            streak: true,
            dailyGoalMinutes: true,
            nativeLanguage: {
                select: {
                    id: true,
                    code: true,
                    name: true
                }
            },
            createdAt: true
        }
    })
}

export const updateMyProfile = async (
    userId: string, data: UpdateProfileInput
) => {
    if (data.username) {
        const existing = await prisma.user.findUnique({where: {username: data.username}});
        if (existing && existing.userId !== userId) {
            throw new ConflictError('Username already taken');
        }
    }

    if ((data as any).email) {
        const existing = await prisma.user.findUnique({where: {email: (data as any).email}});
        if (existing && existing.userId !== userId) {
            throw new ConflictError('Email already in use');
        }
    }

    if (data.nativeLanguageId) {
        const language = await prisma.language.findUnique({where: {id: data.nativeLanguageId}});
        if (!language) {
            throw new NotFoundError('Invalid language');
        }
    }

    return prisma.user.update({
        where: {userId}, data: {
            username: data.username,
            email: (data as any).email,
            bio: data.bio,
            avatarUrl: data.avatarUrl,
            nativeLanguageId: data.nativeLanguageId,
        }
    })
};

export const getMyStats = async (userId: string) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
        totalPointsResult,
        exercisesCompleted,
        totalAttemptsResult,
        correctAttemptsResult,
        coursesEnrolled,
        achievementsCount,
        todayExercises,
    ] = await Promise.all([
        prisma.exerciseProgress.aggregate({
            where: {
                userId,
                isCorrect: true,
            },
            _sum: {
                earnedPoints: true,
            }
        }),
        prisma.exerciseProgress.findMany({
            where: {
                userId,
                isCorrect: true,
            },
            distinct: ['exerciseId'],
            select: {
                exerciseId: true,
            },
        }),
        prisma.exerciseProgress.aggregate({
            where: {userId},
            _count: {id: true},
        }),
        prisma.exerciseProgress.aggregate({
            where: {userId, isCorrect: true},
            _count: {id: true},
        }),
        prisma.enrollment.count({
            where: {userId},
        }),
        prisma.userAchievement.count({
            where: {userId},
        }),
        prisma.exerciseProgress.count({
            where: {userId, isCorrect: true, createdAt: {gte: todayStart}},
        }),
    ])

    const totalAttempts = totalAttemptsResult._count.id;
    const correctAttempts = correctAttemptsResult._count.id;

    const userMeta = await prisma.user.findUnique({
        where: {userId},
        select: {streak: true, dailyGoalMinutes: true}
    });

    return {
        totalPoints: totalPointsResult._sum.earnedPoints ?? 0,
        exercisesCompleted: exercisesCompleted.length,
        correctAnswersRate: totalAttempts === 0 ? 0
            : Math.round((correctAttempts / totalAttempts) * 100) / 100,
        coursesEnrolled,
        achievementsCount,
        streak: userMeta?.streak ?? 0,
        todayExercises,
        dailyGoal: userMeta?.dailyGoalMinutes ?? 10,
    };
};

export const updateStreak = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {userId},
        select: {streak: true, lastActivityAt: true}
    });
    if (!user) return;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (user.lastActivityAt) {
        const lastDay = new Date(
            user.lastActivityAt.getFullYear(),
            user.lastActivityAt.getMonth(),
            user.lastActivityAt.getDate()
        );
        if (lastDay.getTime() === todayStart.getTime()) return;
    }

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(todayStart.getDate() - 1);

    const isConsecutive = user.lastActivityAt
        ? new Date(
              user.lastActivityAt.getFullYear(),
              user.lastActivityAt.getMonth(),
              user.lastActivityAt.getDate()
          ).getTime() === yesterdayStart.getTime()
        : false;

    await prisma.user.update({
        where: {userId},
        data: {
            streak: isConsecutive ? user.streak + 1 : 1,
            lastActivityAt: now,
        }
    });
};

export const getMyEnrollments = async (userId: string) => {
    return prisma.enrollment.findMany({
        where: { userId },
        include: {
            course: {
                include: { language: true }
            }
        },
        orderBy: { enrolledAt: 'desc' }
    });
};

export const completeOnboarding = async (
    userId: string,
    targetLanguageId: number,
    dailyGoalMinutes: number
) => {
    const language = await prisma.language.findUnique({where: {id: targetLanguageId}});
    if (!language) throw new NotFoundError('Language not found');

    await prisma.$transaction([
        prisma.userLanguage.upsert({
            where: {userId_languageId: {userId, languageId: targetLanguageId}},
            create: {userId, languageId: targetLanguageId},
            update: {},
        }),
        prisma.user.update({
            where: {userId},
            data: {dailyGoalMinutes},
        }),
    ]);

    return getMyProfile(userId);
};

export const getSettings = async (userId: string) => {
    return prisma.user.findUnique({
        where: {userId},
        select: {
            dailyGoalMinutes: true,
            notificationsEnabled: true,
            reminderTime: true,
        }
    });
};

export const updateSettings = async (
    userId: string,
    data: {
        dailyGoalMinutes?: number;
        notificationsEnabled?: boolean;
        reminderTime?: string;
    }
) => {
    return prisma.user.update({
        where: {userId},
        data,
        select: {
            dailyGoalMinutes: true,
            notificationsEnabled: true,
            reminderTime: true,
        }
    });
};
