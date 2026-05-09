import {prisma} from "../lib/prisma.js";
import {
    CreateAchievementInput, UpdateAchievementInput
} from "../middlewares/validation/achievement.schema";
import {ConflictError} from "../errors";

export const createAchievement = async (data: CreateAchievementInput) => {
    return prisma.achievement.create({ data })
}

export const getUserAchievements = async (userId: string) => {
    return prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true }
    })
}

export const updateAchievement = async (
    achievementId: number, data: UpdateAchievementInput
) => {
    return prisma.achievement.update({
        where: { achievementId },
        data
    })
}

export const deleteAchievement = async (id: number) => {
    return prisma.achievement.delete({ where: { achievementId: id } })
}

export const grantAchievementToUser = async (userId: string, achievementId: number) => {
    const existing = await prisma.userAchievement.findUnique({
        where: {
            userId_achievementId: {
                userId,
                achievementId
            }
        }
    });

    if (existing) {
        throw new ConflictError('Achievement already granted to user.');
    }

    return prisma.userAchievement.create({
        data: {
            userId,
            achievementId
        }
    });
};

export const checkAndUnlockAchievements = async (userId: string) => {
    const stats = await prisma.exerciseProgress.aggregate({
        where: { userId, isCorrect: true },
        _count: { exerciseId: true },
        _sum: { earnedPoints: true }
    });

    const exercisesCount = stats._count.exerciseId || 0;
    const totalPoints = stats._sum.earnedPoints || 0;

    const existingAchievements = await prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true }
    });
    const existingIds = existingAchievements.map(ua => ua.achievementId);

    const potentialAchievements = await prisma.achievement.findMany({
        where: { achievementId: { notIn: existingIds } }
    });

    for (const achievement of potentialAchievements) {
        let isUnlocked = false;

        switch (achievement.conditionType) {
            case 'exercises_completed':
                if (exercisesCount >= (achievement.conditionValue || 0)) isUnlocked = true;
                break;
            case 'points_earned':
                if (totalPoints >= (achievement.conditionValue || 0)) isUnlocked = true;
                break;
        }

        if (isUnlocked) {
            await prisma.userAchievement.create({
                data: { userId, achievementId: achievement.achievementId }
            });
        }
    }
};