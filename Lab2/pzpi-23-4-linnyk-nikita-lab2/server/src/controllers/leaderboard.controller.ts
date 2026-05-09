import { NextFunction, Request, Response } from 'express';
import { getLeaderboard } from '../services/leaderboard.service.js';

export const leaderboard = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const period = (['week', 'month', 'all'] as const).includes(
            req.query.period as any
        )
            ? (req.query.period as 'week' | 'month' | 'all')
            : 'week';

        const languageId = req.query.languageId
            ? Number(req.query.languageId)
            : undefined;

        const limit = req.query.limit ? Math.min(Number(req.query.limit), 100) : 50;

        const data = await getLeaderboard({
            period,
            languageId,
            limit,
            currentUserId: req.user!.userId,
        });

        res.json(data);
    } catch (err) {
        next(err);
    }
};
