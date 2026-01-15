import { z } from "zod";
import { query } from "../../config/db.js";
import { ROLES } from "../../utils/constants.js";

const folderSchema = z.object({
  name: z.string().min(1),
  parentId: z.number().int().nullable().optional(),
});

const moveSchema = z.object({
  folderId: z.number().int(),
  newParentId: z.number().int().nullable(),
});

export const createFolder = async (userId, payload) => {
  const { name, parentId = null } = folderSchema.parse(payload);

  if (parentId) {
    const { rows: parentRows } = await query(
      "SELECT id, user_id FROM folders WHERE id=$1 AND is_deleted=false",
      [parentId]
    );
    if (!parentRows.length) throw new Error("Parent folder not found");
    if (parentRows[0].user_id !== userId) throw new Error("Forbidden");
  }

  const insert =
    "INSERT INTO folders (name, parent_id, user_id) VALUES ($1,$2,$3) RETURNING *";
  const { rows } = await query(insert, [name, parentId, userId]);
  return rows[0];
};

export const getFolderById = async (folderId) => {
  const { rows } = await query("SELECT * FROM folders WHERE id=$1", [folderId]);
  return rows[0];
};

export const listChildren = async (userId, folderId = null) => {
  const { rows } = await query(
    `SELECT f.*, COALESCE(s.role, 'owner') AS access_role
     FROM folders f
     LEFT JOIN shares s ON s.resource_type='folder' AND s.resource_id=f.id AND s.target_user_id=$1
     WHERE f.parent_id ${folderId ? "= $2" : "IS NULL"} AND f.is_deleted=false AND (f.user_id=$1 OR s.role IN ($3,$4))`,
    folderId
      ? [userId, folderId, ROLES.VIEWER, ROLES.EDITOR]
      : [userId, ROLES.VIEWER, ROLES.EDITOR]
  );
  return rows;
};

export const renameFolder = async (userId, folderId, name) => {
  if (!name) throw new Error("Name required");
  const { rows } = await query(
    "UPDATE folders SET name=$1 WHERE id=$2 AND user_id=$3 RETURNING *",
    [name, folderId, userId]
  );
  if (!rows.length) throw new Error("Not found or forbidden");
  return rows[0];
};

export const moveFolder = async (userId, payload) => {
  const { folderId, newParentId } = moveSchema.parse(payload);
  if (folderId === newParentId) throw new Error("Invalid move");

  // prevent circular reference by ensuring new parent not child of folder
  if (newParentId) {
    let current = newParentId;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { rows } = await query("SELECT parent_id FROM folders WHERE id=$1", [current]);
      if (!rows.length) break;
      const parent = rows[0].parent_id;
      if (parent === folderId) throw new Error("Circular move not allowed");
      if (!parent) break;
      current = parent;
    }
  }

  const { rows } = await query(
    "UPDATE folders SET parent_id=$1 WHERE id=$2 AND user_id=$3 RETURNING *",
    [newParentId, folderId, userId]
  );
  if (!rows.length) throw new Error("Not found or forbidden");
  return rows[0];
};

export const softDeleteFolder = async (userId, folderId) => {
  const { rows } = await query(
    "UPDATE folders SET is_deleted=true, deleted_at=NOW() WHERE id=$1 AND user_id=$2 RETURNING *",
    [folderId, userId]
  );
  if (!rows.length) throw new Error("Not found or forbidden");
  return rows[0];
};

