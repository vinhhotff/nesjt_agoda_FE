"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMenuItems } from "@/src/lib/api";
import { getTopSellingItems } from "@/src/lib/api/revenueApi";
import { useAuth } from "@/src/Context/AuthContext";

interface ApiResult<T> {
  loading: boolean;
  error?: string;
  data: T | null;
}

export default function UserDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [menuItemsRes, setMenuItemsRes] = useState<ApiResult<any[]>>({ loading: true, data: null });
  const [topSellingRes, setTopSellingRes] = useState<ApiResult<any[]>>({ loading: true, data: null });

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // Fetch API responses
  useEffect(() => {
    if (!user) return;
    
    (async () => {
      try {
        const items = await getMenuItems();
        setMenuItemsRes({ loading: false, data: items });
      } catch (e: any) {
        setMenuItemsRes({ loading: false, data: null, error: e?.message || "Failed" });
      }
      try {
        const top = await getTopSellingItems("30d", 8);
        setTopSellingRes({ loading: false, data: top });
      } catch (e: any) {
        setTopSellingRes({ loading: false, data: null, error: e?.message || "Failed" });
      }
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";

  const Section = ({ title, endpoint, result }: { title: string; endpoint: string; result: ApiResult<any> }) => (
    <div className="bg-white rounded-xl shadow border p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <Link href="#" onClick={(e) => e.preventDefault()} className="text-xs text-blue-600 select-all">
          {apiBase}{endpoint}
        </Link>
      </div>
      {result.loading ? (
        <div className="text-gray-500 text-sm">Loading...</div>
      ) : result.error ? (
        <div className="text-red-600 text-sm">Error: {result.error}</div>
      ) : (
        <pre className="text-xs bg-gray-50 border rounded p-3 overflow-auto max-h-80">
          {JSON.stringify(result.data, null, 2)}
        </pre>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-gray-600 mt-2">Your personalized dashboard with backend API snapshots</p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Profile</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium text-gray-700">Email:</span> {user.email}</p>
            <p><span className="font-medium text-gray-700">Role:</span> {user.role}</p>
            <p><span className="font-medium text-gray-700">Member:</span> {user.isMember ? "Yes" : "No"}</p>
          </div>
        </div>

        {/* API Snapshots */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Backend API Responses</h2>
          <div className="space-y-6">
            <Section title="Menu Items" endpoint="/menu-items" result={menuItemsRes} />
            <Section
              title="Top Selling Items (30d, limit=8)"
              endpoint="/analytics/menu-items/top-selling?period=30d&limit=8"
              result={topSellingRes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
