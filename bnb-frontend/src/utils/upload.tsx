import { supabase } from "../supabaseClient";

export async function uploadImage(file: File) {
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from("property-images")
    .upload(fileName, file);

  if (error) {
    console.error("Upload error:", error);
    throw error;
  }

  const { data: publicUrl } = supabase.storage
    .from("property-images")
    .getPublicUrl(data.path);

  return publicUrl.publicUrl;
}
