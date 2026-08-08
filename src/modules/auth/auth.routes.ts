import { Router } from "express";
import { getMe, login, logout } from "../auth/auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.post("/logout", authMiddleware, logout);

export default router;
