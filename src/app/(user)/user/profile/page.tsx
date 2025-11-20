"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/src/Context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/src/lib/api";
import { toast } from "react-toastify";
import { ArrowLeft, Edit3, LogOut, Mail, MapPin, Phone, ShieldCheck, Sparkles, Trophy } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50/30 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-amber-200 border-t-amber-500 rounded-full mx-auto"></div>
          <p className="text-gray-600 font-medium">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  const points = loyalty?.points ?? 0;
  const tier = points >= 5000 ? "Platinum" : points >= 1000 ? "Gold" : "Silver";
  const infoBlocks = [
    { label: "Email", value: user.email, icon: <Mail className="w-4 h-4" /> },
    { label: "Số điện thoại", value: user.phone || "Chưa cập nhật", icon: <Phone className="w-4 h-4" /> },
    { label: "Địa chỉ", value: user.address || "Chưa cập nhật", icon: <MapPin className="w-4 h-4" /> },
  ];
  const insightCards = [
    {
      label: "Vai trò",
      value: typeof user.role === "object" ? (user.role as any)?.name || "User" : user.role,
      accent: "from-amber-500 to-orange-500",
    },
    { label: "Điểm hiện có", value: points.toString(), accent: "from-emerald-500 to-green-500" },
    { label: "Trạng thái", value: "Hoạt động", accent: "from-blue-500 to-indigo-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50/30 to-white text-gray-900">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <section className="relative overflow-hidden rounded-4xl border border-amber-200/50 bg-white/80 backdrop-blur-xl p-8 shadow-2xl hover:shadow-amber-200/50 transition-all duration-500 group animate-fade-in">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.4),_transparent_70%)]" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.2),_transparent_60%)]" />
              <div className="relative flex flex-col gap-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="h-28 w-28 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-400 border-4 border-white flex items-center justify-center text-4xl font-bold shadow-xl text-white">
                    {user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <p className="inline-flex items-center gap-2 text-xs tracking-wide uppercase text-amber-600 animate-fade-in">
                      <Sparkles className="w-4 h-4 animate-pulse" /> Hồ sơ khách hàng
                    </p>
                    <h1 className="text-4xl font-extrabold mt-2 text-gray-900 animate-slide-up">{user.name || user.email}</h1>
                    <p className="text-gray-600 mt-2 animate-slide-up animation-delay-200">{user.email}</p>
                  </div>
                  <button
                    onClick={() => router.push("/user/home")}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-amber-200 bg-white/80 backdrop-blur font-semibold text-gray-900 hover:bg-amber-50 hover:border-amber-400 hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Dashboard
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {insightCards.map((card, idx) => (
                    <div 
                      key={card.label} 
                      className={`rounded-2xl p-4 bg-gradient-to-br ${card.accent} text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-scale-in`}
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <p className="text-xs uppercase tracking-[0.25em] text-white/80">{card.label}</p>
                      <p className="text-2xl font-bold mt-2">{card.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-amber-200/50 bg-white/80 backdrop-blur-xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in-up animation-delay-200">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-amber-600">Thông tin</p>
                  <h2 className="text-2xl font-bold text-gray-900 mt-2">Chi tiết cá nhân</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {isOwnProfile && (
                    <button
                      onClick={() => setModalOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-white font-semibold shadow-lg hover:shadow-amber-400/60 hover:scale-105 transition-all duration-300"
                    >
                      <Edit3 className="w-4 h-4" />
                      Cập nhật
                    </button>
                  )}
                  {isOwnProfile && (
                    <button
                      onClick={() => logoutUser("/")}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 hover:scale-105 transition-all duration-300"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  )}
                  {!isOwnProfile && (
                    <button
                      onClick={() => router.back()}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 hover:scale-105 transition-all duration-300"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Quay lại
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <p className="text-xs uppercase tracking-[0.4em] text-amber-700 mb-2">Họ tên</p>
                  <p className="text-xl font-semibold text-gray-900">{user.name || "Chưa cập nhật"}</p>
                </div>
                {infoBlocks.map((item, idx) => (
                  <div 
                    key={item.label} 
                    className="rounded-2xl border-2 border-gray-200 bg-white p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${(idx + 1) * 100}ms` }}
                  >
                    <p className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-gray-500 mb-2">
                      {item.icon}
                      {item.label}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 break-words">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in-up animation-delay-400">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-blue-600">Tổng quan</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">Trạng thái tài khoản</h3>
                </div>
                <ShieldCheck className="w-10 h-10 text-blue-500 animate-pulse-slow" />
              </div>
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex justify-between items-center border-b border-blue-200 pb-3">
                  <span>Tình trạng</span>
                  <span className="font-semibold text-emerald-600">Đang hoạt động</span>
                </div>
                <div className="flex justify-between items-center border-b border-blue-200 pb-3">
                  <span>Quyền hạn</span>
                  <span className="font-semibold text-gray-900">{typeof user.role === "object" ? (user.role as any)?.name || "User" : user.role}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Bảo mật</span>
                  <span className="inline-flex items-center gap-2 text-amber-600 font-semibold"><Sparkles className="w-4 h-4" /> 2 lớp</span>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            {isOwnProfile ? (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-8 border-2 border-amber-200 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 animate-fade-in-up animation-delay-600">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.4),_transparent_60%)]" />
                <div className="relative space-y-6">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-amber-600 animate-bounce-slow" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-amber-600">Loyalty</p>
                      <h3 className="text-2xl font-bold text-gray-900">Điểm thưởng</h3>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Tổng điểm</p>
                    <p className="text-5xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent animate-pulse-slow">{points}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.4em] text-amber-700">Hạng {tier}</p>
                  </div>
                  <div className="mt-6">
                    <div className="flex justify-between text-xs uppercase tracking-[0.4em] text-gray-600 mb-2">
                      <span>Tiến độ</span>
                      <span>{Math.min(100, Math.round((points % 1000) / 10))}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-200 overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 transition-all duration-1000 ease-out animate-shimmer"
                        style={{ width: `${Math.min(100, Math.round((points % 1000) / 10))}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Mức tiếp theo: 1000 điểm</p>
                  </div>
                  <a
                    href="/user/loyalty"
                    className="block mt-6 text-center px-5 py-3 rounded-2xl bg-white border-2 border-amber-300 font-semibold text-amber-700 hover:bg-amber-50 hover:scale-105 transition-all duration-300 shadow-md"
                  >
                    Xem quyền lợi
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border-2 border-gray-200 bg-white/80 backdrop-blur-xl p-8 shadow-xl">
                <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Trạng thái</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">Khách hàng nội bộ</h3>
                <p className="text-gray-600 mt-4 text-sm">
                  Hồ sơ này được hiển thị ở chế độ chỉ đọc. Liên hệ quản trị viên nếu cần thay đổi.
                </p>
              </div>
            )}

            <div className="rounded-3xl border-2 border-gray-200 bg-white/80 backdrop-blur-lg p-6 shadow-xl hover:shadow-2xl transition-all duration-500 space-y-4 animate-fade-in-up animation-delay-800">
              <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Hành động nhanh</p>
              <div className="space-y-3">
                <a href="/reservation" className="block rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:border-amber-300 hover:bg-amber-50 hover:translate-x-1 transition-all duration-300">
                  Đặt bàn mới
                </a>
                <a href="/menu" className="block rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:border-amber-300 hover:bg-amber-50 hover:translate-x-1 transition-all duration-300">
                  Khám phá menu
                </a>
                <a href="/user/orders" className="block rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:border-amber-300 hover:bg-amber-50 hover:translate-x-1 transition-all duration-300">
                  Lịch sử mua hàng
                </a>
              </div>
            </div>
          </aside>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setModalOpen(false)} />
            <div className="relative z-10 w-full max-w-lg rounded-3xl border-2 border-amber-200 bg-white shadow-2xl animate-scale-in">
              <div className="border-b border-gray-200 p-6 flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-amber-600">Chỉnh sửa</p>
                  <h3 className="text-2xl font-bold mt-1 text-gray-900">Thông tin cá nhân</h3>
                </div>
                <button 
                  onClick={() => setModalOpen(false)} 
                  className="p-2 rounded-full hover:bg-white/80 text-gray-600 hover:text-gray-900 transition-all duration-300 hover:rotate-90"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="text-xs uppercase tracking-[0.4em] text-gray-600">Họ và tên</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-2 w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all duration-300"
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.4em] text-gray-600">Số điện thoại</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-2 w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all duration-300"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.4em] text-gray-600">Địa chỉ</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="mt-2 w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none transition-all duration-300"
                    placeholder="Nhập địa chỉ"
                    rows={3}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 rounded-2xl border-2 border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 hover:scale-105 transition-all duration-300"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={updating}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-3 font-semibold text-white shadow-lg hover:shadow-amber-400/60 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {updating ? "Đang cập nhật..." : "Lưu thay đổi"}
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-gray-900 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <UserProfileContent />
    </Suspense>
  );
}

