import { query } from "../../config/db.js";
import { RESOURCE_TYPE, ROLES } from "../../utils/constants.js";

export const searchByName = async (userId, term) => {
  const like = `%${term}%`;
  const { rows: folders } = await query(
    `SELECT f.*, COALESCE(s.role, 'owner') AS access_role
     FROM folders f
     LEFT JOIN shares s ON s.resource_type=$3 AND s.resource_id=f.id AND s.target_user_id=$1
     WHERE f.is_deleted=false AND f.name ILIKE $2 AND (f.owner_id=$1 OR s.role IN ($4,$5))`,
    [userId, like, RESOURCE_TYPE.FOLDER, ROLES.VIEWER, ROLES.EDITOR]
  );

  const { rows: files } = await query(
    `SELECT f.*, COALESCE(s.role, 'owner') AS access_role
     FROM files f
     LEFT JOIN shares s ON s.resource_type=$3 AND s.resource_id=f.id AND s.target_user_id=$1
     WHERE f.is_deleted=false AND f.name ILIKE $2 AND (f.owner_id=$1 OR s.role IN ($4,$5))`,
    [userId, like, RESOURCE_TYPE.FILE, ROLES.VIEWER, ROLES.EDITOR]
  );

  return { files, folders };
};

