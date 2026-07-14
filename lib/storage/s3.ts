// ============================================================================
// FEATURE: File storage (S3-compatible — works with AWS S3 or Cloudflare R2)
// Stores the original uploaded PDF/TXT so it can be re-parsed later if you
// ever change chunking strategy, without asking the customer to re-upload.
// ============================================================================

// ============================================================================
// FEATURE: File storage — PAID TIER implementation (S3-compatible: AWS S3
// or Cloudflare R2). Switch to this once you have a card set up — see
// lib/storage/index.ts for how to flip the switch.
//


// import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

// export const s3 = new S3Client({
//   region: process.env.S3_REGION || "auto",
//   endpoint: process.env.S3_ENDPOINT,
//   credentials: {
//     accessKeyId: process.env.S3_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
//   },
// });

// const BUCKET = process.env.S3_BUCKET_NAME!;

// export async function uploadToStorage(key: string, buffer: Buffer, contentType: string) {
//   await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: contentType }));
//   return key;
// }

// export async function getFromStorage(key: string): Promise<Buffer> {
//   const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
//   const stream = res.Body as AsyncIterable<Uint8Array>;
//   const chunks: Buffer[] = [];
//   for await (const chunk of stream) chunks.push(Buffer.from(chunk));
//   return Buffer.concat(chunks);
// }

// export async function deleteFromStorage(key: string) {
//   await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
// }