import {NextFunction, Request, type Response} from 'express'
import {z} from "zod";

export const validate = (schema: z.ZodType) => (
    req: Request, res: Response, next: NextFunction
) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            message: "Validation error",
            errors: parsed.error.flatten()
        })
    }

    req.body = parsed.data;
    next();
}