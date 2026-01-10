import {
  listFiles,
  getSignedUrl,
  softDeleteFile,
  uploadFile,
} from "./file.service.js";
import { success, fail } from "../../utils/response.js";

/**
 * UPLOAD FILE
 */
export const upload = async (req, res, next) => {
  try {
    const folderId = req.body.folderId || null; // UUID or null
    const file = req.file;

    if (!file) {
      return fail(res, "No file uploaded", 400);
    }

    const uploaded = await uploadFile(req.user.id, folderId, file);
    return success(res, { file: uploaded }, 201);
  } catch (err) {
    return next(err);
  }
};

/**
 * LIST FILES IN FOLDER
 */
export const list = async (req, res, next) => {
  try {
    const folderId = req.query.folderId || null; // UUID or null
    const files = await listFiles(req.user.id, folderId);
    return success(res, { files });
  } catch (err) {
    return next(err);
  }
};

/**
 * GET DOWNLOAD LINK
 */
export const downloadLink = async (req, res, next) => {
  try {
    const fileId = req.params.id; // UUID

    const { url, file } = await getSignedUrl(req.user.id, fileId);
    return success(res, { url, file });
  } catch (err) {
    if (err.message === "Forbidden") return fail(res, err.message, 403);
    if (err.message === "Not found") return fail(res, err.message, 404);
    return next(err);
  }
};

/**
 * SOFT DELETE FILE
 */
export const remove = async (req, res, next) => {
  try {
    const fileId = req.params.id; // UUID
    const deleted = await softDeleteFile(req.user.id, fileId);
    return success(res, { file: deleted });
  } catch (err) {
    return next(err);
  }
};
