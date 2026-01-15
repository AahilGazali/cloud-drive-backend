import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { list, restore, permanentlyDelete } from "./trash.controller.js";

const router = Router();

router.use(authenticate);

// GET /api/trash
router.get("/", list);

// POST /api/trash/restore
router.post("/restore", restore);

// DELETE /api/trash/:id
router.delete("/:id", permanentlyDelete);

export default router;
