import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import {
  createFolder,
  listFolders,
  // renameFolder,   // optional (skip for now)
  // deleteFolder,   // optional (skip for now)
} from "./folder.controller.js";

const router = Router();

/**
 * CREATE folder
 * POST /api/folders
 * Body:
 *  - name (string)
 *  - parentId (uuid | optional)
 */
router.post("/", authenticate, createFolder);

/**
 * LIST folders
 * GET /api/folders
 * Query:
 *  - parentId (uuid | optional)
 */
router.get("/", authenticate, listFolders);

/**
 * (OPTIONAL – can add later)
 * Rename folder
 */
// router.patch("/:id", authenticate, renameFolder);

/**
 * (OPTIONAL – can add later)
 * Soft delete folder
 */
// router.delete("/:id", authenticate, deleteFolder);

export default router;
