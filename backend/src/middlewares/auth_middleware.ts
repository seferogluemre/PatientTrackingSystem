import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../models/auth_model";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
    }

    const { user } = await verifyToken(String(token)) ?? {};


    if (!user) {
        res.status(401).json({ message: "Invalid or expired token" });
    }

    (req as any).user = user;
    next();
};