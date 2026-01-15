import { listTrash, restoreItem, permanentlyDeleteItem } from "./trash.service.js";
import { success, fail } from "../../utils/response.js";

/**
 * GET /api/trash
 */
export const list = async (req, res, next) => {
  try {
    const items = await listTrash(req.user.id);
    // Return items in a format that combines files and folders
    // Ensure we always return arrays
    return success(res, { 
      files: Array.isArray(items.files) ? items.files : [],
      folders: Array.isArray(items.folders) ? items.folders : []
    });
  } catch (err) {
    console.error("Error in trash list controller:", err);
    return fail(res, err.message || "Failed to load trash items", 500);
  }
};

/**
 * POST /api/trash/restore
 * body: { type: "file" | "folder", id: "<uuid>" }
 */
export const restore = async (req, res, next) => {
  try {
    const { type, id } = req.body;

    if (!type || !id) {
      return fail(res, "type and id are required", 400);
    }

    const restored = await restoreItem(req.user.id, type, id);

    if (!restored) {
      return fail(res, "Not found", 404);
    }

    return success(res, { restored });
  } catch (err) {
    return next(err);
  }
};

/**
 * DELETE /api/trash/:id
 * Permanently delete an item from trash
 * body: { type: "file" | "folder" }
 */
export const permanentlyDelete = async (req, res, next) => {
  try {
    const itemId = req.params.id;
    const { type } = req.body;

    if (!type) {
      return fail(res, "type is required", 400);
    }

    const deleted = await permanentlyDeleteItem(req.user.id, type, itemId);
    return success(res, deleted);
  } catch (err) {
    return next(err);
  }
};
