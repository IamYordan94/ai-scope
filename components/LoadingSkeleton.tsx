'use client';

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export function ToolCardSkeleton({ count = 6 }: LoadingSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg animate-pulse"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ToolDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-32 h-32 bg-white/20 rounded-2xl" />
          <div className="flex-1">
            <div className="h-10 bg-white/20 rounded w-3/4 mb-4" />
            <div className="h-6 bg-white/20 rounded w-1/2 mb-6" />
            <div className="space-y-2">
              <div className="h-4 bg-white/20 rounded w-full" />
              <div className="h-4 bg-white/20 rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

