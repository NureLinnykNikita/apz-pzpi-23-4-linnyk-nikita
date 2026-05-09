import {prisma} from "../lib/prisma.js";
import {NotFoundError} from "../errors/index.js";
import {
    CreateExerciseInput, ExerciseProgressInput, UpdateExerciseInput
} from "../middlewares/validation/exerices.schema.js";
import {Prisma} from '../../generated/prisma/client.js';
import * as achievementService from "./achievements.service.js";
import { updateStreak } from "./users.service.js";


const createExerciseWithRetry = async (data: CreateExerciseInput, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await prisma.$transaction(async (tx) => {
                let sequence = data.sequence;
                const lastExercise = await tx.exercise.findFirst({
                    where: {lessonId: data.lessonId},
                    orderBy: {sequence: 'desc'}
                })

                if (!sequence) {
                    sequence = (lastExercise?.sequence || 0) + 1;

                    return tx.exercise.create({
                        data: {
                            lessonId: data.lessonId,
                            type: data.type,
                            question: data.question,
                            correctAnswer: data.correctAnswer,
                            mediaUrl: data.mediaUrl,
                            points: data.points,
                            sequence,
                            metadata: data.metadata
                        }
                    });
                } else {
                    const exercisesToShift = await tx.exercise.findMany({
                        where: {
                            lessonId: data.lessonId,
                            sequence: {gte: sequence}
                        },
                        orderBy: {sequence: 'desc'},
                        select: {exerciseId: true, sequence: true}
                    });

                    for (const exercise of exercisesToShift) {
                        await tx.exercise.update({
                            where: {exerciseId: exercise.exerciseId},
                            data: {sequence: {increment: 1}}
                        })
                    }

                    return tx.exercise.create({
                        data: {...data, sequence}
                    });
                }
            }, {isolationLevel: "Serializable"});
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2034') {
                if (i === maxRetries - 1) {
                    throw err;
                }
                continue;
            }
            throw err;
        }
    }
}

const updateExerciseWithRetry = async (data: {
    exerciseId: number
} & UpdateExerciseInput, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await prisma.$transaction(async (tx) => {
                const exercise = await tx.exercise.findUnique({
                    where: {exerciseId: data.exerciseId}
                })

                if (!exercise) {
                    throw new NotFoundError('Exercise not found');
                }

                if (exercise.sequence === data.sequence) return exercise;

                if (data.lessonId === undefined && data.sequence) {
                    const exercisesToShift = await tx.exercise.findMany({
                        where: {
                            lessonId: exercise.lessonId,
                            sequence: {gte: data.sequence}
                        },
                        orderBy: {sequence: 'desc'},
                        select: {exerciseId: true, sequence: true}
                    });

                    for (const exercise of exercisesToShift) {
                        await tx.exercise.update({
                            where: {exerciseId: exercise.exerciseId},
                            data: {sequence: {increment: 1}}
                        })
                    }

                    return tx.exercise.update({
                        where: {exerciseId: data.exerciseId},
                        data: {sequence: data.sequence}
                    })
                } else if (data.lessonId && data.sequence === undefined) {
                    if (data.lessonId === exercise.lessonId) return exercise;

                    const lastExercise = await tx.exercise.findFirst({
                        where: {lessonId: data.lessonId},
                        orderBy: {sequence: 'desc'}
                    });

                    await tx.exercise.updateMany({
                        where: {
                            lessonId: data.lessonId,
                            sequence: {gte: exercise.sequence}
                        },
                        data: {
                            sequence: {decrement: 1}
                        }
                    })

                    return tx.exercise.update({
                        where: {exerciseId: data.exerciseId},
                        data: {
                            lessonId: data.lessonId,
                            sequence: (lastExercise?.sequence || 0) + 1
                        }
                    })
                } else if (data.lessonId && data.sequence) {
                    if ((data.lessonId === exercise.lessonId)
                        || (data.lessonId === exercise.lessonId
                            && data.sequence === exercise.sequence)) return exercise;

                    const oldLessonId = exercise.lessonId;
                    const oldSequence = exercise.sequence;
                    const newLessonId = data.lessonId;
                    const targetSequence = data.sequence;

                    await tx.exercise.update({
                        where: {exerciseId: data.exerciseId},
                        data: {
                            lessonId: newLessonId,
                            sequence: -data.exerciseId
                        }
                    });

                    const exercisesToShiftUp = await tx.exercise.findMany({
                        where: {
                            lessonId: newLessonId,
                            sequence: {gte: targetSequence}
                        },
                        orderBy: {sequence: 'desc'},
                        select: {exerciseId: true, sequence: true}
                    });

                    for (const l of exercisesToShiftUp) {
                        await tx.exercise.update({
                            where: {exerciseId: l.exerciseId},
                            data: {sequence: {increment: 1}}
                        });
                    }

                    const updatedExercise = await tx.exercise.update({
                        where: {exerciseId: data.exerciseId},
                        data: {sequence: targetSequence}
                    });

                    const exercisesToShiftDown = await tx.exercise.findMany({
                        where: {
                            lessonId: oldLessonId,
                            sequence: {gt: oldSequence}
                        },
                        orderBy: {sequence: 'asc'},
                        select: {exerciseId: true, sequence: true}
                    });

                    for (const l of exercisesToShiftDown) {
                        await tx.exercise.update({
                            where: {exerciseId: l.exerciseId},
                            data: {sequence: {decrement: 1}}
                        });
                    }

                    return updatedExercise;
                } else {
                    return tx.exercise.update({
                        where: {exerciseId: data.exerciseId},
                        data
                    })
                }
            }, {isolationLevel: "Serializable"})
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2034') {
                if (i === maxRetries - 1) {
                    throw err;
                }
                continue;
            }
            throw err;
        }
    }
}

