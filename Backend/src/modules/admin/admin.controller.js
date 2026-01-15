import { supabase } from "../../config/supabase.js";
import { success, fail } from "../../utils/response.js";

/**
 * Setup database - Add missing columns
 * This is a one-time setup endpoint
 */
export const setupDatabase = async (req, res) => {
  try {
    console.log("Setting up database columns...");

    // Add is_deleted to folders
    const { error: foldersError } = await supabase.rpc("exec_sql", {
      sql: `
        ALTER TABLE public.folders 
        ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL;
      `,
    });

    if (foldersError) {
      // Try alternative approach using direct query
      const { error: altError } = await supabase
        .from("folders")
        .select("is_deleted")
        .limit(1);

      if (altError && altError.message.includes("does not exist")) {
        // Column doesn't exist, we need to use raw SQL
        // Since Supabase client doesn't support ALTER TABLE directly,
        // we'll return instructions
        return res.status(400).json({
          message:
            "Please run this SQL in Supabase SQL Editor:\n\n" +
            "ALTER TABLE public.folders ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL;\n" +
            "ALTER TABLE public.files ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL;",
          sql: [
            "ALTER TABLE public.folders ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL;",
            "ALTER TABLE public.files ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL;",
          ],
        });
      }
    }

    // Add is_deleted to files
    const { error: filesError } = await supabase.rpc("exec_sql", {
      sql: `
        ALTER TABLE public.files 
        ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL;
      `,
    });

    return success(res, {
      message: "Database setup completed successfully",
      folders: foldersError ? "Failed" : "Success",
      files: filesError ? "Failed" : "Success",
    });
  } catch (err) {
    return fail(res, err.message || "Setup failed", 500);
  }
};
