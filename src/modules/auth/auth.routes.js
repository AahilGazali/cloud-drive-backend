import { Router } from "express";
import { signup, login, me } from "./auth.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);

// 🔴 THIS ROUTE WAS MISSING / WRONG
router.get("/me", authenticate, me);

export default router;
