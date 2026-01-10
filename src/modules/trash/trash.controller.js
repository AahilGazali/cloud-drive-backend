import { listTrash, restoreItem } from "./trash.service.js";
import { success, fail } from "../../utils/response.js";

/**
 * GET /api/trash
 */
export const list = async (req, res, next) => {
  try {
    const items = await listTrash(req.user.id);
    return success(res, items);
  } catch (err) {
    return next(err);
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
