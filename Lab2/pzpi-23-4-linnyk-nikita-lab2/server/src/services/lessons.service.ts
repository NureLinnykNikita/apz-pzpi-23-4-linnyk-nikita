import {prisma} from "../lib/prisma.js";
import {NotFoundError} from "../errors/index.js";
import {
    CreateLessonInput,
    UpdateLessonInput
} from "../middlewares/validation/lesson.schema.js";
import {Prisma} from '../../generated/prisma/client.js';


// TODO: create generalized function for sequence logic
const createLessonWithRetry = async (data: CreateLessonInput, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await prisma.$transaction(async (tx) => {
                let sequence = data.sequence;
                const lastLesson = await tx.lesson.findFirst({
                    where: {courseId: data.courseId},
                    orderBy: {sequence: 'desc'}
                })

                if (!sequence) {
                    sequence = (lastLesson?.sequence || 0) + 1;

                    return tx.lesson.create({
                        data: {
                            courseId: data.courseId,
                            title: data.title,
                            description: data.description,
                            sequence: sequence
                        }
                    });
                } else {
                    const lessonsToShift = await tx.lesson.findMany({
                        where: {
                            courseId: data.courseId,
                            sequence: {gte: sequence}
                        },
                        orderBy: {sequence: 'desc'},
                        select: {lessonId: true, sequence: true}
                    });

                    for (const lesson of lessonsToShift) {
                        await tx.lesson.update({
                            where: {lessonId: lesson.lessonId},
                            data: {sequence: {increment: 1}}
                        })
                    }

                    return tx.lesson.create({
                        data: {
                            ...data,
                            sequence: sequence
                        }
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

const updateLessonWithRetry = async (data: {
    lessonId: number
} & UpdateLessonInput, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await prisma.$transaction(async (tx) => {
                const lesson = await tx.lesson.findUnique({
                    where: {lessonId: data.lessonId}
                })

                if (!lesson) {
                    throw new NotFoundError('Lesson not found');
                }

                if (lesson.sequence === data.sequence) return lesson;

                if (data.courseId === undefined && data.sequence) {
                    const lessonsToShift = await tx.lesson.findMany({
                        where: {
                            courseId: lesson.courseId,
                            sequence: {gte: data.sequence}
                        },
                        orderBy: {sequence: 'desc'},
                        select: {lessonId: true, sequence: true}
                    });

                    for (const lesson of lessonsToShift) {
                        await tx.lesson.update({
                            where: {lessonId: lesson.lessonId},
                            data: {sequence: {increment: 1}}
                        })
                    }

                    return tx.lesson.update({
                        where: {lessonId: data.lessonId},
                        data: {sequence: data.sequence}
                    })
                } else if (data.courseId && data.sequence === undefined) {
                    if (data.courseId === lesson.courseId) return lesson;

                    const lastLesson = await tx.lesson.findFirst({
                        where: {courseId: data.courseId},
                        orderBy: {sequence: 'desc'}
                    });

                    await tx.lesson.updateMany({
                        where: {
                            courseId: data.courseId,
                            sequence: {gte: lesson.sequence}
                        },
                        data: {
                            sequence: {decrement: 1}
                        }
                    })

                    return tx.lesson.update({
                        where: {lessonId: data.lessonId},
                        data: {
                            courseId: data.courseId,
                            sequence: (lastLesson?.sequence || 0) + 1
                        }
                    })
                } else if (data.courseId && data.sequence) {
                    // TODO: sequence
                    if ((data.courseId === lesson.courseId)
                        || (data.courseId === lesson.courseId
                        && data.sequence === lesson.sequence)) return lesson;

                    const oldCourseId = lesson.courseId;
                    const oldSequence = lesson.sequence;
                    const newCourseId = data.courseId;
                    const targetSequence = data.sequence;

                    await tx.lesson.update({
                        where: {lessonId: data.lessonId},
                        data: {
                            courseId: newCourseId,
                            sequence: -data.lessonId
                        }
                    });

                    const lessonsToShiftUp = await tx.lesson.findMany({
                        where: {
                            courseId: newCourseId,
                            sequence: {gte: targetSequence}
                        },
                        orderBy: {sequence: 'desc'},
                        select: {lessonId: true, sequence: true}
                    });

                    for (const l of lessonsToShiftUp) {
                        await tx.lesson.update({
                            where: {lessonId: l.lessonId},
                            data: {sequence: {increment: 1}}
                        });
                    }

                    const updatedLesson = await tx.lesson.update({
                        where: {lessonId: data.lessonId},
                        data: {sequence: targetSequence}
                    });

                    const lessonsToShiftDown = await tx.lesson.findMany({
                        where: {
                            courseId: oldCourseId,
                            sequence: {gt: oldSequence}
                        },
                        orderBy: {sequence: 'asc'},
                        select: {lessonId: true, sequence: true}
                    });

                    for (const l of lessonsToShiftDown) {
                        await tx.lesson.update({
                            where: {lessonId: l.lessonId},
                            data: {sequence: {decrement: 1}}
                        });
                    }

                    return updatedLesson;
                } else {
                    return tx.lesson.update({
                        where: {lessonId: data.lessonId},
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

const deleteLessonWithRetry = async (lessonId: number, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await prisma.$transaction(async (tx) => {
                const lesson = await tx.lesson.findUnique({
                    where: {lessonId: lessonId}
                })

                if (!lesson) {
                    throw new NotFoundError('Lesson not found');
                }

                const lessonSequence = lesson.sequence;

                const deletedLesson = await tx.lesson.delete({where: {lessonId: lessonId}});

                await tx.lesson.updateMany({
                    where: {
                        courseId: lesson.courseId,
                        sequence: {gt: lessonSequence}
                    },
                    data: {sequence: {decrement: 1}}
                })

                return deletedLesson;
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

export const createLesson = async (
    data: CreateLessonInput
) => {
    return createLessonWithRetry(data);
}

export const getLessons = async (courseId: number) => {
    return prisma.lesson.findMany({
        where: {courseId: courseId},
        orderBy: {sequence: 'asc'}
    });
}

export const updateLesson = async (
    data: { lessonId: number } & UpdateLessonInput
) => {
    return updateLessonWithRetry(data);
}

export const deleteLesson = async (lessonId: number) => {
    return deleteLessonWithRetry(lessonId);
}