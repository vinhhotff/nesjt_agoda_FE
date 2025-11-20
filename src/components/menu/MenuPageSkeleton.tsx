export default function MenuPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Hero Skeleton */}
      <div className="relative bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full">
              <div className="h-4 w-32 bg-yellow-200 rounded animate-pulse" />
            </div>
            <div className="h-14 bg-gray-200 rounded-lg w-96 mx-auto animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-[500px] mx-auto animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar Skeleton */}
        <div className="mb-6">
          <div className="h-14 bg-white border-2 border-gray-200 rounded-2xl w-full animate-pulse" />
        </div>

        {/* Filters Skeleton */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
              {/* Categories Skeleton */}
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded-full w-24 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
              </div>

              {/* Tags Skeleton */}
              <div className="pt-6 lg:pt-0 lg:pl-8 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded-full w-28 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count Skeleton */}
        <div className="mb-6">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
        </div>

        {/* Menu Grid Skeleton */}
        <MenuGridSkeleton />

        {/* Pagination Skeleton */}
        <div className="mt-12 flex justify-center">
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <div 
          key={index} 
          className="group bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200 animate-pulse"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Image Skeleton */}
          <div className="relative h-56 bg-gradient-to-br from-gray-200 to-gray-300" />
          
          {/* Content Skeleton */}
          <div className="p-5 space-y-3">
            {/* Title */}
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            
            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
            
            {/* Tags */}
            <div className="flex gap-2 pt-2">
              <div className="h-6 bg-gray-200 rounded-full w-16" />
              <div className="h-6 bg-gray-200 rounded-full w-20" />
            </div>
            
            {/* Price and Button */}
            <div className="flex items-center justify-between pt-3">
              <div className="h-7 bg-gray-200 rounded w-24" />
              <div className="h-10 w-10 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
