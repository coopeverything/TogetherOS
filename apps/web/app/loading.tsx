import { Skeleton, SkeletonCard } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-4">
      <div className="space-y-3">
        {/* Header skeleton */}
        <div>
          <Skeleton variant="text" width="40%" height={40} className="mb-4" />
          <Skeleton variant="text" width="60%" lines={2} />
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard hasAvatar lines={4} />
          <SkeletonCard hasAvatar lines={4} />
          <SkeletonCard hasAvatar lines={4} />
        </div>
      </div>
    </div>
  )
}
