import { supabase } from "../../config/supabase.js";

/**
 * CREATE FOLDER
 */
export const createFolder = async (req, res) => {
  const { name, parentId = null } = req.body;
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({ message: "Folder name is required" });
  }

  const { data, error } = await supabase
    .from("folders")
    .insert([
      {
        name,
        user_id: userId,
        parent_id: parentId,
      },
    ])
    .select()
    .single();

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(201).json(data);
};

/**
 * LIST FOLDERS
 * ?parentId=null → root folders
 */
export const listFolders = async (req, res) => {
  const userId = req.user.id;
  const parentId = req.query.parentId ?? null;

  let query = supabase
    .from("folders")
    .select("*")
    .eq("user_id", userId);

  if (parentId === "null") {
    query = query.is("parent_id", null);
  } else if (parentId) {
    query = query.eq("parent_id", parentId);
  }

  const { data, error } = await query.order("created_at", { ascending: true });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  return res.json(data);
};
