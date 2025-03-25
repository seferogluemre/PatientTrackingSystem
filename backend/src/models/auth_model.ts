import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken'

dotenv.config();

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "accessToken";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

export const generateToken = async (userId: number) => {
    const accessToken = jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
    });

    const expiresAt = new Date(Date.now() + 3 * 3600 * 1000);
    expiresAt.setSeconds(0);


    await prisma.session.create({
        data: {
            userId,
            token: accessToken,
            expiresAt,
        },
    });

    return { accessToken, refreshToken };
};

export const verifyToken = async (token: string) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

        const session = await prisma.session.findUnique({
            where: { token: String(token) },
            select: { userId: true, expiresAt: true },
        });

        if (!session || session.expiresAt < new Date()) {
            throw new Error("Session expired or invalid");
        }
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { id: true, first_name: true, last_name: true, email: true, role: true, address: true, phone: true, birthDate: true, joined_at: true, },
        });

        if (!user) {
            throw new Error("User not found");
        }

        return { user: user, decoded: decoded };
    } catch (error) {

        if (error instanceof jwt.TokenExpiredError) {
            console.warn("⚠️ Token expired, requesting refresh...");
            return { error: "TOKEN_EXPIRED" };
        }

        console.error("verifyToken Hatası:", error);
        return null;
    }
};

export const logout = async (token: string) => {
    return await prisma.session.deleteMany({ where: { token } });
};