import {Request, Response, NextFunction} from 'express';
import {prisma} from '../lib/prisma.js';
import * as achievementService from '../services/achievements.service.js';
import {
    CreateAchievementInput, UpdateAchievementInput
} from "../middlewares/validation/achievement.schema";


export const createAchievement = async (
    req: Request<{}, {}, CreateAchievementInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const reqBody = req.body;

        const newAchievement = await achievementService.createAchievement(reqBody);

        res.status(201).json({
            message: 'Achievement created successfully.',
            achievement: newAchievement
        });
    } catch (err) {
        next(err);
    }
}

export const getUserAchievements = async (
    req: Request<{userId: string}>,
    res: Response,
    next: NextFunction
) => {
    try {
        const {userId} = req.params;

        const userAchievements = await achievementService.getUserAchievements(userId);

        res.status(200).json({
            message: 'User achievements fetched successfully.',
            userAchievements
        })
    } catch (err) {
        next(err);
    }
}

export const grantAchievementToUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {userId, achievementId} = req.params;

        const newUserAchievement = await
            achievementService.grantAchievementToUser(userId, Number(achievementId));

        res.status(201).json({
            message: 'Achievement granted successfully.',
            userAchievement: newUserAchievement
        });
    } catch (err) {
        next(err);
    }
}

export const updateAchievement = async (
    req: Request<{ id: string }, {}, UpdateAchievementInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const achievementId = Number(req.params.id);

        const updated = await achievementService.updateAchievement(
            achievementId, req.body
        )

        res.status(200).json({
            message: 'Achievement updated successfully.',
            achievement: updated
        });
    } catch (err) {
        next(err);
    }
};

export const deleteAchievement = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const achievementId = Number(req.params.id);

        const deletedAchievement = await achievementService
            .deleteAchievement(achievementId);

        res.status(200).json({
            message: 'Achievement deleted successfully.',
            deletedAchievement
        });
    } catch (err) {
        next(err);
    }
};
