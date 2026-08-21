import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type ContentLoaderVariant = 'page' | 'cards' | 'table' | 'form'

/**
 * In-shell loading skeleton (use under admin/dashboard layouts — never a second full-screen spinner).
 */
export function ContentLoader({
  message,
  variant = 'page',
  className,
}: {
  message?: string
  variant?: ContentLoaderVariant
  className?: string
}) {
  if (variant === 'table') {
    return (
      <div className={cn('space-y-3 py-2', className)} aria-busy="true" aria-label={message || 'Loading'}>
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="overflow-hidden rounded-lg border border-gray-200">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-0">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="ml-auto h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'form') {
    return (
      <div className={cn('mx-auto max-w-2xl space-y-5 py-6', className)} aria-busy="true" aria-label={message || 'Loading'}>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    )
  }

  if (variant === 'cards') {
    return (
      <div className={cn('space-y-4 py-2', className)} aria-busy="true" aria-label={message || 'Loading'}>
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden border border-gray-200 py-0 shadow-sm">
              <CardHeader className="space-y-2 pb-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3 pb-4">
                <Skeleton className="h-16 w-full rounded-md" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // page (default)
  return (
    <div className={cn('space-y-6 py-2', className)} aria-busy="true" aria-label={message || 'Loading'}>
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 max-w-full" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="border border-gray-200 py-0 shadow-sm">
            <CardHeader className="pb-2">
              <Skeleton className="mb-3 h-20 w-full rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-8 w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ContentLoader
