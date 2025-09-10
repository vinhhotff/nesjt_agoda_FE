
'use client';
import { AdminLayout } from '@/src/components/layout';
import { LoadingSpinner } from '@/src/components/ui';
import RecentOrders from '@/src/components/admin/RecentOrders';
import StatCards from '@/src/components/admin/StatCards';
import TodayStats from '@/src/components/admin/TodayStats';
import WeeklyTrends from '@/src/components/admin/WeeklyTrends';
import { useAuth } from '@/src/Context/AuthContext';
import { useDashboardData } from '@/src/hooks/useDashboardData';
import { Order } from '@/src/Types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const router = useRouter();

  const roleName = user ? (typeof user.role === 'string' ? user.role : user.role?.name || '') : '';
  const isAuthorized: boolean = !loading && !!user && roleName.toUpperCase() === 'ADMIN';

  const {
    coreStats,
    todayStats,
    weeklyTrends,
    recentOrders,
    loading: dataLoading,
    formattedRevenue,
  } = useDashboardData(isAuthorized);

  // Auth protection
  useEffect(() => {
    if (!loading && !isAuthorized) {
      router.push('/login');
    }
  }, [isAuthorized, loading, router]);

  if (loading) return <LoadingSpinner size="lg" text="Loading dashboard..." className="min-h-screen" />;
  if (!isAuthorized) return null;

  const statCards = [
    { label: 'Menu Items', value: coreStats.menuItems, icon: '🍽️', href: '/admin/menu-items', color: 'bg-orange-100 text-orange-700' },
    { label: 'Total Orders', value: coreStats.totalOrders, icon: '🛒', href: '/admin/orders', color: 'bg-blue-100 text-blue-700' },
    { label: 'Revenue', value: formattedRevenue, icon: '💰', href: '/admin/revenue', color: 'bg-green-100 text-green-700' },
    { label: 'Users', value: coreStats.users, icon: '👤', href: '/admin/users', color: 'bg-purple-100 text-purple-700' },
  ];

  return (
    <AdminLayout>
      <StatCards stats={statCards} />
      {!dataLoading.today && todayStats && <TodayStats todayStats={todayStats} />}
      {!dataLoading.trends && weeklyTrends.length > 0 && <WeeklyTrends data={weeklyTrends} />}
      {!dataLoading.orders && <RecentOrders orders={recentOrders} onView={(order) => setSelectedOrder(order)} />}
    </AdminLayout>
  );
}