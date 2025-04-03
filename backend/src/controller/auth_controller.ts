import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { UserService } from "src/models/user_model";
import { AuthService } from "src/models/auth_model";

export class AuthController {
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            const user = await AuthService.validate(email);

            if (!user) {
                res.status(401).json({ message: "user not found" });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                res.status(401).json({ message: "invalid login information" });
            }

            const tokens = await AuthService.generateToken(user.id);

            const { password: _, ...safeUser } = user;

            const secretary = await UserService.getSecretaryByTcno(user.tc_no);
            if (secretary) {
                safeUser.id = secretary.id;
            }

            res.json({
                message: "Login Successfully!",
                user: safeUser,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            });
        } catch (error) {
            console.error("Giriş hata:", error);
            res.status(500).json({ message: "Sunucu hatası" });
        }
    }

    static async logout(req: Request, res: Response): Promise<void> {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            res.status(400).json({ message: "No token provided" });
        }

        await AuthService.logout(String(token));

        res.json({ message: "Oturum Çıkışınız yapıldı" });
    }
}
