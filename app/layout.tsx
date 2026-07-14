// FEATURE: Root layout — loads brand fonts + wraps app in auth SessionProvider
import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "Docent — Turn your docs into a chatbot that knows them cold",
  description:
    "Upload a PDF or text file, get a custom AI chatbot with its own API key. Drop it into your site in minutes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}








// When  ready to go paid services

// Set up Cloudflare R2 (needs card) and OpenAI billing (needs card).
// Fill in the commented-out paid env vars.
// Flip STORAGE_PROVIDER="s3" and EMBEDDINGS_PROVIDER="openai".


// Change schema back to vector(1536), run npx prisma db push.


// Re-upload/re-ingest existing documents — old 384-dim vectors are incompatible with the new column, so delete existing Document rows (cascades to chunks) and re-upload the same files.


//  I can write you a one-off migration script for this when you get there, so you don't lose data unnecessarily.

// npx prisma db push jabardasti kiya tha dusra wala padme issue create kar sakta hai