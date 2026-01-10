import { supabase } from "../../config/supabase.js";

/**
 * Upload file to Supabase Storage + save metadata
 */
export const uploadFile = async (userId, folderId, file) => {
  if (!file) {
    throw new Error("No file uploaded");
  }

  // ✅ FORCE CORRECT MIME TYPE (CRITICAL FOR PDF PREVIEW)
  const detectedMime =
    file.mimetype === "application/pdf" ||
    file.originalname.toLowerCase().endsWith(".pdf")
      ? "application/pdf"
      : file.mimetype;

  const filePath = `${userId}/${folderId ?? "root"}/${Date.now()}_${file.originalname}`;

  // 1️⃣ Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("files")
    .upload(filePath, file.buffer, {
      contentType: detectedMime,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  // 2️⃣ Save metadata in database
  const { data, error } = await supabase
    .from("files")
    .insert({
      name: file.originalname,
      path: filePath,
      size: file.size,
      mime_type: detectedMime,
      user_id: userId,
      folder_id: folderId ?? null,
      is_deleted: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * List files in a folder
 */
export const listFiles = async (userId, folderId) => {
  let query = supabase
    .from("files")
    .select("*")
    .eq("user_id", userId)
    .eq("is_deleted", false);

  if (folderId) {
    query = query.eq("folder_id", folderId);
  } else {
    query = query.is("folder_id", null);
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Generate signed download URL
 */
export const getSignedUrl = async (userId, fileId) => {
  const { data: file, error } = await supabase
    .from("files")
    .select("*")
    .eq("id", fileId)
    .eq("user_id", userId)
    .eq("is_deleted", false)
    .single();

  if (error || !file) {
    throw new Error("Not found");
  }

  const { data, error: urlError } = await supabase.storage
    .from("files")
    .createSignedUrl(file.path, 60); // 60 seconds

  if (urlError) {
    throw new Error(urlError.message);
  }

  return { url: data.signedUrl, file };
};

/**
 * Soft delete file
 */
export const softDeleteFile = async (userId, fileId) => {
  const { data, error } = await supabase
    .from("files")
    .update({ is_deleted: true })
    .eq("id", fileId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
