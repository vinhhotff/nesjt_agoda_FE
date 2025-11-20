"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/src/lib/api";
import { Order } from "@/src/Types";
import { useAuth } from "@/src/Context/AuthContext";
import { ArrowLeft, ArrowRight, Filter, Receipt, Search, UtensilsCrossed } from "lucide-react";

type StatusFilter = "all" | "pending" | "preparing" | "served" | "cancelled";

interface OrdersState {
  loading: boolean;
  error?: string;
  data: Order[];
}

const statusPalette: Record<
  StatusFilter,
  { label: string; badge: string; border: string; chip: string; icon: string; bg: string }
> = {
  all: {
    label: "Tất cả",
    badge: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
    border: "border-amber-200",
    chip: "bg-amber-100 text-amber-700 border-amber-200",
    bg: "bg-gradient-to-br from-amber-50 to-yellow-50",
    icon: "⭐",
  },
  pending: {
    label: "Chờ xử lý",
    badge: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
    border: "border-amber-200",
    chip: "bg-amber-100 text-amber-700 border-amber-200",
    bg: "bg-gradient-to-br from-amber-50 to-orange-50",
    icon: "⏳",
  },
  preparing: {
    label: "Đang chuẩn bị",
    badge: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
    border: "border-blue-200",
    chip: "bg-blue-100 text-blue-700 border-blue-200",
    bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
    icon: "🍳",
  },
  served: {
    label: "Hoàn tất",
    badge: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
    border: "border-emerald-200",
    chip: "bg-emerald-100 text-emerald-700 border-emerald-200",
    bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
    icon: "✅",
  },
  cancelled: {
    label: "Đã huỷ",
    badge: "bg-gradient-to-r from-rose-500 to-red-500 text-white",
    border: "border-rose-200",
    chip: "bg-rose-100 text-rose-700 border-rose-200",
    bg: "bg-gradient-to-br from-rose-50 to-red-50",
    icon: "✖",
  },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function UserOrdersPage() {
  const { user, loading } = useAuth();
  const [ordersState, setOrdersState] = useState<OrdersState>({ loading: true, data: [] });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string>();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
    }
  }, [loading, user]);

  useEffect(() => {
    if (!user) return;
    let ignore = false;
    (async () => {
      setOrdersState((prev) => ({ ...prev, loading: true, error: undefined }));
      try {
        const res = await api.get("/orders/user", { params: { userId: user._id, limit: 20 } });
        const payload = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
        if (!ignore) {
          setOrdersState({ loading: false, data: payload });
        }
      } catch (err: any) {
        if (!ignore) {
          setOrdersState({ loading: false, data: [], error: err?.message || "Không thể tải lịch sử đơn hàng" });
        }
      }
    })();
    return () => {
      ignore = true;
    };
  }, [user]);

  const filteredOrders = useMemo(() => {
    let orders = ordersState.data;
    if (statusFilter !== "all") {
      orders = orders.filter((o) => o.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      orders = orders.filter((o) => {
        const id = o._id?.toLowerCase() || "";
        const customer = o.customerName?.toLowerCase() || "";
        const items = (o.items || [])
          .map((it) => {
            const item = it.item as any;
            if (!item) return "";
            if (typeof item === "string") return item;
            return item.name?.toLowerCase() || "";
          })
          .join(" ");
        return id.includes(term) || customer.includes(term) || items.includes(term);
      });
    }
    return orders;
  }, [ordersState.data, searchTerm, statusFilter]);

  const handleOpenModal = async (order: Order) => {
    setSelectedOrder(order);
    if (!order?._id) return;
    setModalLoading(true);
    setModalError(undefined);
    try {
      const res = await api.get(`/orders/${order._id}`);
      setSelectedOrder(res.data?.data ?? res.data);
    } catch (err: any) {
      setModalError(err?.message || "Không thể tải chi tiết đơn hàng");
    } finally {
      setModalLoading(false);
    }
  };

  const heroStats = [
    {
      label: "Tổng đơn",
      value: ordersState.data.length,
      subtitle: "Theo dõi toàn bộ lịch sử",
    },
    {
      label: "Đang xử lý",
      value: ordersState.data.filter((o) => o.status === "pending" || o.status === "preparing").length,
      subtitle: "Chờ giao hoặc đang chuẩn bị",
    },
    {
      label: "Đã hoàn tất",
      value: ordersState.data.filter((o) => o.status === "served").length,
      subtitle: "Thưởng thức thành công",
    },
  ];

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50/30 to-white flex items-center justify-center">
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

      <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-8">
        <section className="relative overflow-hidden rounded-4xl border border-amber-200/50 bg-white/80 backdrop-blur-xl p-8 shadow-2xl hover:shadow-amber-200/50 transition-all duration-500 group animate-fade-in">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.4),_transparent_70%)]" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.2),_transparent_60%)]" />
          <div className="relative space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-amber-600 animate-fade-in">
                  <Receipt className="w-4 h-4 animate-pulse" /> Lịch sử mua hàng
                </p>
                <h1 className="text-4xl md:text-5xl font-extrabold mt-2 text-gray-900 animate-slide-up">Đơn hàng gần đây</h1>
                <p className="text-gray-600 mt-2 text-lg animate-slide-up animation-delay-200">Theo dõi tiến độ và kiểm tra lại chi tiết từng lần đặt.</p>
              </div>
              <div className="flex flex-wrap gap-3 animate-slide-up animation-delay-400">
                <Link
                  href="/user/home"
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-amber-200 bg-white/80 backdrop-blur px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-amber-50 hover:border-amber-400 hover:scale-105 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4" /> Về bảng điều khiển
                </Link>
                <Link
                  href="/menu"
                  className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-white px-5 py-3 text-sm font-semibold shadow-lg hover:shadow-amber-400/60 hover:scale-105 transition-all duration-300"
                >
                  Đặt món mới <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {heroStats.map((stat, idx) => (
                <div 
                  key={stat.label} 
                  className="rounded-2xl border border-amber-200/50 bg-white/60 backdrop-blur-xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-scale-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <p className="text-xs uppercase tracking-[0.4em] text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mt-2">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{stat.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-amber-200/50 bg-white/80 backdrop-blur-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 space-y-6 animate-fade-in-up animation-delay-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3 text-gray-700">
              <Filter className="w-5 h-5 text-amber-600" />
              <span className="font-semibold">Lọc nhanh theo trạng thái</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(statusPalette) as StatusFilter[]).map((status) => {
                const palette = statusPalette[status];
                const active = statusFilter === status;
                return (
                  <button
                    key={status}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 border ${
                      active 
                        ? palette.badge + " scale-105 shadow-lg" 
                        : palette.chip + " hover:scale-105 hover:shadow-md"
                    }`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {palette.icon} {palette.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã đơn, tên khách hoặc món ăn..."
              className="w-full bg-white border-2 border-gray-200 rounded-2xl pl-12 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300"
            />
          </div>
        </section>

        <section className="space-y-4">
          {ordersState.loading ? (
            <div className="rounded-3xl border border-amber-200 bg-white/80 backdrop-blur-xl p-10 text-center text-gray-600 animate-pulse">
              Đang tải lịch sử đơn hàng...
            </div>
          ) : ordersState.error ? (
            <div className="rounded-3xl border border-red-300 bg-red-50 p-8 text-red-600 text-center animate-shake">
              {ordersState.error}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-amber-300 bg-white/60 backdrop-blur p-12 text-center text-gray-600 space-y-4 animate-fade-in">
              <UtensilsCrossed className="w-12 h-12 mx-auto text-amber-400 animate-bounce-slow" />
              <p className="text-lg font-semibold">Không tìm thấy đơn hàng nào phù hợp.</p>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-white px-6 py-3 font-semibold shadow-lg hover:shadow-amber-400/60 hover:scale-105 transition-all duration-300"
              >
                Đặt món ngay
              </Link>
            </div>
          ) : (
            filteredOrders.map((order, idx) => {
              const palette = statusPalette[(order.status as StatusFilter) ?? "pending"] || statusPalette.pending;
              const createdAt = order.createdAt ? new Date(order.createdAt) : null;
              const itemsPreview = (order.items || []).slice(0, 3);
              const remaining = (order.items || []).length - itemsPreview.length;
              return (
                <div
                  key={order._id}
                  className={`group rounded-3xl border-2 ${palette.border} ${palette.bg} backdrop-blur-xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-2xl animate-pulse-slow">{palette.icon}</span>
                        <span className="font-semibold">Mã đơn #{order._id?.slice(-6).toUpperCase()}</span>
                      </div>
                      {createdAt && (
                        <p className="text-sm text-gray-500">{createdAt.toLocaleString("vi-VN")}</p>
                      )}
                      <div className="flex flex-wrap gap-2 text-sm">
                        {itemsPreview.map((it, idx) => {
                          const data = it.item as any;
                          const name = typeof data === "string" ? data : data?.name;
                          return (
                            <span key={idx} className="rounded-full bg-white/80 border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:scale-105 transition-transform">
                              {name} × {it.quantity}
                            </span>
                          );
                        })}
                        {remaining > 0 && (
                          <span className="rounded-full bg-white/80 border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700">+{remaining} món khác</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-3">
                      <span className={`px-5 py-2 rounded-full text-sm font-bold shadow-md ${palette.badge} group-hover:scale-105 transition-transform`}>
                        {palette.label}
                      </span>
                      <p className="text-3xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{formatCurrency(order.totalPrice || 0)}</p>
                      <button
                        onClick={() => handleOpenModal(order)}
                        className="rounded-2xl border-2 border-amber-300 bg-white px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-amber-50 hover:border-amber-400 hover:scale-105 transition-all duration-300"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setSelectedOrder(null)} />
          <div className="relative z-10 w-full max-w-2xl rounded-3xl border-2 border-amber-200 bg-white shadow-2xl animate-scale-in mx-4">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-amber-600">Chi tiết đơn</p>
                <h3 className="text-2xl font-bold mt-1 text-gray-900">#{selectedOrder._id?.slice(-6).toUpperCase()}</h3>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="p-2 rounded-full hover:bg-white/80 text-gray-600 hover:text-gray-900 transition-all duration-300 hover:rotate-90"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {modalLoading ? (
                <div className="text-sm text-gray-600 text-center py-8 animate-pulse">Đang tải chi tiết...</div>
              ) : modalError ? (
                <div className="text-sm text-red-600 bg-red-50 p-4 rounded-2xl">{modalError}</div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    <span>{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString("vi-VN") : ""}</span>
                    <span>•</span>
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200">{selectedOrder.status}</span>
                    {selectedOrder.orderType && (
                      <>
                        <span>•</span>
                        <span className="font-medium">{selectedOrder.orderType}</span>
                      </>
                    )}
                  </div>
                  <div className="rounded-2xl border-2 border-gray-200 divide-y divide-gray-200 overflow-hidden">
                    {selectedOrder.items?.map((it, idx) => {
                      const itemObj: any = it.item;
                      const name = typeof itemObj === "string" ? itemObj : itemObj?.name;
                      const image = typeof itemObj === "object" ? itemObj?.images?.[0] || itemObj?.image : undefined;
                      return (
                        <div 
                          key={idx} 
                          className="p-4 flex items-center gap-4 bg-white hover:bg-amber-50/50 transition-colors duration-300"
                        >
                          {image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={image} alt={name} className="h-16 w-16 rounded-xl object-cover shadow-md" />
                          ) : (
                            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 text-xs font-semibold shadow-inner">
                              IMG
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              SL {it.quantity} × {formatCurrency(it.unitPrice || 0)}
                            </p>
                            {it.note && <p className="text-xs text-amber-600 mt-1 italic">Ghi chú: {it.note}</p>}
                          </div>
                          <p className="font-bold text-amber-600">{formatCurrency(it.subtotal || 0)}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200">
                    <span className="text-gray-700 font-semibold">Tổng tiền</span>
                    <span className="text-3xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{formatCurrency(selectedOrder.totalPrice || 0)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

