import {NextFunction, Request, Response} from 'express'
import {prisma} from "../lib/prisma.js";
import * as userService from "../services/users.service.js";
import {OnboardingInput, UpdateSettingsInput} from "../middlewares/validation/user.schema.js";


export const updateUserRole = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {id} = req.params;
        const {role} = req.body;

        if (req.user?.userId === id) {
            res.status(403).json({ message: 'You cannot change your own role.' });
            return;
        }

        await prisma.user.update({
            where: {userId: id},
            data: {
                role,
                tokenVersion: {increment: 1}
            }
        })

        res.status(200).json({message: "User role updated successfully."});
    } catch (err) {
        next(err);
    }
};

export const deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {id} = req.params;

        if (req.user?.userId === id) {
            res.status(403).json({ message: 'You cannot delete your own account from the admin panel.' });
            return;
        }

        const deletedUser = await prisma.user.delete({where: {userId: id}});

        res.status(200).json({
            message: "User deleted successfully.",
            deletedUser
        });
    } catch (err) {
        next(err);
    }
}

export const getMyProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;

        const fetchedUser = await userService.getMyProfile(user!.userId);

        res.status(200).json({
            message: "User fetched successfully.",
            user: fetchedUser
        });
    } catch (err) {
        next(err);
    }
}

export const updateMyProfile = async (
    req: Request, res: Response, next: NextFunction
) => {
    try {
        const updatedFields = req.body;

        const user = req.user;

        const updatedUser = await userService.updateMyProfile(
            user!.userId, updatedFields
        );

        res.status(200).json({
            message: "User updated successfully.",
            user: updatedUser
        })
    } catch (err) {
        next(err);
    }
};

export const getMyStats = async (
    req: Request, res: Response, next: NextFunction
) => {
    try {
        const user = req.user;

        const userStats = await userService.getMyStats(user!.userId);

        res.status(200).json({
            message: "User stats fetched successfully.",
            userStats
        })
    } catch (err) {
        next(err);
    }
};

export const completeOnboarding = async (
    req: Request<{}, {}, OnboardingInput>, res: Response, next: NextFunction
) => {
    try {
        const user = req.user;
        const {nativeLanguageId, dailyGoalExercises} = req.body;

        const updatedUser = await userService.completeOnboarding(
            user!.userId, nativeLanguageId, dailyGoalExercises
        );

        res.status(200).json({message: 'Onboarding completed.', user: updatedUser});
    } catch (err) {
        next(err);
    }
};

export const getSettings = async (
    req: Request, res: Response, next: NextFunction
) => {
    try {
        const settings = await userService.getSettings(req.user!.userId);
        res.status(200).json({settings});
    } catch (err) {
        next(err);
    }
};

export const updateSettings = async (
    req: Request<{}, {}, UpdateSettingsInput>, res: Response, next: NextFunction
) => {
    try {
        const settings = await userService.updateSettings(req.user!.userId, req.body);
        res.status(200).json({message: 'Settings updated.', settings});
    } catch (err) {
        next(err);
    }
};

export const getMyEnrollments = async (
    req: Request, res: Response, next: NextFunction
) => {
    try {
        const enrollments = await userService.getMyEnrollments(req.user!.userId);
        res.status(200).json({enrollments});
    } catch (err) {
        next(err);
    }
};

export const changePassword = async (
    req: Request<{}, {}, {currentPassword: string; newPassword: string}>,
    res: Response,
    next: NextFunction
) => {
    try {
        const {currentPassword, newPassword} = req.body;
        await userService.changePassword(req.user!.userId, currentPassword, newPassword);
        res.status(200).json({message: 'Password changed successfully.'});
    } catch (err) {
        next(err);
    }
};

export const deleteMyAccount = async (
    req: Request, res: Response, next: NextFunction
) => {
    try {
        await userService.deleteMyAccount(req.user!.userId);
        res.status(200).json({message: 'Account deleted successfully.'});
    } catch (err) {
        next(err);
    }
};