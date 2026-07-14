// Why Inngest instead of a raw queue library: parsing a PDF and calling the embeddings API can take several seconds — doing that inline in the upload request would time out on serverless (Vercel) and block your UI. Inngest lets the upload route return in ~200ms while the actual parse/chunk/embed work happens as durable background steps (each step retries independently on failure, unlike a single long function).



// FEATURE: Inngest serve handler — this is the endpoint Inngest calls back
// into to actually execute your functions' steps.
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { ingestDocument } from "@/lib/inngest/functions/ingest-document";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [ingestDocument],
});