import { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const getAdminUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, role, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { userId: true, username: true, email: true, role: true, streak: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

export const getAdminStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [usersCount, coursesCount, exercisesToday, messagesTotal] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.exerciseProgress.count({ where: { createdAt: { gte: today } } }),
      prisma.message.count(),
    ]);

    res.json({ usersCount, coursesCount, exercisesToday, messagesTotal });
  } catch (err) {
    next(err);
  }
};

export const exportData = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [courses, languages, achievements] = await Promise.all([
      prisma.course.findMany({
        include: { lessons: { include: { exercises: true } } },
      }),
      prisma.language.findMany(),
      prisma.achievement.findMany(),
    ]);

    const payload = { exportedAt: new Date().toISOString(), courses, languages, achievements };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="langbang-backup-${new Date().toISOString().slice(0, 10)}.json"`);
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

export const importData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body as {
      languages?: { code: string; name: string }[];
      achievements?: {
        code: string; title: string; description: string;
        category: string; conditionType: string; conditionValue: number; iconUrl?: string;
      }[];
      courses?: {
        title: string; description?: string; level: string; targetLanguageId: number;
        lessons?: { title: string; description?: string; sequence: number; exercises?: unknown[] }[];
      }[];
    };

    if (payload.languages?.length) {
      for (const lang of payload.languages) {
        await prisma.language.upsert({
          where: { code: lang.code },
          update: { name: lang.name },
          create: lang,
        });
      }
    }

    if (payload.achievements?.length) {
      for (const ach of payload.achievements) {
        await prisma.achievement.upsert({
          where: { code: ach.code },
          update: ach,
          create: ach,
        });
      }
    }

    res.json({ message: 'Import successful.' });
  } catch (err) {
    next(err);
  }
};
