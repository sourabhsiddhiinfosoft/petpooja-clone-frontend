// Skeleton for the entire dashboard
export const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gray-50 p-6 space-y-8">
    {/* Page Header Skeleton */}
    <div className="text-left">
      <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-300 rounded w-96 mx-auto animate-pulse"></div>
    </div>

    {/* Summary Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-gray-300 rounded-xl shadow-lg p-6 text-center animate-pulse">
          <div className="h-8 w-8 bg-gray-400 rounded-full mx-auto mb-2"></div>
          <div className="h-4 bg-gray-400 rounded w-20 mx-auto mb-2"></div>
          <div className="h-6 bg-gray-400 rounded w-16 mx-auto"></div>
        </div>
      ))}
    </div>

    {/* Chart Skeletons */}
    <ChartSkeleton />
    <ChartSkeleton />

    {/* Recent Orders Skeleton */}
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="h-6 bg-gray-300 rounded w-48 mb-6 animate-pulse"></div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              {Array.from({ length: 5 }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t">
                {Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Skeleton for charts
export const ChartSkeleton = () => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
    <div className="flex justify-between items-center mb-6">
      <div className="h-6 bg-gray-300 rounded w-48 animate-pulse"></div>
      <div className="h-8 bg-gray-300 rounded w-24 animate-pulse"></div>
    </div>
    <div className="w-full h-80 bg-gray-200 rounded animate-pulse"></div>
  </div>
);