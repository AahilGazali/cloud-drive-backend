import { Router } from "express";
import { getProfile, getUsers } from "./user.controller.js";
import { authenticate, requireRole } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/me", authenticate, getProfile);
router.get("/", authenticate, requireRole(["admin"]), getUsers);

export default router;

