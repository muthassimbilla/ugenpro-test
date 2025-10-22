export default function Loading() {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header Section Skeleton */}
      <div className="glass-card p-3 lg:p-4 rounded-2xl animate-pulse">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="h-8 bg-muted rounded-lg w-64 mb-2"></div>
            <div className="h-4 bg-muted rounded w-96"></div>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-3 w-3 bg-muted rounded-full"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:gap-3">
            <div className="h-8 bg-muted rounded w-24"></div>
            <div className="h-8 bg-muted rounded w-20"></div>
            <div className="h-8 bg-muted rounded w-20"></div>
            <div className="h-8 bg-muted rounded w-24"></div>
          </div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-card p-4 lg:p-6 rounded-2xl animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-6 bg-muted rounded w-12 mb-2"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-muted"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="glass-card p-4 lg:p-6 rounded-2xl animate-pulse">
        <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
          <div className="flex-1 h-10 bg-muted rounded-lg"></div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded w-32"></div>
          </div>
        </div>
      </div>

      {/* Users Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-card p-4 lg:p-6 rounded-2xl animate-pulse">
            <div className="flex items-start justify-between mb-3 lg:mb-4">
              <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-muted flex-shrink-0"></div>
                <div className="min-w-0 flex-1">
                  <div className="h-4 bg-muted rounded w-32 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
              </div>
              <div className="h-6 bg-muted rounded w-16 flex-shrink-0"></div>
            </div>

            <div className="space-y-1 lg:space-y-2 mb-3 lg:mb-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  <div className="w-3 h-3 lg:w-4 lg:h-4 bg-muted rounded flex-shrink-0"></div>
                  <div className="h-3 bg-muted rounded flex-1"></div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 bg-muted rounded flex-1"></div>
                <div className="h-8 bg-muted rounded flex-1"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 bg-muted rounded w-10"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
