import crypto from "crypto";
import { z } from "zod";
import { query } from "../../config/db.js";
import { RESOURCE_TYPE, ROLES } from "../../utils/constants.js";

const shareSchema = z.object({
  resourceType: z.enum([RESOURCE_TYPE.FILE, RESOURCE_TYPE.FOLDER]),
  resourceId: z.number().int(),
  targetUserId: z.number().int(),
  role: z.enum([ROLES.VIEWER, ROLES.EDITOR]),
});

export const shareResource = async (ownerId, payload) => {
  const { resourceType, resourceId, targetUserId, role } = shareSchema.parse(payload);
  const table = resourceType === RESOURCE_TYPE.FILE ? "files" : "folders";
  const { rows } = await query(`SELECT owner_id FROM ${table} WHERE id=$1`, [resourceId]);
  if (!rows.length) throw new Error("Resource not found");
  if (rows[0].owner_id !== ownerId) throw new Error("Forbidden");

  const upsert = `INSERT INTO shares (resource_type, resource_id, target_user_id, role, created_by)
                  VALUES ($1,$2,$3,$4,$5)
                  ON CONFLICT (resource_type, resource_id, target_user_id)
                  DO UPDATE SET role=$4 RETURNING *`;
  const result = await query(upsert, [resourceType, resourceId, targetUserId, role, ownerId]);
  return result.rows[0];
};

export const listShares = async (ownerId, resourceType, resourceId) => {
  const { rows } = await query(
    "SELECT * FROM shares WHERE resource_type=$1 AND resource_id=$2 AND created_by=$3",
    [resourceType, resourceId, ownerId]
  );
  return rows;
};

export const revokeShare = async (ownerId, resourceType, resourceId, targetUserId) => {
  const { rows } = await query(
    "DELETE FROM shares WHERE resource_type=$1 AND resource_id=$2 AND target_user_id=$3 AND created_by=$4 RETURNING *",
    [resourceType, resourceId, targetUserId, ownerId]
  );
  if (!rows.length) throw new Error("Not found");
  return rows[0];
};

export const createPublicLink = async (ownerId, resourceType, resourceId, expiresAt) => {
  const token = crypto.randomBytes(24).toString("hex");
  const insert =
    "INSERT INTO link_shares (token, resource_type, resource_id, expires_at, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING *";
  const { rows } = await query(insert, [token, resourceType, resourceId, expiresAt, ownerId]);
  return rows[0];
};

export const resolvePublicLink = async (token) => {
  const { rows } = await query(
    "SELECT * FROM link_shares WHERE token=$1 AND (expires_at IS NULL OR expires_at > NOW())",
    [token]
  );
  return rows[0];
};

