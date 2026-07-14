// ============================================================================
// FEATURE: File storage — FREE TIER implementation using Supabase Storage
// Uses the same Supabase project you already created for the database.
// 1GB free, no card required. Bucket must be created once (see setup steps).
// ============================================================================

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "document-alpha";

export async function uploadToStorage(key: string, buffer: Buffer, contentType: string) {
  const { error } = await supabase.storage.from(BUCKET).upload(key, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`);
  return key;
}

export async function getFromStorage(key: string): Promise<Buffer> {
  const { data, error } = await supabase.storage.from(BUCKET).download(key);
  if (error) throw new Error(`Supabase Storage download failed: ${error.message}`);
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function deleteFromStorage(key: string) {
  const { error } = await supabase.storage.from(BUCKET).remove([key]);
  if (error) throw new Error(`Supabase Storage delete failed: ${error.message}`);
}