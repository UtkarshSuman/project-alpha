// FEATURE: Document list — now with retry action + error message for
// FAILED documents, and 
// live status polling — while any document is
// still PENDING/PARSING/EMBEDDING, poll every 3s so the badge updates to
// READY automatically without a manual refresh
// "use client";

// import { useEffect, useState } from "react";
// import { Badge } from "@/components/ui/badge";
// import { Trash2, RotateCcw } from "lucide-react";

// type Doc = {
//   id: string;
//   filename: string;
//   status: string;
//   charCount: number;
//   enabled: boolean;
//   errorMessage?: string | null;
// };

// export function DocumentList({ chatbotid, initialDocuments }: { chatbotid: string; initialDocuments: Doc[] }) {
//   const [documents, setDocuments] = useState(initialDocuments);
//   const [retrying, setRetrying] = useState<string | null>(null);

//   useEffect(() => {
//     const stillProcessing = documents.some((d) => ["PENDING", "PARSING", "EMBEDDING"].includes(d.status));
//     if (!stillProcessing) return;

//     const interval = setInterval(async () => {
//       const res = await fetch(`/api/chatbots/${chatbotid}/documents`);
//       if (res.ok) {
//         const data = await res.json();
//         setDocuments(data.documents);
//       }
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [documents, chatbotid]);

//   async function handleDelete(documentid: string) {
//     await fetch(`/api/chatbots/${chatbotid}/documents/${documentid}`, { method: "DELETE" });
//     setDocuments((prev) => prev.filter((d) => d.id !== documentid));
//   }

//   async function handleRetry(documentid: string) {
//     setRetrying(documentid);
//     await fetch(`/api/chatbots/${chatbotid}/documents/${documentid}/retry`, { method: "POST" });
//     setDocuments((prev) => prev.map((d) => (d.id === documentid ? { ...d, status: "PENDING", errorMessage: null } : d)));
//     setRetrying(null);
//   }

//   if (documents.length === 0) {
//     return <p className="mt-6 text-sm text-muted">No documents uploaded yet.</p>;
//   }

//   return (
//     <div className="mt-6 space-y-2">
//       {documents.map((doc) => (
//         <div key={doc.id} className="rounded-md border border-line bg-surface px-4 py-3">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-text">{doc.filename}</p>
//               <p className="text-xs text-muted">
//                 {doc.charCount ? `${doc.charCount.toLocaleString()} characters` : "Processing..."}
//               </p>
//             </div>
//             <div className="flex items-center gap-3">
//               <Badge status={doc.status} />
//               {doc.status === "FAILED" && (
//                 <button
//                   onClick={() => handleRetry(doc.id)}
//                   disabled={retrying === doc.id}
//                   className="text-muted hover:text-accent-2"
//                   title="Retry ingestion"
//                 >
//                   <RotateCcw size={16} />
//                 </button>
//               )}
//               <button onClick={() => handleDelete(doc.id)} className="text-muted hover:text-red-400">
//                 <Trash2 size={16} />
//               </button>
//             </div>
//           </div>
//           {doc.status === "FAILED" && doc.errorMessage && (
//             <p className="mt-2 text-xs text-red-400">{doc.errorMessage}</p>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }