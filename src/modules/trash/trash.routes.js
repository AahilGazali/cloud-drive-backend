import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { list, restore } from "./trash.controller.js";

const router = Router();

router.use(authenticate);

// GET /api/trash
router.get("/", list);

// POST /api/trash/restore  ✅ ADD THIS
router.post("/restore", restore);

export default router;
