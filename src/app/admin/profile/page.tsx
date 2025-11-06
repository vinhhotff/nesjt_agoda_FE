"use client";
import React, { useEffect } from "react";
import { useAuth } from "@/src/Context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) return router.push("/login");
      const role = String(user.role || "").toLowerCase();
      if (role !== "admin") return router.push("/user/home");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold">
              {user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xl font-semibold truncate">{user.name || user.email}</div>
              <div className="text-sm opacity-90">Admin</div>
            </div>
            <div className="ml-auto">
              <button onClick={() => router.push("/")} className="px-4 py-2 rounded-lg bg-white text-slate-900 font-medium shadow">Trang chủ</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="text-lg font-semibold text-gray-900">Thông tin tài khoản</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><div className="text-gray-500">Email</div><div className="font-medium text-gray-900">{user.email}</div></div>
            <div><div className="text-gray-500">Vai trò</div><div className="font-medium text-gray-900">{user.role}</div></div>
            <div><div className="text-gray-500">ID</div><div className="font-medium text-gray-900 break-all">{user._id}</div></div>
            <div><div className="text-gray-500">Ngày tạo</div><div className="font-medium text-gray-900">{user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
