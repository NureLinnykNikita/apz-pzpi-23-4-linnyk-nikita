import {UserRole} from "../../generated/prisma/enums";

export type CustomJwtPayload = {
    userId: string;
    role: UserRole;
    permissions: string[];
    tokenVersion: number;
}

declare global {
    namespace Express {
        interface Request {
            user?: CustomJwtPayload;
        }
    }
}

export {};