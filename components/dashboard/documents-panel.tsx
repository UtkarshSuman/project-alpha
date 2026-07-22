// ============================================================================
// FEATURE: Documents panel — upload + list combined into one client component
// that owns its own state. Fixes a bug where the list never reflected new
// uploads or status changes without a full page reload: the old split
// (DocumentUpload + DocumentList as separate components) meant DocumentList's
// useState never re-synced when router.refresh() passed fresh server props,
// since React doesn't re-run useState() from updated props after mount.
//
// Now: upload optimistically inserts the new doc into state immediately,
// and polling updates it in place — no refresh needed anywhere.
// ============================================================================
"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, Trash2, RotateCcw } from "lucide-react";

type Doc = {
  id: string;
  filename: string;
  status: string;
  charCount: number;
  enabled: boolean;
  errorMessage?: string | null;
};

export function DocumentsPanel({ chatbotid, initialDocuments }: { chatbotid: string; initialDocuments: Doc[] }) {
  const [documents, setDocuments] = useState<Doc[]>(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Poll while anything is still processing ---
  useEffect(() => {
    const stillProcessing = documents.some((d) => ["PENDING", "PARSING", "EMBEDDING"].includes(d.status));
    if (!stillProcessing) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/chatbots/${chatbotid}/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [documents, chatbotid]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", files[0]);

    const res = await fetch(`/api/chatbots/${chatbotid}/documents`, { method: "POST", body: formData });
    setUploading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setUploadError(data.error ?? "Upload failed");
      return;
    }

    // the new doc appears instantly, and the polling effect above will pick
    // up its status changes (PENDING -> PARSING -> EMBEDDING -> READY).
    const { document } = await res.json();
    setDocuments((prev) => [document, ...prev]);
  }

  async function handleDelete(documentid: string) {
    await fetch(`/api/chatbots/${chatbotid}/documents/${documentid}`, { method: "DELETE" });
    setDocuments((prev) => prev.filter((d) => d.id !== documentid));
  }

  async function handleRetry(documentid: string) {
    setRetrying(documentid);
    await fetch(`/api/chatbots/${chatbotid}/documents/${documentid}/retry`, { method: "POST" });
    setDocuments((prev) => prev.map((d) => (d.id === documentid ? { ...d, status: "PENDING", errorMessage: null } : d)));
    setRetrying(null);
  }

  return (
    <div>
      
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-medium">
          Documents <span className="text-muted font-normal">({documents.length})</span>
        </h2>
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line bg-surface p-10 text-center hover:bg-surface-hover"
      >
        <UploadCloud size={28} className="text-accent-2" />
        <p className="mt-3 text-sm text-text">
          {uploading ? "Uploading..." : "Click to upload or drag a PDF/TXT file here"}
        </p>
        <p className="mt-1 text-xs text-muted">Max 10MB</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,application/pdf,text/plain"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {uploadError && <p className="mt-2 text-sm text-red-400">{uploadError}</p>}

      {documents.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No documents uploaded yet.</p>
      ) : (
        <div className="mt-6 space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="rounded-md border border-line bg-surface px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text">{doc.filename}</p>
                  <p className="text-xs text-muted">
                    {doc.charCount ? `${doc.charCount.toLocaleString()} characters` : "Processing..."}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={doc.status} />
                  {doc.status === "FAILED" && (
                    <button
                      onClick={() => handleRetry(doc.id)}
                      disabled={retrying === doc.id}
                      className="text-muted hover:text-accent-2"
                      title="Retry ingestion"
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(doc.id)} className="text-muted hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {doc.status === "FAILED" && doc.errorMessage && (
                <p className="mt-2 text-xs text-red-400">{doc.errorMessage}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}