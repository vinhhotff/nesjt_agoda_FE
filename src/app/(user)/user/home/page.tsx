"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/src/lib/api";
import { getTopSellingItems } from "@/src/lib/api/revenueApi";
import { TopSellingItem, Order } from "@/src/Types";
import { useAuth } from "@/src/Context/AuthContext";
import { ArrowRight, Gift, Sparkles, Trophy, UtensilsCrossed } from "lucide-react";

interface ApiResult<T> {
  loading: boolean;
  error?: string;
  data: T | null;
}

interface Loyalty {
  points: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function getTier(points: number) {
  if (points >= 5000) return { name: "Platinum", nextAt: 0 };
  if (points >= 1000) return { name: "Gold", nextAt: 5000 };
  return { name: "Silver", nextAt: 1000 };
}

const statusPalette: Record<string, { bg: string; text: string; icon: string }> = {
  pending: {
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-600",
    icon: "⏳",
  },
  preparing: {
    bg: "bg-sky-50 border-sky-200",
    text: "text-sky-600",
    icon: "🍳",
  },
  served: {
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-600",
    icon: "✅",
  },
  cancelled: {
    bg: "bg-rose-50 border-rose-200",
    text: "text-rose-600",
    icon: "✖",
  },
};

export default function UserDashboardPage() {
  const { user, loading } = useAuth();
  const [topSellingRes, setTopSellingRes] = useState<ApiResult<TopSellingItem[]>>({ loading: true, data: null });
  const [loyaltyRes, setLoyaltyRes] = useState<ApiResult<Loyalty>>({ loading: true, data: null });
  const [ordersRes, setOrdersRes] = useState<ApiResult<Order[]>>({ loading: true, data: null });
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string>();

  useEffect(() => {
    if (!loading && !user) window.location.href = "/login";
  }, [loading, user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [top, loyalty, ordersPayload] = await Promise.all([
          getTopSellingItems("30d", 8),
          api.get("/loyalty/my-points").then((r) => (r.data?.data ?? r.data) as Loyalty),
          api.get(`/orders/user`, { params: { userId: user._id } }).then((r) => r.data),
        ]);

        const orders = Array.isArray((ordersPayload?.data as any)?.data)
          ? (ordersPayload.data as any).data
          : Array.isArray(ordersPayload?.data)
          ? ordersPayload.data
          : Array.isArray(ordersPayload)
          ? ordersPayload
          : [];

        setTopSellingRes({ loading: false, data: top });
        setLoyaltyRes({ loading: false, data: loyalty });
        setOrdersRes({ loading: false, data: orders });
      } catch (error: any) {
        const fallback = { loading: false, data: [], error: error?.message || "Đã có lỗi xảy ra" };
        setTopSellingRes((prev) => ({ ...fallback, data: prev.data }));
        setLoyaltyRes((prev) => ({ ...fallback, data: prev.data }));
        setOrdersRes(fallback);
      }
    })();
  }, [user]);

  const openOrder = async (id: string) => {
    setOrderError(undefined);
    setOrderLoading(true);
    setOrderModalOpen(true);
    try {
      const res = await api.get(`/orders/${id}`);
      setSelectedOrder((res.data?.data ?? res.data) as Order);
    } catch (err: any) {
      setOrderError(err?.message || "Không thể lấy chi tiết đơn hàng");
    } finally {
      setOrderLoading(false);
    }
  };

  const closeOrder = () => {
    setOrderModalOpen(false);
    setSelectedOrder(null);
  };

  // Compute derived values with useMemo before any conditional returns
  const latestOrders = useMemo(() => (ordersRes.data ?? []).slice(0, 5), [ordersRes.data]);
  
  const points = loyaltyRes.data?.points ?? 0;
  const tier = getTier(points);
  const progress =
    tier.name === "Platinum"
      ? 100
      : Math.min(
          100,
          Math.round(
            ((points - (tier.name === "Gold" ? 1000 : 0)) / (tier.nextAt - (tier.name === "Gold" ? 1000 : 0))) * 100
          )
        );

  const quickStats = [
    { label: "Đơn gần đây", value: String((ordersRes.data ?? []).length), accent: "from-amber-200 to-amber-100" },
    { label: "Món bán chạy", value: String((topSellingRes.data ?? []).length), accent: "from-sky-200 to-sky-100" },
    { label: "Hạng hiện tại", value: String(tier.name), accent: "from-emerald-200 to-emerald-100" },
  ];

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50/30 to-white text-gray-900">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-10">
        <section className="relative overflow-hidden rounded-4xl border border-amber-200/50 bg-white/80 backdrop-blur-xl shadow-2xl hover:shadow-amber-200/50 transition-all duration-500 group">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.4),_transparent_70%)]" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.2),_transparent_60%)]" />
          <div className="relative flex flex-col gap-8 p-8 md:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-amber-600 animate-fade-in">
                  <Sparkles className="w-4 h-4 animate-pulse" /> Xin chào trở lại
                </p>
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900 animate-slide-up">
                  Chào {user.name || "bạn"}!
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl animate-slide-up animation-delay-200">
                  Tiếp tục hành trình ẩm thực của bạn với các ưu đãi và điểm thưởng mới nhất.
                </p>
                <div className="flex flex-wrap gap-3 animate-slide-up animation-delay-400">
                  <Link
                    href="/menu"
                    className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-amber-400/60 hover:scale-105 transition-all duration-300"
                  >
                    Khám phá menu <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/user/orders"
                    className="inline-flex items-center gap-2 rounded-2xl border-2 border-amber-200 bg-white/80 backdrop-blur px-6 py-3 font-semibold text-gray-900 shadow-sm hover:border-amber-400 hover:bg-amber-50 hover:scale-105 transition-all duration-300"
                  >
                    Đơn hàng của tôi
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
                {quickStats.map((stat, idx) => (
                  <div
                    key={stat.label}
                    className={`rounded-2xl border border-white/60 bg-gradient-to-br ${stat.accent} p-5 text-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-scale-in`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <p className="text-xs uppercase tracking-[0.4em] text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Loyalty Points Section */}
        <section className="rounded-3xl border border-yellow-200/50 bg-white/80 backdrop-blur-xl p-8 shadow-xl hover:shadow-2xl hover:shadow-amber-200/30 transition-all duration-500 animate-fade-in-up">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-amber-600">Loyalty</p>
              <h2 className="text-3xl font-semibold text-gray-900 mt-2">Điểm thưởng</h2>
            </div>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-400 flex items-center justify-center shadow-lg hover:scale-110 hover:rotate-12 transition-all duration-300 animate-bounce-slow">
              <Trophy className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <p className="text-sm text-amber-700">Tổng điểm</p>
              <p className="text-5xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mt-2 animate-pulse-slow">{points}</p>
              <p className="text-xs uppercase tracking-[0.4em] text-amber-600 mt-2">Hạng {tier.name}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <p className="text-sm text-gray-600">Tiến độ lên hạng</p>
              <div className="mt-4">
                <div className="h-3 rounded-full bg-gray-200 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 transition-all duration-1000 ease-out animate-shimmer"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {tier.name === "Platinum" ? "Bạn đã đạt hạng cao nhất" : `Cần thêm ${Math.max(0, tier.nextAt - points)} điểm`}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-3 flex-wrap">
            <Link
              href="/reservation"
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 hover:scale-105 transition-all duration-300"
            >
              Đặt bàn ngay
            </Link>
            <Link
              href="/user/loyalty"
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:border-amber-300 hover:scale-105 transition-all duration-300"
            >
              Quyền lợi thành viên
            </Link>
          </div>
        </section>

        {/* Top Selling Items & Recent Orders - Side by Side */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Top Selling Items */}
          <div className="rounded-3xl border border-gray-200/50 bg-white/80 backdrop-blur-xl p-8 shadow-xl hover:shadow-2xl hover:shadow-amber-200/30 transition-all duration-500 animate-fade-in-up animation-delay-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">🔥 Món bán chạy</h2>
                <p className="text-gray-600 text-sm mt-1">Top 4 món phổ biến</p>
              </div>
              <Link
                href="/menu"
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-white px-4 py-2 text-sm font-semibold shadow-lg hover:shadow-amber-300/60 hover:scale-105 transition-all duration-300"
              >
                Xem menu <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            {topSellingRes.loading ? (
              <div className="text-center py-10 text-gray-500">Đang tải...</div>
            ) : topSellingRes.error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-600">{topSellingRes.error}</div>
            ) : (
              <div className="space-y-4">
                {(topSellingRes.data ?? []).slice(0, 4).map((item, idx) => (
                  <div 
                    key={item._id} 
                    className="group rounded-2xl border border-gray-200 bg-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden animate-fade-in-up flex gap-4"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="relative w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden flex-shrink-0">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="h-full flex items-center justify-center text-2xl text-gray-300">🍽️</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="flex-1 py-3 pr-4 flex flex-col justify-center">
                      <h3 className="text-base font-semibold text-gray-900 line-clamp-1 group-hover:text-amber-600 transition-colors">{item.name}</h3>
                      <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">+{item.totalSold} lượt</span>
                        <span className="font-semibold text-amber-600">{formatCurrency(item.totalRevenue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {(topSellingRes.data ?? []).length === 0 && <div className="text-gray-400 text-sm text-center py-8">Chưa có dữ liệu.</div>}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="rounded-3xl border border-gray-200/50 bg-white/80 backdrop-blur-xl p-8 shadow-xl hover:shadow-2xl hover:shadow-amber-200/30 transition-all duration-500 animate-fade-in-up animation-delay-400">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">📋 Đơn gần đây</h2>
                <p className="text-gray-500 text-sm mt-1">4 đơn mới nhất</p>
              </div>
              <Link href="/user/orders" className="text-sm font-semibold text-amber-600 hover:text-amber-500 hover:scale-105 transition-transform">
                Xem tất cả
              </Link>
            </div>
            {ordersRes.loading ? (
              <div className="text-center py-10 text-gray-500">Đang tải...</div>
            ) : ordersRes.error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-600">{ordersRes.error}</div>
            ) : (
              <div className="space-y-4">
                {latestOrders.slice(0, 4).map((o, idx) => {
                  const created = o.createdAt ? new Date(o.createdAt) : null;
                  const palette = statusPalette[o.status] || statusPalette.pending;
                  const itemsCount = Array.isArray(o.items) ? o.items.length : 0;
                  return (
                    <div
                      key={o._id}
                      className={`rounded-2xl border ${palette.bg} p-3 text-gray-900 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up flex gap-3`}
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <span className={`text-xl ${palette.text} flex-shrink-0 mt-0.5`}>{palette.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm">#{o._id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {created ? created.toLocaleDateString("vi-VN") : ""} • {itemsCount} món
                            </p>
                          </div>
                          <p className={`text-xs font-semibold px-2 py-0.5 rounded-full ${palette.text} bg-white/50`}>{o.status}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-base font-bold text-amber-600">{formatCurrency(o.totalPrice || 0)}</p>
                          <button
                            onClick={() => openOrder(o._id)}
                            className="text-xs font-semibold text-amber-600 hover:text-amber-500 hover:underline"
                          >
                            Chi tiết
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {latestOrders.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                    <p className="text-sm">Bạn chưa có đơn nào.</p>
                    <Link href="/menu" className="text-amber-600 font-semibold text-sm hover:underline">Đặt món ngay</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions & Suggestion */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-200/50 bg-white/80 backdrop-blur-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 space-y-4 animate-fade-in-up animation-delay-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Trải nghiệm</p>
                <h3 className="text-xl font-bold text-gray-900 mt-2">Bảng điều khiển</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-400 flex items-center justify-center shadow-md">
                <Gift className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <Link
                href="/reservation"
                className="block rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:border-amber-300 hover:bg-amber-50 hover:translate-x-1 transition-all duration-300"
              >
                Đặt bàn cho lần tới
              </Link>
              <Link
                href="/user/profile"
                className="block rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:border-amber-300 hover:bg-amber-50 hover:translate-x-1 transition-all duration-300"
              >
                Cập nhật thông tin cá nhân
              </Link>
              <Link
                href="/user/reservations"
                className="block rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:border-amber-300 hover:bg-amber-50 hover:translate-x-1 transition-all duration-300"
              >
                Đơn đặt bàn của tôi
              </Link>
              <Link
                href="/contact"
                className="block rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:border-amber-300 hover:bg-amber-50 hover:translate-x-1 transition-all duration-300"
              >
                Liên hệ hỗ trợ
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 animate-fade-in-up animation-delay-800">
            <div className="flex items-center gap-3 text-amber-700">
              <UtensilsCrossed className="w-8 h-8 animate-pulse-slow" />
              <div>
                <p className="text-xs uppercase tracking-[0.4em]">Gợi ý</p>
                <h3 className="text-2xl font-bold text-amber-900">Thưởng thức món mới</h3>
              </div>
            </div>
            <p className="text-amber-700/80 mt-4 text-sm">
              Thử món mới mỗi tuần để nhận thêm 100 điểm thưởng. Đừng bỏ lỡ các sự kiện đặc biệt của nhà hàng.
            </p>
          </div>
        </section>
      </div>

      {orderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeOrder} />
          <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-gray-200 bg-white text-gray-900 shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-amber-500">Chi tiết đơn</p>
                <h3 className="text-2xl font-bold mt-1">Mã #{selectedOrder?._id?.slice(-6).toUpperCase()}</h3>
              </div>
              <button onClick={closeOrder} className="p-2 rounded-full hover:bg-gray-100">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-5">
              {orderLoading ? (
                <div className="text-sm text-gray-500">Đang tải...</div>
              ) : orderError ? (
                <div className="text-sm text-rose-500">{orderError}</div>
              ) : selectedOrder ? (
                <>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    <span>{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString("vi-VN") : ""}</span>
                    <span>•</span>
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">{selectedOrder.status}</span>
                  </div>
                  <div className="rounded-2xl border border-gray-100 divide-y divide-gray-100">
                    {selectedOrder.items?.map((it, idx) => {
                      const itemObj: any = (it as any).item;
                      const name = typeof itemObj === "object" ? itemObj.name : String(itemObj);
                      const image = typeof itemObj === "object" ? (itemObj.images?.[0] || itemObj.image) : undefined;
                      const price = (it as any).unitPrice || (typeof itemObj === "object" ? itemObj.price : 0);
                      const subtotal = (it as any).subtotal || price * (it as any).quantity;
                      return (
                        <div key={idx} className="p-4 flex items-center gap-4">
                          {image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={image} alt={name} className="h-14 w-14 rounded-xl object-cover" />
                          ) : (
                            <div className="h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs">IMG</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{name}</p>
                            <p className="text-xs text-gray-500">
                              SL {(it as any).quantity} × {formatCurrency(price)}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900">{formatCurrency(subtotal)}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Tổng tiền</span>
                    <span className="text-2xl font-bold text-gray-900">{formatCurrency(selectedOrder.totalPrice || 0)}</span>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
