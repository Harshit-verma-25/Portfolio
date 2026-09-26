import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="mt-3 h-4 w-80" />
      <Skeleton className="mt-8 h-72 w-full rounded-2xl" />
    </div>
  );
}
