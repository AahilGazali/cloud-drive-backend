import { supabase } from "../../config/supabase.js";

export const searchByName = async (userId, term) => {
  if (!term || term.trim() === '') {
    return { files: [], folders: [] };
  }

  const searchTerm = term.trim();

  try {
    // Search folders
    let foldersQuery = supabase
      .from("folders")
      .select("*")
      .eq("user_id", userId)
      .eq("is_deleted", false)
      .ilike("name", `%${searchTerm}%`);

    const { data: folders, error: foldersError } = await foldersQuery;

    if (foldersError) {
      // If is_deleted column doesn't exist, retry without it
      if (foldersError.message && foldersError.message.includes("is_deleted")) {
        const { data: retryFolders, error: retryError } = await supabase
          .from("folders")
          .select("*")
          .eq("user_id", userId)
          .ilike("name", `%${searchTerm}%`);

        if (retryError) {
          console.error("Error searching folders:", retryError);
          return { files: [], folders: [] };
        }
        return { files: [], folders: retryFolders || [] };
      }
      console.error("Error searching folders:", foldersError);
      return { files: [], folders: [] };
    }

    // Search files
    let filesQuery = supabase
      .from("files")
      .select("*")
      .eq("user_id", userId)
      .eq("is_deleted", false)
      .ilike("name", `%${searchTerm}%`);

    const { data: files, error: filesError } = await filesQuery;

    if (filesError) {
      // If is_deleted column doesn't exist, retry without it
      if (filesError.message && filesError.message.includes("is_deleted")) {
        const { data: retryFiles, error: retryError } = await supabase
          .from("files")
          .select("*")
          .eq("user_id", userId)
          .ilike("name", `%${searchTerm}%`);

        if (retryError) {
          console.error("Error searching files:", retryError);
          return { files: [], folders: folders || [] };
        }
        return { files: retryFiles || [], folders: folders || [] };
      }
      console.error("Error searching files:", filesError);
      return { files: [], folders: folders || [] };
    }

    return {
      files: files || [],
      folders: folders || []
    };
  } catch (err) {
    console.error("Search error:", err);
    return { files: [], folders: [] };
  }
};

