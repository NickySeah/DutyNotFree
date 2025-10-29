import { Skeleton } from "@/components/ui/skeleton";

export default function FtaTableSkeleton() {
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

        {/* Table Skeleton - Match actual table structure */}
        <div className="overflow-hidden rounded-md border">
          {/* Table Header */}
          <div className="grid grid-cols-7 gap-4 p-4 border-b bg-muted/50">
            <Skeleton className="h-8 w-48" />                                         {/* FTA Name */}
            <Skeleton className="h-8 w-30" />                                         {/* Party A */}
            <Skeleton className="h-8 w-30" />                                         {/* Party B */}
            <Skeleton className="h-8 w-10" />                                         {/* Applicable */}
            {/* <Skeleton className="h-8 w-10" />                                         Excluded */}
            {/* <Skeleton className="h-8 w-10" />                                         Special */}
            <Skeleton className="h-4 w-22" />                                         {/* EffectiveDate */}
            <Skeleton className="h-8 w-16" />                                         {/* Status */}
            <Skeleton className="h-8 w-12" />                                         {/* See Details */}
            {/* <Skeleton className="h-8 w-12" />                                         Actions */}
          </div>

          {/* Table Rows */}
          <div className="space-y-0">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex space-x-4 p-4 border-b last:border-b-0">
                  <Skeleton className="h-4 w-48"/>                                            {/* FTA Name */}
                  <div className="flex items-center justify-center space-x-2">                {/*Party A*/}
                    <Skeleton className="h-4 w-24" />                                           {/* Name */}
                    <Skeleton className="h-6 w-6 rounded" />                                    {/* Flag */}
                  </div>
                  <div className="flex items-center justify-center space-x-2">                {/*Party B*/}
                    <Skeleton className="h-4 w-24" />                                           {/* Name */}
                    <Skeleton className="h-6 w-6 rounded" />                                    {/* Flag */}
                  </div>
                  <Skeleton className="h-4 w-10 mx-auto"/>                                    {/* Applicable */}
                  {/* <Skeleton className="h-4 w-10 mx-auto"/>                                    Excluded */}
                  {/* <Skeleton className="h-4 w-10 mx-auto"/>                                    Special  */}
                  <Skeleton className="h-4 w-22" />
                  <Skeleton className="h-6 w-16 rounded-full" />                              {/* Status  */}
                  <Skeleton className="h-8 w-12 rounded mx-auto" />                            {/* See Details */}
                  {/* <Skeleton className="h-8 w-12 rounded mx-auto" />                            Actions dropdown */}
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
    </div>
  );
}