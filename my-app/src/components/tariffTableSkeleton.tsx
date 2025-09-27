import { Skeleton } from "@/components/ui/skeleton";

export default function TariffTableSkeleton() {
  return (
    <div>
      {/* Header Section Skeleton */}
      <div className="p-8 mx-auto text-center">
        <Skeleton className="h-8 w-64 mx-auto mb-2" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>

      {/* Data Table Container */}
      <div className="container mx-auto p-5">
        {/* Search and Button Section */}
        <div className="flex items-center py-4 justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-10 w-16" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Table Skeleton */}
        <div className="overflow-hidden rounded-md border">
          {/* Table Header */}
          <div className="border-b bg-muted/50 p-4">
            <div className="flex space-x-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>

          {/* Table Rows */}
          <div className="space-y-0">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex space-x-4 p-4 border-b last:border-b-0">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-8 rounded" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-8 rounded" />
                </div>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between px-2 py-4">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>

      {/* Bottom Section Skeleton */}
      <div className="p-8 mx-auto text-center">
        <Skeleton className="h-8 w-80 mx-auto mb-2" />
        <Skeleton className="h-6 w-96 mx-auto mb-4" />
        <Skeleton className="h-10 w-32 mx-auto" />
      </div>
    </div>
  );
}