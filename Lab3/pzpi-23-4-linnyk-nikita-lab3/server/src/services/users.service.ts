import {prisma} from "../lib/prisma.js";
import {
    UpdateProfileInput
} from "../middlewares/validation/user.schema.js";
import {ConflictError, NotFoundError, UnauthorizedError} from "../errors/index.js";
import {comparePassword, hashPassword} from "../utils/password.js";

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
            dailyGoalExercises: true,
            notificationsEnabled: true,
            reminderTime: true,
            nativeLanguageId: true,
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
        select: {streak: true, dailyGoalExercises: true}
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
        dailyGoal: userMeta?.dailyGoalExercises ?? 10,
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
    nativeLanguageId: number,
    dailyGoalExercises?: number
) => {
    const language = await prisma.language.findUnique({where: {id: nativeLanguageId}});
    if (!language) throw new NotFoundError('Language not found');

    await prisma.user.update({
        where: {userId},
        data: {
            nativeLanguageId,
            ...(dailyGoalExercises !== undefined ? {dailyGoalExercises} : {}),
        },
    });

    return getMyProfile(userId);
};

export const getSettings = async (userId: string) => {
    return prisma.user.findUnique({
        where: {userId},
        select: {
            dailyGoalExercises: true,
            notificationsEnabled: true,
            reminderTime: true,
            timezone: true,
        }
    });
};

export const updateSettings = async (
    userId: string,
    data: {
        dailyGoalExercises?: number;
        notificationsEnabled?: boolean;
        reminderTime?: string;
        timezone?: string;
    }
) => {
    return prisma.user.update({
        where: {userId},
        data,
        select: {
            dailyGoalExercises: true,
            notificationsEnabled: true,
            reminderTime: true,
            timezone: true,
        }
    });
};

export const changePassword = async (
    userId: string,
    currentPassword: string,
    newPassword: string
) => {
    const user = await prisma.user.findUnique({
        where: {userId},
        select: {passwordHash: true}
    });
    if (!user) throw new NotFoundError('User not found');

    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Current password is incorrect');

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
        where: {userId},
        data: {
            passwordHash: newHash,
            tokenVersion: {increment: 1}
        }
    });
};

export const deleteMyAccount = async (userId: string) => {
    await prisma.user.delete({where: {userId}});
};
