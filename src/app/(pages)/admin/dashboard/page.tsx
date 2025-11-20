
'use client';
import { AdminLayout } from '@/src/components/layout';
import { LoadingSpinner } from '@/src/components/ui';
import AdminPageHeader from '@/src/components/admin/common/AdminPageHeader';
import StatCards from '@/src/components/admin/StatCards';
import TodayStats from '@/src/components/admin/TodayStats';
import { useAuth } from '@/src/Context/AuthContext';
import { useDashboardData } from '@/src/hooks/useDashboardData';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const roleName = user ? (typeof user.role === 'string' ? user.role : (user.role as any)?.name || '') : '';
  const isAuthorized: boolean = !loading && !!user && roleName.toUpperCase() === 'ADMIN';

  const {
    coreStats,
    todayStats,
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
      <div className="w-full max-w-7xl mx-auto">
        <AdminPageHeader
          title="Dashboard Overview"
          description="Monitor your restaurant's performance and key metrics at a glance"
          icon={<BarChart3 className="w-6 h-6 text-white" />}
        />

        <StatCards stats={statCards} />
        {!dataLoading.today && todayStats && <TodayStats todayStats={todayStats} />}
      </div>
    </AdminLayout>
  );
}