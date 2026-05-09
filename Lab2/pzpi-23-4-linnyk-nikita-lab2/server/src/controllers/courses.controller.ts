import {Request, Response, NextFunction} from "express";
import {Prisma} from "../../generated/prisma/client.js"
import * as courseService from "../services/courses.service.js";
import {
    CreateCourseInput,
    EnrollCourseInput,
    UpdateCourseInput
} from "../middlewares/validation/course.schema.js";
// Get all courses from the database
export const getAllCourses = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const courses = await courseService.findAllCourses();

        res.status(200).json({
            message: 'Courses fetched successfully',
            courses
        })
    } catch (err) {
        next(err)
    }
}

// Create a new course in the database
export const createCourse = async (
    req: Request<{}, {}, CreateCourseInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const {title, description, level, languageCode} = req.body;

        const newCourse = await courseService.createCourse(
            {title, description, level, languageCode}
        )

        res.status(201).json({
            message: 'Course created successfully',
            course: newCourse
        })
    } catch (err) {
        next(err)
    }
}

export const enrollForCourse = async (
    req: Request<{}, {}, EnrollCourseInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        const { courseId } = req.body;

        const newEnrollment = await courseService.enrollForCourse({userId, courseId})

        res.status(201).json({
            message: 'Successfully enrolled in the course',
            enrollment: newEnrollment
        })
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            return res.status(409).json({
               message: "User is already enrolled in the course",
            });
        }
        next(err);
    }
}

// Course update
export const updateCourse = async (
    req: Request<{courseId: string}, {}, UpdateCourseInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { courseId } = req.params;
        const { title, description, level } = req.body;

        const updatedCourse = await courseService.updateCourse(
            {courseId, title, description, level}
        )

        res.status(200).json({
            message: 'Course updated successfully',
            course: updatedCourse
        })
    } catch (err) {
        next(err)
    }
};

// Course deletion
export const deleteCourse = async (
    req: Request<{courseId: string}>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { courseId } = req.params;

        await courseService.deleteCourse(courseId);

        res.status(204).json({
            message: 'Course deleted successfully'
        });
    } catch (err) {
        next(err);
    }
};

export const unenrollFromCourse = async (
    req: Request<{courseId: string}>,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({message: "Unauthorized"});

        const courseId = Number(req.params.courseId);
        await courseService.unenrollFromCourse(userId, courseId);
        res.status(200).json({message: 'Unenrolled successfully'});
    } catch (err) {
        next(err);
    }
};

export const getCourseProgress = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.userId;
        const courseId = req.params.courseId;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        const courseProgress = await courseService.getCourseProgress(userId, courseId)

        res.status(200).json({
            message: 'Course progress fetched successfully',
            courseProgress
        })
    } catch (err) {
        next(err);
    }
}