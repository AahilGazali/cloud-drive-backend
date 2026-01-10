import { success, fail } from "../../utils/response.js";
import {
  createPublicLink,
  listShares,
  resolvePublicLink,
  revokeShare,
  shareResource,
} from "./share.service.js";

export const share = async (req, res, next) => {
  try {
    const shareRecord = await shareResource(req.user.id, req.body);
    return success(res, { share: shareRecord }, 201);
  } catch (err) {
    if (err.message === "Forbidden") return fail(res, err.message, 403);
    return next(err);
  }
};

export const list = async (req, res, next) => {
  try {
    const { resourceType, resourceId } = req.query;
    const shares = await listShares(req.user.id, resourceType, Number(resourceId));
    return success(res, { shares });
  } catch (err) {
    return next(err);
  }
};

export const revoke = async (req, res, next) => {
  try {
    const { resourceType, resourceId, targetUserId } = req.body;
    const revoked = await revokeShare(
      req.user.id,
      resourceType,
      Number(resourceId),
      Number(targetUserId)
    );
    return success(res, { share: revoked });
  } catch (err) {
    return next(err);
  }
};

export const createLink = async (req, res, next) => {
  try {
    const { resourceType, resourceId, expiresAt } = req.body;
    const link = await createPublicLink(
      req.user.id,
      resourceType,
      Number(resourceId),
      expiresAt ? new Date(expiresAt) : null
    );
    return success(res, { link: { token: link.token, expiresAt: link.expires_at } });
  } catch (err) {
    return next(err);
  }
};

export const accessLink = async (req, res, next) => {
  try {
    const link = await resolvePublicLink(req.params.token);
    if (!link) return fail(res, "Link expired or invalid", 404);
    return success(res, { link });
  } catch (err) {
    return next(err);
  }
};

