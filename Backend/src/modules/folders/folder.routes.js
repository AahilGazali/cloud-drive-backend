import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import {
  createFolder,
  listFolders,
  deleteFolder,
  // renameFolder,   // optional (skip for now)
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
 * DELETE folder (soft delete - move to trash)
 * DELETE /api/folders/:id
 */
router.delete("/:id", authenticate, deleteFolder);

/**
 * (OPTIONAL – can add later)
 * Rename folder
 */
// router.patch("/:id", authenticate, renameFolder);

export default router;
