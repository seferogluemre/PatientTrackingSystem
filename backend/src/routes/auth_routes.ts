import { Router } from "express";
import { login, logoutUser } from "../controller/auth_controller";
import { authMiddleware } from "../middlewares/auth_middleware";

const router = Router();


router.post("/login", login);
router.post("/logout", authMiddleware, logoutUser);

export default router;