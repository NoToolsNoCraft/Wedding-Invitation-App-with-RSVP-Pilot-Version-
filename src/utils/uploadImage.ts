import supabase from './supabase';

const BUCKET_ID = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET_ID || 'background-images';

/**
 * Upload a hero image file to Supabase Storage and return the public URL.
 */
export async function uploadHeroImage(file: File): Promise<string> {
  // Generate a unique filename: timestamp + sanitized original name
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `hero/${Date.now()}_${sanitizedName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_ID)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_ID)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}
