import { supabase } from "../../config/supabase.js";

/**
 * List trashed files & folders
 */
export const listTrash = async (userId) => {
  // 🗂️ Trashed files
  const { data: files, error: fileError } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", userId)
    .eq("is_deleted", true)
    .order("created_at", { ascending: false });

  if (fileError) throw new Error(fileError.message);

  // 📁 Trashed folders
  const { data: folders, error: folderError } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", userId)
    .eq("is_deleted", true)
    .order("created_at", { ascending: false });

  if (folderError) throw new Error(folderError.message);

  return { files, folders };
};

/**
 * Restore file or folder
 */
export const restoreItem = async (userId, type, id) => {
  const table = type === "file" ? "files" : "folders";

  const { data, error } = await supabase
    .from(table)
    .update({ is_deleted: false })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};
