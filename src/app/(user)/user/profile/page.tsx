"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/src/Context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/src/lib/api";
import { toast } from "react-toastify";

interface Loyalty { points: number }
interface UserData {
  _id: string;
  name?: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
}

function UserProfileContent() {
  const { user: authUser, loading, logoutUser } = useAuth() as any;
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id") || authUser?._id;
  const isOwnProfile = !searchParams.has("id");

  const [user, setUser] = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [loyalty, setLoyalty] = useState<Loyalty | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: ""
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!loading && !authUser) router.push("/login");
  }, [loading, authUser, router]);

  // Fetch user data from URL or use auth user
  useEffect(() => {
    if (!userId) return;

    (async () => {
      setUserLoading(true);
      try {
        const res = await api.get(`/users/${userId}`);
        let userData = res.data?.data ?? res.data;
        
        // Ensure userData is an object and has required fields
        if (typeof userData !== 'object' || !userData) {
          throw new Error('Invalid user data');
        }
        
        setUser(userData as UserData);
        setFormData({
          name: String(userData.name || ""),
          phone: String(userData.phone || ""),
          address: String(userData.address || "")
        });
      } catch (error: any) {
        console.error("Failed to fetch user:", error);
        toast.error("Không thể tải thông tin user");
        router.push("/user/home");
      } finally {
        setUserLoading(false);
      }
    })();
  }, [userId, router]);

  // Fetch loyalty only for own profile
  useEffect(() => {
    if (!isOwnProfile) return;

    (async () => {
      try {
        const res = await api.get("/loyalty/my-points");
        setLoyalty((res.data?.data ?? res.data) as Loyalty);
      } catch { }
    })();
  }, [isOwnProfile]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const updatePayload = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      };
      await api.patch(`/users/${user?._id}`, updatePayload);
      toast.success("Cập nhật thông tin thành công!");
      setModalOpen(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error(error?.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading || userLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  const points = loyalty?.points ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8">
        {/* Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)'
          }} />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="h-24 w-24 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl font-bold text-white border border-white/30 shadow-lg">
              {user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}
            </div>
            <div className="flex-1 text-white text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold">{String(user.name || user.email)}</h1>
              <p className="text-indigo-100 mt-2 text-lg">Vai trò: <span className="font-semibold">{String(typeof user.role === 'object' ? (user.role as any)?.name || 'User' : user.role)}</span></p>
              <p className="text-indigo-100 text-sm mt-1">{String(user.email)}</p>
            </div>
            <button onClick={() => router.push("/user/home")} className="px-6 py-3 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-indigo-50 transition shadow-lg">← Về Dashboard</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Personal Info */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded"></div>
              <h2 className="text-2xl font-bold text-gray-900">Thông Tin Cá Nhân</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <p className="text-blue-600 text-sm font-semibold">👤 Họ Tên</p>
                <p className="text-gray-900 font-medium mt-1 text-lg">{user.name || "Chưa cập nhật"}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <p className="text-purple-600 text-sm font-semibold">📧 Email</p>
                <p className="text-gray-900 font-medium mt-1 text-lg break-all">{user.email}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <p className="text-green-600 text-sm font-semibold">📱 Số Điện Thoại</p>
                <p className="text-gray-900 font-medium mt-1 text-lg">{user.phone || "Chưa cập nhật"}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                <p className="text-orange-600 text-sm font-semibold">📍 Địa Chỉ</p>
                <p className="text-gray-900 font-medium mt-1 text-lg">{user.address || "Chưa cập nhật"}</p>
              </div>
            </div>
            <div className="mt-8 flex flex-col md:flex-row gap-3">
              {isOwnProfile && (
                <button onClick={() => setModalOpen(true)} className="px-6 py-3 rounded-xl border border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50 transition flex-1">✏️ Cập Nhật Thông Tin</button>
              )}
              {isOwnProfile && (
                <button onClick={() => logoutUser("/")} className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition flex-1">🚪 Đăng Xuất</button>
              )}
              {!isOwnProfile && (
                <button onClick={() => router.back()} className="px-6 py-3 rounded-xl bg-gray-600 text-white font-semibold hover:bg-gray-700 transition">← Quay Lại</button>
              )}
            </div>
          </div>

          {/* Loyalty Card - only show for own profile */}
          {isOwnProfile ? (
            <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl shadow-xl p-8 text-white border border-emerald-400/20 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
              <div className="relative z-10">
                <h3 className="text-lg font-semibold flex items-center gap-2">💎 Tủ Loyalty</h3>
                <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-4">
                  <p className="text-cyan-100 text-sm">Tổng Điểm Hiện Tại</p>
                  <p className="text-4xl font-bold text-amber-200 mt-2">{points}</p>
                </div>
                <p className="mt-4 text-cyan-100 text-sm leading-relaxed">Sử dụng điểm của bạn để đổi ưu đãi, giảm giá và quà tặng hấp dẫn.</p>
                <div className="mt-6">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-white/70">Tiến độ</span>
                    <span className="font-semibold text-amber-200">{Math.min(100, Math.round((points % 1000) / 10))}%</span>
                  </div>
                  <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-300 to-yellow-200 transition-all duration-500" style={{ width: `${Math.min(100, Math.round((points % 1000) / 10))}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-white/70">Mốc tiếp theo: 1000 điểm</p>
                </div>
                <a href="/user/loyalty" className="mt-6 w-full block text-center px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold transition">
                  Xem Chi Tiết →
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Thông Tin Khác</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái</span>
                  <span className="font-medium text-green-600">Hoạt động</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thành viên</span>
                  <span className="font-medium text-gray-900">Có</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Update Profile Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Cập Nhật Thông Tin</h3>
                  <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-white/20 rounded-lg transition">✕</button>
                </div>
                <p className="text-indigo-100 text-sm mt-1">Chỉnh sửa thông tin cá nhân của bạn</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">👤 Họ và Tên</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Nhập họ và tên của bạn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">📱 Số Điện Thoại</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">📍 Địa Chỉ</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                    placeholder="Nhập địa chỉ của bạn"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={updating}
                    className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50"
                  >
                    {updating ? "Đang cập nhật..." : "Cập Nhật"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

  );
}

export default function UserProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <UserProfileContent />
    </Suspense>
  );
}

