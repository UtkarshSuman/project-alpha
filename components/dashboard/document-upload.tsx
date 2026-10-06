// FEATURE: Drag-and-drop / click-to-upload document uploader
// "use client";

// import { useRef, useState } from "react";
// import { useRouter } from "next/navigation";
// import { UploadCloud } from "lucide-react";

// export function DocumentUpload({ chatbotid }: { chatbotid: string }) {
//   const router = useRouter();
//   const inputRef = useRef<HTMLInputElement>(null);
//   const [uploading, setUploading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   async function handleFiles(files: FileList | null) {
//     if (!files || files.length === 0) return;
//     setError(null);
//     setUploading(true);

//     const formData = new FormData();
//     formData.append("file", files[0]);

//     const res = await fetch(`/api/chatbots/${chatbotid}/documents`, {
//       method: "POST",
//       body: formData,
//     });

//     setUploading(false);

//     if (!res.ok) {
//       const data = await res.json().catch(() => ({}));
//       setError(data.error ?? "Upload failed");
//       return;
//     }

//     router.refresh();
//   }

//   return (
//     <div>
//       <div
//         onClick={() => inputRef.current?.click()}
//         onDragOver={(e) => e.preventDefault()}
//         onDrop={(e) => {
//           e.preventDefault();
//           handleFiles(e.dataTransfer.files);
//         }}
//         className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line bg-surface p-10 text-center hover:bg-surface-hover"
//       >
//         <UploadCloud size={28} className="text-accent-2" />
//         <p className="mt-3 text-sm text-text">
//           {uploading ? "Uploading..." : "Click to upload or drag a PDF/TXT file here"}
//         </p>
//         <p className="mt-1 text-xs text-muted">Max 10MB</p>
//         <input
//           ref={inputRef}
//           type="file"
//           accept=".pdf,.txt,application/pdf,text/plain"
//           className="hidden"
//           onChange={(e) => handleFiles(e.target.files)}
//         />
//       </div>
//       {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
//     </div>
//   );
// }