// hooks/useDashboardData.ts
import { useState, useEffect, useCallback } from 'react';
import {
    getMenuItemCount,
    getOrderCount,
    getRevenue,
    fetchUsersCount,
    getTodayStats,
    getWeeklyTrends,
    fetchOrders
} from '@/src/lib/api';
import { useApiCache } from './useApiCache';

export function useDashboardData(isAuthorized: boolean) {
    const { cachedCall } = useApiCache();
    const cache = useApiCache({ ttl: 2 * 60 * 1000 }); // 2 minutes cache

    const [coreStats, setCoreStats] = useState({
        menuItems: 0,
        totalOrders: 0,
        revenue: 0,
        users: 0
    });

    const [todayStats, setTodayStats] = useState<any>(null);
    const [weeklyTrends, setWeeklyTrends] = useState<any[]>([]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    const [loading, setLoading] = useState({
        core: true,
        today: true,
        trends: true,
        orders: true
    });
    // Load core stats
    const loadCoreStats = useCallback(async () => {
        if (!isAuthorized) return;

        try {
            const [menuItems, totalOrders, revenue, users] = await Promise.allSettled([
                cachedCall('menuItems', getMenuItemCount),
                cachedCall('orderCount', getOrderCount),
                cachedCall('revenue', getRevenue),
                cachedCall('usersCount', fetchUsersCount),
            ]);

            // Log errors for debugging
            if (menuItems.status === 'rejected') {
                console.error('Error fetching menu items:', menuItems.reason);
            }
            if (totalOrders.status === 'rejected') {
                console.error('Error fetching total orders:', totalOrders.reason);
            }
            if (revenue.status === 'rejected') {
                console.error('Error fetching revenue:', revenue.reason);
            }
            if (users.status === 'rejected') {
                console.error('Error fetching users:', users.reason);
            }

            setCoreStats({
                menuItems: menuItems.status === 'fulfilled' ? menuItems.value : 0,
                totalOrders: totalOrders.status === 'fulfilled' ? totalOrders.value : 0,
                revenue: revenue.status === 'fulfilled' ? revenue.value : 0,
                users: users.status === 'fulfilled' ? users.value : 0,
            });
        } catch (error) {
            console.error('Core stats error:', error);
        } finally {
            setLoading(prev => ({ ...prev, core: false }));
        }
    }, [isAuthorized, cachedCall]);

    // Load today stats
    const loadTodayStats = useCallback(async () => {
        if (!isAuthorized) return;

        try {
            const result = await cachedCall('todayStats', getTodayStats);
            setTodayStats(result?.data || result || null);
        } catch (error) {
            console.error('Today stats error:', error);
            setTodayStats(null);
        } finally {
            setLoading(prev => ({ ...prev, today: false }));
        }
    }, [isAuthorized, cachedCall]);

    // Load weekly trends
    const loadWeeklyTrends = useCallback(async () => {
        if (!isAuthorized) return;

        try {
            const result = await cachedCall('weeklyTrends', getWeeklyTrends);
            const data = result?.data || result || [];
            setWeeklyTrends(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Weekly trends error:', error);
            setWeeklyTrends([]);
        } finally {
            setLoading(prev => ({ ...prev, trends: false }));
        }
    }, [isAuthorized, cachedCall]);

    // Load recent orders
    const loadRecentOrders = useCallback(async () => {
        if (!isAuthorized) return;

        try {
            const ordersData = await cachedCall('recentOrders', fetchOrders);
            if (Array.isArray(ordersData)) {
                const sortedOrders = ordersData
                    .sort((a, b) => new Date(b.createdAt || b.updatedAt || '').getTime() - new Date(a.createdAt || a.updatedAt || '').getTime())
                    .slice(0, 10);
                setRecentOrders(sortedOrders);
            } else {
                setRecentOrders([]);
            }
        } catch (error) {
            console.error('Recent orders error:', error);
            setRecentOrders([]);
        } finally {
            setLoading(prev => ({ ...prev, orders: false }));
        }
    }, [isAuthorized, cachedCall]);

    // Refresh function
    const refresh = useCallback(() => {
        cache.clear();
        setLoading({ core: true, today: true, trends: true, orders: true });

        loadCoreStats();
        setTimeout(() => loadTodayStats(), 100);
        setTimeout(() => loadWeeklyTrends(), 300);
        setTimeout(() => loadRecentOrders(), 500);
    }, [cache, loadCoreStats, loadTodayStats, loadWeeklyTrends, loadRecentOrders]);

    // Main effect to load data
    useEffect(() => {
        if (!isAuthorized) return;

        loadCoreStats();
        setTimeout(() => loadTodayStats(), 100);
        setTimeout(() => loadWeeklyTrends(), 300);
        setTimeout(() => loadRecentOrders(), 500);
    }, [isAuthorized, loadCoreStats, loadTodayStats, loadWeeklyTrends, loadRecentOrders]);

    // Computed values
    const formattedRevenue = `$${coreStats.revenue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

    return {
        coreStats,
        todayStats,
        weeklyTrends,
        recentOrders,
        loading,
        formattedRevenue
    };
}