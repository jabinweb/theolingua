import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DashboardSkeleton() {
  return (
    <div className="min-w-0 bg-theo-white">
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto min-w-0 max-w-6xl px-4 py-5 sm:px-6">
          <Skeleton className="mb-2 h-7 w-48 max-w-full" />
          <Skeleton className="h-4 w-64 max-w-full" />
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-gray-200 px-3 py-2.5">
                <Skeleton className="mb-1 h-3 w-20" />
                <Skeleton className="h-6 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto min-w-0 max-w-6xl px-4 py-5 sm:px-6">
        <Skeleton className="mb-4 h-6 w-40 max-w-full" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="py-0">
              <CardHeader className="pb-2">
                <Skeleton className="mb-3 h-20 w-full rounded-lg" />
                <Skeleton className="h-5 w-3/4 max-w-full" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-14 rounded-lg" />
                  <Skeleton className="h-14 rounded-lg" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-8 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white shadow-sm">
      <div className="container mx-auto flex min-h-14 items-center justify-between gap-3 px-4 sm:px-6">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </header>
  )
}
