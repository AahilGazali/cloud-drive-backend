import { supabase } from "../../config/supabase.js";
import { success, fail } from "../../utils/response.js";

/**
 * CREATE FOLDER
 */
export const createFolder = async (req, res) => {
  try {
    const { name, parentId = null } = req.body;
    const userId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Folder name is required" });
    }

    // Validate parentId if provided
    if (parentId) {
      let parentQuery = supabase
        .from("folders")
        .select("id, user_id")
        .eq("id", parentId)
        .eq("user_id", userId);
      
      // Try to filter by is_deleted, but handle if column doesn't exist
      try {
        parentQuery = parentQuery.eq("is_deleted", false);
      } catch (e) {
        // Column doesn't exist, continue without filter
      }
      
      const { data: parentFolder, error: parentError } = await parentQuery.single();

      if (parentError) {
        // If error is about is_deleted column, retry without it
        if (parentError.message && parentError.message.includes("is_deleted")) {
          const { data: retryParent, error: retryError } = await supabase
            .from("folders")
            .select("id, user_id")
            .eq("id", parentId)
            .eq("user_id", userId)
            .single();
          
          if (retryError || !retryParent) {
            return res.status(400).json({ message: "Parent folder not found or access denied" });
          }
        } else {
          return res.status(400).json({ message: "Parent folder not found or access denied" });
        }
      } else if (!parentFolder) {
        return res.status(400).json({ message: "Parent folder not found or access denied" });
      }
    }

    const { data, error } = await supabase
      .from("folders")
      .insert([
        {
          name: name.trim(),
          user_id: userId,
          parent_id: parentId || null,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

/**
 * LIST FOLDERS
 * ?parentId=null → root folders
 */
export const listFolders = async (req, res) => {
  try {
    const userId = req.user.id;
    const parentId = req.query.parentId;

    // Build query step by step
    let query = supabase
      .from("folders")
      .select("*")
      .eq("user_id", userId);

    // Try to filter by is_deleted, but handle if column doesn't exist
    query = query.eq("is_deleted", false);

    // Handle parentId: "null" string means root folders, undefined/null means root, otherwise use the ID
    if (parentId === "null" || parentId === null || parentId === undefined) {
      query = query.is("parent_id", null);
    } else if (parentId) {
      query = query.eq("parent_id", parentId);
    }

    const { data, error } = await query.order("created_at", { ascending: true });

    if (error) {
      // If error is about is_deleted column, retry without it
      if (error.message && error.message.includes("is_deleted")) {
        console.warn("⚠️ is_deleted column not found. Retrying without filter. Please add the column using the SQL in QUICK_FIX.sql");
        
        // Retry query without is_deleted filter
        let retryQuery = supabase
          .from("folders")
          .select("*")
          .eq("user_id", userId);
        
        if (parentId === "null" || parentId === null || parentId === undefined) {
          retryQuery = retryQuery.is("parent_id", null);
        } else if (parentId) {
          retryQuery = retryQuery.eq("parent_id", parentId);
        }
        
        const { data: retryData, error: retryError } = await retryQuery.order("created_at", { ascending: true });
        
        if (retryError) {
          return res.status(400).json({ 
            message: retryError.message,
            hint: "Please add is_deleted column to folders table. See QUICK_FIX.sql"
          });
        }
        return res.json(retryData || []);
      }
      return res.status(400).json({ message: error.message });
    }

    return res.json(data || []);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

/**
 * SOFT DELETE FOLDER (move to trash)
 */
export const deleteFolder = async (req, res, next) => {
  try {
    const folderId = req.params.id;
    const userId = req.user.id;

    if (!folderId) {
      return fail(res, "Folder ID is required", 400);
    }

    // Soft delete by setting is_deleted to true
    // First check if column exists by trying to update
    const { data, error } = await supabase
      .from("folders")
      .update({ is_deleted: true })
      .eq("id", folderId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      // If error is about missing column, use hard delete instead
      if (error.message && error.message.includes("is_deleted")) {
        console.warn("is_deleted column not found, using hard delete instead");
        const { data: deletedData, error: deleteError } = await supabase
          .from("folders")
          .delete()
          .eq("id", folderId)
          .eq("user_id", userId)
          .select()
          .single();
        
        if (deleteError) {
          return fail(res, deleteError.message, 400);
        }
        
        if (!deletedData) {
          return fail(res, "Folder not found", 404);
        }
        
        return success(res, { folder: deletedData, message: "Folder permanently deleted (is_deleted column not found)" });
      }
      return fail(res, error.message, 400);
    }

    if (!data) {
      return fail(res, "Folder not found", 404);
    }

    return success(res, { folder: data });
  } catch (err) {
    return next(err);
  }
};