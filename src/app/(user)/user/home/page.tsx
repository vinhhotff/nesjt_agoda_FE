"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/src/lib/api";
import { getTopSellingItems } from "@/src/lib/api/revenueApi";
import { TopSellingItem, Order } from "@/src/Types";
import { useAuth } from "@/src/Context/AuthContext";

interface ApiResult<T> {
  loading: boolean;
  error?: string;
  data: T | null;
}

interface Loyalty {
  _id?: string;
  user: string | { _id: string; name?: string };
  points: number;
  createdAt?: string;
  updatedAt?: string;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
}

function getTier(points: number) {
  if (points >= 5000) return { name: "Platinum", nextAt: 0 } as const;
  if (points >= 1000) return { name: "Gold", nextAt: 5000 } as const;
  return { name: "Silver", nextAt: 1000 } as const;
}

export default function UserDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [topSellingRes, setTopSellingRes] = useState<ApiResult<TopSellingItem[]>>({ loading: true, data: null });
  const [loyaltyRes, setLoyaltyRes] = useState<ApiResult<Loyalty>>({ loading: true, data: null });
  const [ordersRes, setOrdersRes] = useState<ApiResult<Order[]>>({ loading: true, data: null });
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | undefined>(undefined);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  // Fetch data
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
      } catch (e: any) {
        setTopSellingRes((s) => ({ ...s, loading: false, error: s.error || e?.message || "Failed" }));
        setLoyaltyRes((s) => ({ ...s, loading: false, error: s.error || e?.message || "Failed" }));
        setOrdersRes((s) => ({ ...s, loading: false, error: s.error || e?.message || "Failed" }));
      }
    })();
  }, [user]);

  const openOrder = async (id: string) => {
    setOrderError(undefined);
    setOrderLoading(true);
    setOrderModalOpen(true);
    try {
      const res = await api.get(`/orders/${id}`);
      const payload = res.data?.data ?? res.data;
      setSelectedOrder(payload as Order);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }
  if (!user) return null;

  const points = loyaltyRes.data?.points ?? 0;
  const tier = getTier(points);
  const progress = (() => {
    if (tier.name === "Platinum") return 100;
    const base = tier.name === "Gold" ? 1000 : 0;
    const next = tier.nextAt; // 1000 for Silver->Gold, 5000 for Gold->Platinum
    const currentInTier = Math.max(0, points - base);
    const band = next - base;
    return Math.max(0, Math.min(100, Math.round((currentInTier / band) * 100)));
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)'
          }} />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Xin chào, {user.name}!</h1>
              <p className="text-indigo-100 mt-2 text-lg">Quản lý đơn hàng và điểm tích lũy của bạn</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Link href="/user/profile" className="px-6 py-3 rounded-lg bg-white text-indigo-600 font-semibold hover:bg-indigo-50 transition shadow-lg">Hồ sơ</Link>
              <Link href="/menu" className="px-6 py-3 rounded-lg bg-indigo-500 text-white font-semibold hover:bg-indigo-700 transition shadow-lg">Order</Link>
            </div>
          </div>
        </div>

        {/* Loyalty + Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl shadow-xl p-8 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Tù Loyalty</h2>
                  <p className="text-cyan-100 text-sm mt-1">Hạng thành viên: <span className="font-bold text-lg text-amber-200">{tier.name}</span></p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-baseline justify-between">
                  <span className="text-5xl font-bold text-amber-200">{points}</span>
                  <span className="text-white/70 text-sm">/ {tier.name === "Platinum" ? "Tối đa" : `${tier.nextAt}`}</span>
                </div>
                <p className="text-cyan-100 text-sm mt-2">Điểm của bạn</p>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/80">Tiến đến hạng tiếp theo</span>
                  <span className="font-semibold text-amber-200">{progress}%</span>
                </div>
                <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-300 to-yellow-200 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {loyaltyRes.loading && <div className="mt-4 text-cyan-100 text-sm">• Đang tải thông tin...</div>}
              {loyaltyRes.error && <div className="mt-4 text-red-200 text-sm">Lỗi: {loyaltyRes.error}</div>}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">📈 Thống kê</h3>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Đơn hàng gần đây</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{ordersRes.data?.length ?? 0}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Món bán chạy</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">{topSellingRes.data?.length ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Items */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">\ud83d\udd25 Món Bán Chạy</h2>
              <p className="text-gray-600 text-sm mt-1">Các món áo uế của khách hàng trong 30 ngày qua</p>
            </div>
            <Link href="/menu" className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition">Xem Menu</Link>
          </div>
          {topSellingRes.loading ? (
            <div className="text-center py-12 text-gray-500">• Đang tải...</div>
          ) : topSellingRes.error ? (
            <div className="p-6 bg-red-50 border border-red-200 text-red-600 rounded-lg">{topSellingRes.error}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {(topSellingRes.data ?? []).map((item) => (
                <div key={item._id} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 overflow-hidden">
                  <div className="relative h-32 bg-slate-100 overflow-hidden">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">IMG</div>
                    )}
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">Đã bán {item.totalSold}</div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition">{item.name}</h3>
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Price</span>
                        <span className="font-bold text-purple-600">{formatCurrency(item.totalRevenue)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order History */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">\ud83d\udccb Lịch Sử Đơn Hàng</h2>
              <p className="text-gray-600 text-sm mt-1">5 đơn hàng gần đây nhất của bạn</p>
            </div>
          </div>
          {ordersRes.loading ? (
            <div className="text-center py-12 text-gray-500">• Đang tải...</div>
          ) : ordersRes.error ? (
            <div className="p-6 bg-red-50 border border-red-200 text-red-600 rounded-lg">{ordersRes.error}</div>
          ) : (
            <div className="space-y-3">
              {(ordersRes.data ?? []).map((o) => {
                const created = o.createdAt ? new Date(o.createdAt) : null;
                const itemsCount = Array.isArray(o.items) ? o.items.length : 0;
                const statusIcons: Record<string, string> = {
                  pending: "\u26a0\ufe0f",
                  preparing: "\ud83d\udd28",
                  served: "\u2705",
                  cancelled: "\u274c",
                };
                const statusColors: Record<string, string> = {
                  pending: "from-yellow-50 to-yellow-100 border-yellow-200",
                  preparing: "from-blue-50 to-blue-100 border-blue-200",
                  served: "from-green-50 to-green-100 border-green-200",
                  cancelled: "from-red-50 to-red-100 border-red-200",
                };
                const statusTextColor: Record<string, string> = {
                  pending: "text-yellow-800",
                  preparing: "text-blue-800",
                  served: "text-green-800",
                  cancelled: "text-red-800",
                };
                return (
                  <div key={o._id} className={`bg-gradient-to-r ${statusColors[o.status] || "from-gray-50 to-gray-100"} border rounded-xl p-5 hover:shadow-lg transition-all duration-300`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{statusIcons[o.status] || "\ud83c\udf1f"}</span>
                          <div>
                            <div className="font-semibold text-gray-900">Đơn #{o._id.slice(-6).toUpperCase()}</div>
                            <div className={`text-sm mt-0.5 ${statusTextColor[o.status] || "text-gray-600"}`}>
                              {created ? created.toLocaleString("vi-VN") : ""} • {itemsCount} món
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">{formatCurrency(o.totalPrice || 0)}</div>
                          <div className={`text-xs font-semibold mt-1 ${statusTextColor[o.status] || "text-gray-600"}`}>{o.status}</div>
                        </div>
                        <button onClick={() => openOrder(o._id)} className="px-4 py-2 rounded-lg bg-white font-semibold hover:shadow transition hover:text-indigo-600">→</button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(ordersRes.data ?? []).length === 0 && (
                <div className="p-8 text-center bg-white rounded-xl border-2 border-dashed border-gray-300">
                  <p className="text-gray-500 text-lg font-medium">Chưa có đơn hàng nào</p>
                  <Link href="/menu" className="mt-3 inline-block px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition">Order Ngay</Link>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
      {/* Order Detail Modal */}
      {orderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" onClick={closeOrder} />
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết đơn hàng</h3>
              <button onClick={closeOrder} className="p-1.5 rounded hover:bg-gray-100">✕</button>
            </div>
            {orderLoading ? (
              <div className="mt-6 text-sm text-gray-500">Đang tải chi tiết...</div>
            ) : orderError ? (
              <div className="mt-6 text-sm text-red-600">{orderError}</div>
            ) : selectedOrder ? (
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="font-medium text-gray-900">Mã đơn:</span> {selectedOrder._id}
                  <span>•</span>
                  <span>{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : ""}</span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 text-xs">{selectedOrder.status}</span>
                </div>
                <div className="divide-y rounded-xl border">
                  {selectedOrder.items?.map((it, idx) => {
                    const itemObj: any = (it as any).item;
                    const name = typeof itemObj === 'object' ? itemObj.name : String(itemObj);
                    const image = typeof itemObj === 'object' ? (itemObj.images?.[0] || itemObj.image) : undefined;
                    const price = (it as any).unitPrice || (typeof itemObj === 'object' ? itemObj.price : 0);
                    const subtotal = (it as any).subtotal || price * (it as any).quantity;
                    return (
                      <div key={idx} className="p-4 flex items-center gap-3">
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={image} alt={name} className="h-14 w-14 rounded object-cover" />
                        ) : (
                          <div className="h-14 w-14 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">IMG</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{name}</div>
                          <div className="text-xs text-gray-500">SL: {(it as any).quantity} × {formatCurrency(price)}</div>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">{formatCurrency(subtotal)}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tổng tiền</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(selectedOrder.totalPrice || 0)}</span>
                </div>
               
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
