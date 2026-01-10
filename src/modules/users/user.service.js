import { query } from "../../config/db.js";

export const getUserById = async (id) => {
  const { rows } = await query("SELECT id, email, role, created_at FROM users WHERE id=$1", [id]);
  return rows[0];
};

export const listUsers = async () => {
  const { rows } = await query("SELECT id, email, role FROM users ORDER BY created_at DESC");
  return rows;
};