const deleteExerciseWithRetry = async (exerciseId: number, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await prisma.$transaction(async (tx) => {
                const exercise = await tx.exercise.findUnique({
                    where: {exerciseId: exerciseId}
                })

                if (!exercise) {
                    throw new NotFoundError('Exercise not found');
                }

                const exerciseSequence = exercise.sequence;

                const deletedExercise = await tx.exercise.delete({where: {exerciseId: exerciseId}});

                await tx.exercise.updateMany({
                    where: {
                        lessonId: exercise.lessonId,
                        sequence: {gt: exerciseSequence}
                    },
                    data: {sequence: {decrement: 1}}
                })

                return deletedExercise;
            }, {isolationLevel: "Serializable"})
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2034') {
                if (i === maxRetries - 1) {
                    throw err;
                }
                continue;
            }
            throw err;
        }
    }
}


export const createExercise = async (
    data: CreateExerciseInput
) => {
    return createExerciseWithRetry(data);
};

export const getExercises = async (lessonId: number) => {
    return prisma.exercise.findMany({
        where: {
            lessonId
        }
    })
}

export const exerciseProgress = async (data: ExerciseProgressInput) => {
    const exercise = await prisma.exercise.findUnique({
        where: {exerciseId: data.exerciseId}
    })

    if (!exercise) {
        throw new NotFoundError('Exercise not found');
    }

    return prisma.exerciseProgress.create({data})
}

export const updateExercise = async (data:
                                         {
                                             exerciseId: number
                                         } & UpdateExerciseInput
) => {
    return updateExerciseWithRetry(data);
}

export const deleteExercise = async (exerciseId: number) => {
    return deleteExerciseWithRetry(exerciseId);
}

export const submitExercise = async (
    userId: string, exerciseId: number, userAnswer: string
) => {
    const exercise = await prisma.exercise.findUnique({
        where: {exerciseId: exerciseId}
    })

    if (!exercise) {
        throw new NotFoundError('Exercise not found');
    }

    const userFormattedAnswer = userAnswer.toLowerCase().trim();
    const exerciseFormattedCorrectAnswer = exercise.correctAnswer.toLowerCase().trim();
    const isCorrect = exerciseFormattedCorrectAnswer === userFormattedAnswer;

    const attemptsCount = await prisma.exerciseProgress.count({
        where: {userId, exerciseId}
    })

    const newProgress = await prisma.exerciseProgress.create({
        data: {
            userId,
            exerciseId,
            userAnswer,
            isCorrect,
            earnedPoints: isCorrect ? (exercise.points || 0) : 0,
            attemptNumber: attemptsCount + 1
        }
    })

    updateEnrollmentProgress(userId, exercise.lessonId).catch(err => {
        console.error("Enrollment progress update failed:", err);
    });

    achievementService.checkAndUnlockAchievements(userId).catch(err => {
        console.error("Achievement check failed:", err);
    });

    updateStreak(userId).catch(err => {
        console.error("Streak update failed:", err);
    });

    return newProgress
}

const updateEnrollmentProgress = async (userId: string, lessonId: number) => {
    const lesson = await prisma.lesson.findUnique({
        where: { lessonId },
        select: { courseId: true }
    });
    if (!lesson) return;

    const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: lesson.courseId } }
    });
    if (!enrollment) return;

    const { courseId } = lesson;

    const [totalExercises, completedExercises] = await Promise.all([
        prisma.exercise.count({
            where: { lesson: { courseId } }
        }),
        prisma.exerciseProgress.groupBy({
            by: ['exerciseId'],
            where: { userId, isCorrect: true, exercise: { lesson: { courseId } } }
        }).then(res => res.length)
    ]);

    const progress = totalExercises === 0
                     ? 0
                     : Math.round((completedExercises / totalExercises) * 100);

    await prisma.enrollment.update({
        where: { userId_courseId: { userId, courseId } },
        data: {
            progress,
            ...(progress === 100 && {
                status: 'completed',
                completedAt: new Date()
            })
        }
    });
};