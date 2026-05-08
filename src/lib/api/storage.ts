import { supabase } from "../supabase";

/**
 * Uploads a file to a Supabase storage bucket
 * @param file The file object from an input element
 * @param bucket The name of the bucket (defaults to 'product-assets')
 * @returns The public URL of the uploaded file
 */
export async function uploadImage(file: File, bucket: string = "product-assets"): Promise<string> {
  // 1. Generate a unique file name
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  // 2. Upload the file to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error("Storage upload error:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // 3. Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Deletes a file from Supabase storage
 * @param url The public URL or storage path of the file
 * @param bucket The name of the bucket
 */
export async function deleteImage(url: string, bucket: string = "product-assets"): Promise<void> {
  // Extract path from URL if it's a full URL
  const path = url.split(`${bucket}/`).pop();
  
  if (!path) return;

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error("Storage delete error:", error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}
