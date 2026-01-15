import { supabase } from "../../config/supabase.js";

/**
 * List trashed files & folders
 */
export const listTrash = async (userId) => {
  try {
    // 🗂️ Trashed files
    const { data: files, error: fileError } = await supabase
      .from("files")
      .select("*")
      .eq("user_id", userId)
      .eq("is_deleted", true)
      .order("created_at", { ascending: false });

    if (fileError) {
      // If error is about missing column, return empty array
      if (fileError.message && fileError.message.includes("is_deleted")) {
        console.warn("is_deleted column not found in files table. Please run the migration SQL.");
        return { files: [], folders: [] };
      }
      console.error("Error fetching trashed files:", fileError);
      throw new Error(fileError.message || "Failed to fetch trashed files");
    }

    // 📁 Trashed folders
    const { data: folders, error: folderError } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", userId)
      .eq("is_deleted", true)
      .order("created_at", { ascending: false });

    if (folderError) {
      // If error is about missing column, return empty arrays
      if (folderError.message && folderError.message.includes("is_deleted")) {
        console.warn("is_deleted column not found in folders table. Please run the migration SQL.");
        return { files: Array.isArray(files) ? files : [], folders: [] };
      }
      console.error("Error fetching trashed folders:", folderError);
      throw new Error(folderError.message || "Failed to fetch trashed folders");
    }

    // Ensure we always return arrays
    return { 
      files: Array.isArray(files) ? files : [], 
      folders: Array.isArray(folders) ? folders : [] 
    };
  } catch (err) {
    console.error("listTrash error:", err);
    // If it's a column error, return empty arrays instead of failing
    if (err.message && err.message.includes("is_deleted")) {
      return { files: [], folders: [] };
    }
    throw err;
  }
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

/**
 * Permanently delete file or folder
 */
export const permanentlyDeleteItem = async (userId, type, id) => {
  const table = type === "file" ? "files" : "folders";

  // First verify it's in trash
  const { data: item, error: checkError } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .eq("is_deleted", true)
    .single();

  if (checkError || !item) {
    throw new Error("Item not found in trash");
  }

  // If it's a file, delete from storage first
  if (type === "file" && item.path) {
    const { error: storageError } = await supabase.storage
      .from("files")
      .remove([item.path]);
    
    if (storageError) {
      // Log but don't fail - file might already be deleted
      console.warn("Storage deletion warning:", storageError.message);
    }
  }

  // Permanently delete from database
  const { error } = await supabase
    .from(table)
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return { deleted: true };
};