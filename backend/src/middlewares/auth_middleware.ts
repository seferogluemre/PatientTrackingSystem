import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../models/auth_model";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { user } = await verifyToken(token) ?? {};


    if (!user) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }

    (req as any).user = user;
    next();
};