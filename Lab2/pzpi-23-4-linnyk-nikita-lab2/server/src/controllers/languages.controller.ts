import {Request, Response, NextFunction} from 'express';
import {prisma} from '../lib/prisma.js';
import * as languageService from "../services/languages.service.js";
import {
    CreateLanguageInput, UpdateLanguageInput
} from "../middlewares/validation/language.schema.js";

// Add a new language to the database
export const addLanguage = async (
    req: Request<{}, {}, CreateLanguageInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const newLanguage = await languageService.addLanguage(req.body);

        res.status(201).json({
            message: 'Language created successfully',
            language: newLanguage
        })
    } catch (err) {
        next(err)
    }
}

// Get all languages from the database
export const getLanguages = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const languages = await languageService.getLanguages();

        res.status(200).json({
            message: 'Languages fetched successfully',
            languages
        })
    } catch (err) {
        next(err)
    }
}

// Grant a language to a user
export const grantLanguageToUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {userId, languageId} = req.params;

        const user = await prisma.user.findUnique({where: {userId}});
        const language = await prisma.language.findUnique({where: {id: Number(languageId)}});

        if (!user || !language) {
            return res.status(404).json({
                message: 'User or language not found.'
            })
        }

        const existing = await prisma.userLanguage.findUnique({
            where: {
                userId_languageId: {
                    userId,
                    languageId: Number(languageId)
                }
            }
        });

        if (existing) {
            return res.status(409).json({
                message: 'Language already granted to user.'
            })
        }

        const newUserLanguage = await prisma.userLanguage.create({
            data: {
                userId,
                languageId: Number(languageId),
            }
        });

        res.status(201).json(
            {
                message: 'Language granted successfully.',
                userLanguage: newUserLanguage
            }
        )
    } catch (err) {
        next(err)
    }
}

// Get user languages
export const getUserLanguages = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {userId} = req.params;

        const user = await prisma.user.findUnique({where: {userId}});

        if (!user) {
            return res.status(404).json({
                message: 'User not found.'
            })
        }

        const userLanguages = await prisma.userLanguage.findMany(
            {
                where: {userId},
                select: {
                    userId: true,
                    language: true
                }
            }
        )

        res.status(200).json({
            message: 'User languages fetched successfully.',
            userLanguages
        })
    } catch (err) {
        next(err)
    }
}

// Update language
export const updateLanguage = async (
    req: Request<{ id: string }, {}, UpdateLanguageInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = Number(req.params.id);

        const updated = await languageService.updateLanguage({id, ...req.body})

        res.status(200).json({
            message: 'Language updated successfully',
            language: updated
        });
    } catch (err) {
        next(err);
    }
};

// Delete language
export const deleteLanguage = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = Number(req.params.id);

        await prisma.language.delete({
            where: { id }
        });

        res.status(200).json({
            message: 'Language deleted successfully'
        });
    } catch (err) {
        next(err);
    }
};