import crypto from "crypto";
import { z } from "zod";
import { query } from "../../config/db.js";
import { RESOURCE_TYPE, ROLES } from "../../utils/constants.js";

const shareSchema = z.object({
  resourceType: z.enum([RESOURCE_TYPE.FILE, RESOURCE_TYPE.FOLDER]),
  resourceId: z.union([z.string().uuid(), z.number().int()]), // Accept both UUID strings and integers
  targetUserId: z.number().int(),
  role: z.enum([ROLES.VIEWER, ROLES.EDITOR]),
});

export const shareResource = async (ownerId, payload) => {
  const { resourceType, resourceId, targetUserId, role } = shareSchema.parse(payload);
  const table = resourceType === RESOURCE_TYPE.FILE ? "files" : "folders";
  // Use user_id column (which is the actual column name in the tables)
  // Handle both UUID and integer IDs
  let rows;
  try {
    const result = await query(`SELECT user_id FROM ${table} WHERE id=$1`, [resourceId]);
    rows = result.rows;
  } catch (err) {
    // If direct query fails, try with UUID casting
    try {
      const result = await query(`SELECT user_id FROM ${table} WHERE id::text=$1`, [String(resourceId)]);
      rows = result.rows;
    } catch (uuidErr) {
      throw new Error(`Resource not found: ${err.message}`);
    }
  }
  if (!rows.length) throw new Error("Resource not found");
  if (String(rows[0].user_id) !== String(ownerId)) throw new Error("Forbidden");

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

/**
 * Share resource by email (for users who may not be registered)
 * Creates a public link and sends email notification
 */
export const shareByEmail = async (ownerId, resourceType, resourceId, recipientEmail, role = 'VIEWER') => {
  try {
    // Convert role to lowercase to match ROLES constant
    const normalizedRole = role.toUpperCase() === 'VIEWER' ? ROLES.VIEWER : 
                          role.toUpperCase() === 'EDITOR' ? ROLES.EDITOR : 
                          ROLES.VIEWER;
    
    // First, try to find user by email (check both users table and Supabase auth)
    let targetUserId = null;
    try {
      const { rows: userRows } = await query("SELECT id FROM users WHERE email=$1", [recipientEmail]);
      if (userRows.length > 0) {
        targetUserId = userRows[0].id;
      }
    } catch (userError) {
      console.warn('Could not query users table:', userError.message);
    }
    
    // Verify ownership - handle both UUID and integer IDs
    // Note: Tables use 'user_id' column, not 'owner_id'
    const table = resourceType === RESOURCE_TYPE.FILE ? "files" : "folders";
    let resourceRows;
    const resourceIdStr = String(resourceId);
    
    // Try direct query first (works for both UUIDs and integers)
    // PostgreSQL can handle UUID strings directly, but we'll try both approaches
    try {
      // First try with the resourceId as-is (works for UUIDs)
      const result = await query(`SELECT user_id FROM ${table} WHERE id=$1::uuid`, [resourceIdStr]);
      resourceRows = result.rows;
      
      // If no results and resourceId looks like a number, try without UUID cast
      if (!resourceRows.length && !isNaN(Number(resourceIdStr))) {
        const intResult = await query(`SELECT user_id FROM ${table} WHERE id=$1`, [Number(resourceIdStr)]);
        resourceRows = intResult.rows;
      }
    } catch (queryError) {
      // Check if it's a database connection error
      if (queryError.message && (
        queryError.message.includes('ENOTFOUND') || 
        queryError.message.includes('ECONNREFUSED') || 
        queryError.message.includes('getaddrinfo') ||
        queryError.message.includes('timeout') ||
        queryError.code === 'ENOTFOUND' ||
        queryError.code === 'ECONNREFUSED'
      )) {
        throw new Error(`Database connection failed: Unable to connect to the database. Please check your SUPABASE_DB_URL environment variable in Backend/.env file and ensure your network can reach Supabase.`);
      }
      
      // If direct query fails, try with text casting (for UUID strings)
      try {
        const result = await query(`SELECT user_id FROM ${table} WHERE id::text=$1`, [resourceIdStr]);
        resourceRows = result.rows;
      } catch (uuidError) {
        // Check if it's a database connection error
        if (uuidError.message && (
          uuidError.message.includes('ENOTFOUND') || 
          uuidError.message.includes('ECONNREFUSED') || 
          uuidError.message.includes('getaddrinfo') ||
          uuidError.message.includes('timeout') ||
          uuidError.code === 'ENOTFOUND' ||
          uuidError.code === 'ECONNREFUSED'
        )) {
          throw new Error(`Database connection failed: Unable to connect to the database. Please check your SUPABASE_DB_URL environment variable in Backend/.env file and ensure your network can reach Supabase.`);
        }
        // More specific error message
        throw new Error(`Resource not found: Could not find ${resourceType} with id ${resourceIdStr}. ${queryError.message}`);
      }
    }
    
    if (!resourceRows.length) throw new Error("Resource not found");
    
    // Compare user_id (handle both UUID and integer)
    const ownerIdStr = String(ownerId);
    const resourceOwnerIdStr = String(resourceRows[0].user_id);
    if (resourceOwnerIdStr !== ownerIdStr) {
      throw new Error("Forbidden: You don't have permission to share this resource");
    }
    
    // Create or get existing public link
    let linkToken;
    try {
      const { rows: linkRows } = await query(
        "SELECT token FROM link_shares WHERE resource_type=$1 AND resource_id=$2 AND created_by::text=$3 AND (expires_at IS NULL OR expires_at > NOW()) LIMIT 1",
        [resourceType, resourceId, ownerIdStr]
      );
      
      if (linkRows.length > 0) {
        linkToken = linkRows[0].token;
      } else {
        // Create new public link
        linkToken = crypto.randomBytes(24).toString("hex");
        try {
          await query(
            "INSERT INTO link_shares (token, resource_type, resource_id, expires_at, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING token",
            [linkToken, resourceType, resourceId, null, ownerId]
          );
        } catch (insertError) {
          // Check if it's a database connection error
          if (insertError.message.includes('ENOTFOUND') || insertError.message.includes('ECONNREFUSED') || insertError.message.includes('getaddrinfo')) {
            console.warn('Database connection failed, generating token without database storage');
            // Continue with token generation
          } else if (insertError.message.includes('does not exist') || insertError.message.includes('relation')) {
            console.warn('link_shares table does not exist. Please run migration 003_create_link_shares_table.sql');
            console.warn('Continuing with token generation, but link will not be stored in database.');
          } else {
            throw insertError;
          }
        }
      }
    } catch (linkError) {
      // Check if it's a database connection error
      if (linkError.message.includes('ENOTFOUND') || linkError.message.includes('ECONNREFUSED') || linkError.message.includes('getaddrinfo')) {
        console.warn('Database connection failed, generating token without database storage:', linkError.message);
        linkToken = crypto.randomBytes(24).toString("hex");
      } else if (linkError.message.includes('does not exist') || linkError.message.includes('relation')) {
        console.warn('Error accessing link_shares table:', linkError.message);
        linkToken = crypto.randomBytes(24).toString("hex");
      } else {
        // For other errors, still generate a token but log the error
        console.warn('Error accessing link_shares table:', linkError.message);
        linkToken = crypto.randomBytes(24).toString("hex");
      }
    }
    
    // If user exists, also create a share record
    if (targetUserId) {
      try {
        const upsert = `INSERT INTO shares (resource_type, resource_id, target_user_id, role, created_by)
                        VALUES ($1,$2,$3,$4,$5)
                        ON CONFLICT (resource_type, resource_id, target_user_id)
                        DO UPDATE SET role=$4 RETURNING *`;
        await query(upsert, [resourceType, resourceId, targetUserId, normalizedRole, ownerId]);
      } catch (shareError) {
        console.warn('Failed to create share record:', shareError.message);
        // Continue anyway - we still have the link token
      }
    }
    
    return { linkToken, targetUserId, recipientEmail };
  } catch (error) {
    console.error('Error in shareByEmail:', error);
    throw new Error(`Failed to share by email: ${error.message}`);
  }
};

