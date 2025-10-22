export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header Skeleton */}
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded-lg w-64 mb-2"></div>
        <div className="h-4 bg-muted rounded w-96"></div>
      </div>

      {/* Search Form Skeleton */}
      <div className="glass-card p-6 rounded-2xl animate-pulse">
        <div className="space-y-4">
          <div>
            <div className="h-6 bg-muted rounded w-48 mb-2"></div>
            <div className="h-4 bg-muted rounded w-64"></div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-16 mb-2"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
            <div className="flex items-end">
              <div className="h-10 w-24 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* User Info Card Skeleton */}
      <div className="glass-card p-6 rounded-2xl animate-pulse">
        <div className="h-6 bg-muted rounded w-40 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-muted rounded w-20 mb-2"></div>
              <div className="h-5 bg-muted rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Sessions Summary Skeleton */}
      <div className="glass-card p-6 rounded-2xl animate-pulse">
        <div className="h-6 bg-muted rounded w-40 mb-4"></div>
        <div className="h-8 bg-muted rounded w-48"></div>
      </div>

      {/* Session Details Skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded w-40 animate-pulse"></div>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl animate-pulse">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded w-32"></div>
              <div className="h-6 bg-muted rounded w-16"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j}>
                    <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                    <div className="h-16 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j}>
                    <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                    <div className="h-5 bg-muted rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
