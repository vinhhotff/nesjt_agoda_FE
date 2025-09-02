// TodayStats.tsx
'use client';

interface TodayStatsProps {
  todayStats: {
    totalOrders?: number;
    totalRevenue?: number;
    newUsers?: number;
    completedOrders?: number;
    pendingOrders?: number;
    cancelledOrders?: number;
  };
}

export default function TodayStats({ todayStats }: TodayStatsProps) {
  if (!todayStats) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4 text-gray-700">📊 Today's Performance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-600">Orders Today</h3>
            <span className="text-3xl">📦</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {todayStats.totalOrders || 0}
          </div>
          <p className="text-sm text-gray-500 mt-2">Total orders placed today</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-600">Today's Revenue</h3>
            <span className="text-3xl">💵</span>
          </div>
          <div className="text-3xl font-bold text-green-600">
            ${(todayStats.totalRevenue || 0).toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </div>
          <p className="text-sm text-gray-500 mt-2">Total revenue today</p>
        </div>

        {todayStats.newUsers !== undefined && (
          <div className="bg-white rounded-2xl shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-600">New Users</h3>
              <span className="text-3xl">👥</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {todayStats.newUsers || 0}
            </div>
            <p className="text-sm text-gray-500 mt-2">New registrations today</p>
          </div>
        )}

        {todayStats.completedOrders !== undefined && (
          <div className="bg-white rounded-2xl shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-600">Completed</h3>
              <span className="text-3xl">✅</span>
            </div>
            <div className="text-3xl font-bold text-emerald-600">
              {todayStats.completedOrders || 0}
            </div>
            <p className="text-sm text-gray-500 mt-2">Orders completed today</p>
          </div>
        )}
      </div>
    </div>
  );
}