import {PermissionCode} from "../types/permissions.js";
import {Request, Response, NextFunction} from "express";

export const requirePermission =
    (permission: PermissionCode) =>
        (req: Request, res: Response, next: NextFunction) => {
            const user = req.user;

            if (!user) {
                return res.status(401).json({
                    message: "Access denied. No user token provided."
                });
            }

            const tokenPermissions = user.permissions;

            if (!tokenPermissions.includes(permission)) {
                return res.status(403).json({
                    message: "Access denied. Insufficient permissions."
                })
            }

            next();
        }