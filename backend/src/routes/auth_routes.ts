import { Router } from "express";
import { authMiddleware } from "../middlewares/auth_middleware";
import { AuthController } from "src/controller/auth_controller";

const router = Router();


router.post("/login", AuthController.login);
router.post("/logout", authMiddleware, AuthController.logout);

export default router;