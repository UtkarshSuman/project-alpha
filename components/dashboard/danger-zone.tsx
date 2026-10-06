// ============================================================================
// FEATURE: Chatbot Danger Zone
// Requires typing the chatbot's exact name to confirm cascade deletion.
// ============================================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/hooks/use-toast";
import { AlertTriangle, Trash2 } from "lucide-react";

export function DangerZone({
  chatbotid,
  chatbotName,
}: {
  chatbotid: string;
  chatbotName: string;
}) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function handleDelete() {
    if (confirmText !== chatbotName) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/chatbots/${chatbotid}`, { method: "DELETE" });

      if (res.ok) {
        toast.success(`Chatbot "${chatbotName}" permanently deleted`);
        router.push("/chatbots");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Failed to delete chatbot");
        setDeleting(false);
      }
    } catch {
      toast.error("Network error deleting chatbot");
      setDeleting(false);
    }
  }

  return (
    <div className="rounded-lg border border-danger/30 bg-danger/5 p-6 shadow-elevate-sm">
      <div className="flex items-center gap-2 text-danger">
        <AlertTriangle size={18} />
        <h3 className="font-display text-base font-medium">Danger Zone</h3>
      </div>
      <p className="mt-1 text-xs text-muted leading-relaxed">
        Permanently delete this chatbot along with all associated knowledge documents, vector embeddings,
        scoped API keys, and conversation logs. This action cannot be reversed.
      </p>

      {!isOpen ? (
        <div className="mt-4">
          <Button
            type="button"
            variant="danger"
            onClick={() => setIsOpen(true)}
          >
            <Trash2 size={14} className="mr-1.5" /> Delete Chatbot
          </Button>
        </div>
      ) : (
        <div className="mt-4 max-w-md space-y-3 rounded-md border border-danger/20 bg-surface p-4">
          <p className="text-xs text-text">
            Type <strong className="font-mono text-danger">{chatbotName}</strong> below to confirm deletion:
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={chatbotName}
            className="text-xs font-mono"
            autoFocus
          />
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="danger"
              disabled={confirmText !== chatbotName || deleting}
              loading={deleting}
              onClick={handleDelete}
            >
              Permanently Delete
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsOpen(false);
                setConfirmText("");
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}