import {prisma} from "../lib/prisma.js";
import {ConflictError, NotFoundError} from "../errors/index.js";
import {
    CreateCourseInput, EnrollCourseInput,
    UpdateCourseInput
} from "../middlewares/validation/course.schema.js";

export const findAllCourses = async () => {
    const coursesFromDb = await prisma.course.findMany({
        include: {
            language: true,
            _count: {select: {lessons: true}}
        }
    });

    return coursesFromDb.map(course => ({
        courseId: course.courseId,
        title: course.title,
        description: course.description,
        level: course.level,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        language: {
            id: course.language.id,
            code: course.language.code,
            name: course.language.name
        },
        lessonCount: course._count.lessons
    }));
};

export const createCourse = async (
    data: CreateCourseInput
) => {
    const language = await prisma.language.findUnique({
        where: {code: data.languageCode}
    })

    if (!language) {
        throw new NotFoundError('Language not found');
    }

    return prisma.course.create({
        data: {
            title: data.title,
            description: data.description,
            level: data.level,
            targetLanguageId: language.id
        }
    });
}

export const enrollForCourse = async (
    data: {userId: string} & EnrollCourseInput
) => {
    const alreadyEnrolled = await prisma.enrollment.findUnique({
        where: {userId_courseId: {userId: data.userId, courseId: data.courseId}}
    })

    if (alreadyEnrolled) {
        throw new ConflictError('User already enrolled in the course');
    }

    return prisma.enrollment.create({
        data: {
            userId: data.userId,
            courseId: data.courseId,
        }
    })
}

export const updateCourse = async (
    data: {courseId: string} & UpdateCourseInput
) => {
    const course = await prisma.course.findUnique({
        where: {courseId: parseInt(data.courseId)}
    })

    if (!course) {
        throw new NotFoundError('Course not found');
    }

    const languageCode = data.languageCode;
    let targetLanguageId: number | undefined = undefined;

    if (languageCode) {
        const language = await prisma.language.findUnique({
            where: {code: languageCode}
        })

        if (!language) {
            throw new NotFoundError('Language not found');
        }

        targetLanguageId = language.id;
    }

    return prisma.course.update({
        where: { courseId: parseInt(data.courseId) },
        data: {
            title: data.title,
            description: data.description,
            level: data.level,
            targetLanguageId: targetLanguageId
        }
    });
}

export const unenrollFromCourse = async (userId: string, courseId: number) => {
    const enrollment = await prisma.enrollment.findUnique({
        where: {userId_courseId: {userId, courseId}}
    });
    if (!enrollment) throw new NotFoundError('Enrollment not found');

    return prisma.enrollment.delete({
        where: {userId_courseId: {userId, courseId}}
    });
};

export const deleteCourse = async (courseId: string) => {
    const course = await prisma.course.findUnique({
        where: {courseId: parseInt(courseId)}
    })

    if (!course) {
        throw new NotFoundError('Course not found');
    }

    return prisma.course.delete({
        where: { courseId: parseInt(courseId)}
    });
}

export const getCourseProgress = async (userId: string, courseId: string) => {
    const course = await prisma.course.findUnique({
        where: {courseId: parseInt(courseId)},
        include: {
            lessons: {
                orderBy: {sequence: 'asc'},
                include: {
                    exercises: {
                        include: {
                            progress: {
                                where: {
                                    userId,
                                    isCorrect: true
                                },
                                take: 1
                            }
                        }
                    }
                }
            }
        }
    })

    if (!course) {
        throw new NotFoundError('Course not found');
    }

    let totalCourseExercises = 0;
    let completedCourseExercises = 0;

    const lessonsWithStatus = course.lessons.map(lesson => {
        const totalExercises = lesson.exercises.length;

        const completedExercises = lesson.exercises.filter(exercise => exercise.progress.length > 0).length;

        const isCompleted = totalExercises > 0 && completedExercises === totalExercises;

        totalCourseExercises += totalExercises;
        completedCourseExercises += completedExercises;

        return {
            lessonId: lesson.lessonId,
            title: lesson.title,
            sequence: lesson.sequence,
            totalExercises,
            completedExercises,
            isCompleted,
            progressPercent: totalExercises === 0 ? 0 : Math.round((completedExercises / totalExercises) * 100)
        }
    })

    const courseProgressPercent = totalCourseExercises === 0 ? 0 :
                                  Math.round((completedCourseExercises / totalCourseExercises) * 100);

    return {
        courseId: course.courseId,
        title: course.title,
        totalProgress: courseProgressPercent,
        lessons: lessonsWithStatus
    }
}