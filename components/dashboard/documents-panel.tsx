// ============================================================================
// FEATURE: Documents panel — upload + list combined into one client component
// Displays per-document ingestion status with live spinner indicators,
// drag-over visual states, retry flow, and toast notifications.
// ============================================================================

"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/lib/hooks/use-toast";
import {
  UploadCloud,
  Trash2,
  RotateCcw,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Doc = {
  id: string;
  filename: string;
  status: string;
  charCount: number;
  enabled: boolean;
  errorMessage?: string | null;
  createdAt?: string | Date;
};

export function DocumentsPanel({
  chatbotid,
  initialDocuments,
}: {
  chatbotid: string;
  initialDocuments: Doc[];
}) {
  const [documents, setDocuments] = useState<Doc[]>(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Poll while any document is in an active processing pipeline step
  useEffect(() => {
    const stillProcessing = documents.some((d) =>
      ["PENDING", "PARSING", "EMBEDDING", "INGESTING"].includes(d.status)
    );
    if (!stillProcessing) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chatbots/${chatbotid}/documents`);
        if (res.ok) {
          const data = await res.json();
          setDocuments(data.documents);
        }
      } catch {
        // Silently continue polling
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [documents, chatbotid]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const res = await fetch(`/api/chatbots/${chatbotid}/documents`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const err = data.error ?? "Upload failed";
        setUploadError(err);
        toast.error(err);
        return;
      }

      const { document } = await res.json();
      setDocuments((prev) => [document, ...prev]);
      toast.success(`"${files[0].name}" queued for ingestion`);
    } catch {
      setUploadError("Network error occurred during upload.");
      toast.error("Network error during upload");
    } finally {
      setUploading(false);
      setIsDragging(false);
    }
  }

  async function handleDelete(documentid: string, filename: string) {
    if (!confirm(`Are you sure you want to remove "${filename}" from this chatbot's knowledge base?`)) {
      return;
    }

    setDeletingId(documentid);
    try {
      const res = await fetch(`/api/chatbots/${chatbotid}/documents/${documentid}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== documentid));
        toast.success(`"${filename}" removed`);
      } else {
        toast.error("Failed to delete document");
      }
    } catch {
      toast.error("Error deleting document");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRetry(documentid: string) {
    setRetryingId(documentid);
    try {
      const res = await fetch(`/api/chatbots/${chatbotid}/documents/${documentid}/retry`, {
        method: "POST",
      });

      if (res.ok) {
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === documentid ? { ...d, status: "PENDING", errorMessage: null } : d
          )
        );
        toast.success("Ingestion retried");
      } else {
        toast.error("Failed to retry ingestion");
      }
    } catch {
      toast.error("Network error during retry");
    } finally {
      setRetryingId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-medium text-text">
            Knowledge Documents <span className="text-muted font-normal">({documents.length})</span>
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Uploaded files are parsed, chunked, and stored as vector embeddings for semantic retrieval.
          </p>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-all duration-fast",
          isDragging
            ? "border-accent-2 bg-surface-hover/80 scale-[0.99]"
            : "border-line bg-surface hover:border-line-hover hover:bg-surface-hover"
        )}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-hover ring-1 ring-line">
          <UploadCloud size={22} className="text-accent" />
        </div>
        <p className="mt-3 text-sm font-medium text-text">
          {uploading ? "Ingesting document..." : "Click to upload or drag files here"}
        </p>
        <p className="mt-1 text-xs text-muted">
          Supports PDF and TXT documents up to 10MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,application/pdf,text/plain"
          className="hidden"
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {uploadError && (
        <div className="mt-2.5 flex items-center gap-1.5 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          <AlertCircle size={14} className="shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Document List */}
      {documents.length === 0 ? (
        <p className="mt-6 text-center text-xs text-muted">
          No documents uploaded yet. Upload your first document above to train the chatbot.
        </p>
      ) : (
        <div className="mt-6 space-y-2">
          {documents.map((doc) => {
            const isProcessing = ["PENDING", "PARSING", "EMBEDDING", "INGESTING"].includes(
              doc.status
            );
            const isFailed = doc.status === "FAILED" || doc.status === "ERROR";
            const isReady = doc.status === "READY";

            return (
              <div
                key={doc.id}
                className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-hover sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-hover text-muted ring-1 ring-line">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text truncate">{doc.filename}</p>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-muted">
                      <span>
                        {doc.charCount
                          ? `${doc.charCount.toLocaleString()} chars`
                          : isProcessing
                          ? "Parsing & embedding..."
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Indicator & Actions */}
                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  {isProcessing && (
                    <div className="flex items-center gap-1.5 text-xs text-accent">
                      <Spinner size="sm" />
                      <span className="capitalize">{doc.status.toLowerCase()}</span>
                    </div>
                  )}

                  {isReady && (
                    <div className="flex items-center gap-1 text-xs text-emerald-400">
                      <CheckCircle2 size={14} />
                      <span>Indexed</span>
                    </div>
                  )}

                  {isFailed && (
                    <div className="flex items-center gap-1 text-xs text-danger">
                      <AlertCircle size={14} />
                      <span>Failed</span>
                    </div>
                  )}

                  {!isProcessing && !isReady && !isFailed && (
                    <Badge status={doc.status} />
                  )}

                  {isFailed && (
                    <button
                      onClick={() => handleRetry(doc.id)}
                      disabled={retryingId === doc.id}
                      className="flex h-7 w-7 items-center justify-center rounded text-muted transition-colors hover:bg-surface-hover hover:text-accent-2"
                      title="Retry ingestion"
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(doc.id, doc.filename)}
                    disabled={deletingId === doc.id}
                    className="flex h-7 w-7 items-center justify-center rounded text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                    title="Remove document"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {isFailed && doc.errorMessage && (
                  <p className="w-full text-xs text-danger mt-1 sm:hidden">
                    {doc.errorMessage}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}