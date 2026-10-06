// FEATURE: Loading skeleton for chatbot playground tab
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatbotPlaygroundLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="flex gap-4 border-b border-line pb-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-6 w-24" />
        ))}
      </div>
      <Skeleton className="h-[620px] w-full rounded-2xl" />
    </div>
  );
}
