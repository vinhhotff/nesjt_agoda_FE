"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { reservationsAPI } from "@/src/lib/api/reservationsApi";
import { useAuth } from "@/src/Context/AuthContext";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  RefreshCw,
  History,
  ArrowLeft,
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Reservation = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReservationStatus = any;

const statusConfig: Record<
  ReservationStatus,
  { label: string; badge: string; border: string; bg: string; text: string; icon: string }
> = {
  pending: {
    label: "Chờ xác nhận",
    badge: "bg-yellow-100 text-yellow-700 border-yellow-300",
    border: "border-l-yellow-500",
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    icon: "⏳",
  },
  pending_approval: {
    label: "Chờ phê duyệt",
    badge: "bg-orange-100 text-orange-700 border-orange-300",
    border: "border-l-orange-500",
    bg: "bg-orange-50",
    text: "text-orange-600",
    icon: "⏳",
  },
  confirmed: {
    label: "Đã xác nhận",
    badge: "bg-blue-100 text-blue-700 border-blue-300",
    border: "border-l-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-600",
    icon: "✅",
  },
  arrived: {
    label: "Đã đến",
    badge: "bg-purple-100 text-purple-700 border-purple-300",
    border: "border-l-purple-500",
    bg: "bg-purple-50",
    text: "text-purple-600",
    icon: "🟣",
  },
  seated: {
    label: "Đã ngồi",
    badge: "bg-indigo-100 text-indigo-700 border-indigo-300",
    border: "border-l-indigo-500",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    icon: "🪑",
  },
  completed: {
    label: "Hoàn thành",
    badge: "bg-green-100 text-green-700 border-green-300",
    border: "border-l-green-500",
    bg: "bg-green-50",
    text: "text-green-600",
    icon: "🎉",
  },
  cancelled: {
    label: "Đã hủy",
    badge: "bg-gray-100 text-gray-500 border-gray-300",
    border: "border-l-gray-400",
    bg: "bg-gray-50",
    text: "text-gray-500",
    icon: "❌",
  },
  no_show: {
    label: "Không đến",
    badge: "bg-red-100 text-red-600 border-red-300",
    border: "border-l-red-500",
    bg: "bg-red-50",
    text: "text-red-600",
    icon: "😢",
  },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(reservationDate: string) {
  if (!reservationDate) return "";
  const date = new Date(reservationDate);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export default function UserReservationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [phone, setPhone] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  /** Banner xác nhận đặt bàn thành công */
  const [justBooked, setJustBooked] = useState(false);

  // Auto-load: ưu tiên URL ?phone=, rồi localStorage, rồi logged-in user
  useEffect(() => {
    if (authLoading) return;

    // 1. URL query param
    const params = new URLSearchParams(window.location.search);
    const urlPhone = params.get("phone");

    // 2. localStorage (từ trang success vừa đặt bàn)
    let lsPhone: string | null = null;
    try {
      const saved = localStorage.getItem("last_reservation_success");
      if (saved) lsPhone = JSON.parse(saved).phone;
    } catch { }

    const targetPhone = urlPhone || lsPhone || user?.phone || "";

    if (targetPhone) {
      setPhone(targetPhone);
      setPhoneInput(targetPhone);
      fetchReservations(targetPhone);

      // Nếu có trong localStorage → hiện banner, rồi xóa để không hiện lại
      if (lsPhone) {
        setJustBooked(true);
        localStorage.removeItem("last_reservation_success");
        setTimeout(() => setJustBooked(false), 8000);
      }
    }
  }, [authLoading, user]);

  async function fetchReservations(p: string) {
    if (!p?.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await reservationsAPI.getByPhone(p.trim());
      setReservations(data ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Không thể tải danh sách đặt bàn.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPhone(phoneInput);
    fetchReservations(phoneInput);
  }

  function handleRefresh() {
    if (phone) fetchReservations(phone);
  }

  const pending = reservations.filter((r) => ["pending", "pending_approval"].includes(r.status));
  const active = reservations.filter((r) =>
    ["confirmed", "arrived", "seated"].includes(r.status)
  );
  const done = reservations.filter((r) =>
    ["completed", "cancelled", "no_show"].includes(r.status)
  );

  function StatusBadge({ status }: { status: ReservationStatus }) {
    const cfg = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}>
        <span>{cfg.icon}</span>
        {cfg.label}
      </span>
    );
  }

  function ReservationCard({ reservation }: { reservation: Reservation }) {
    const cfg = statusConfig[reservation.status] || statusConfig.pending;
    const guests = reservation.numberOfGuests || reservation.partySize || 0;

    return (
      <button
        onClick={() => setSelectedReservation(reservation)}
        className={`w-full text-left rounded-2xl border-l-4 ${cfg.border} ${cfg.bg} border border-gray-200 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-900">
                {formatDate(reservation.reservationDate)}
              </span>
              {reservation.reservationTime && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-700 font-medium">{reservation.reservationTime}</span>
                </>
              )}
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 text-sm flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {guests} khách
              </span>
            </div>

            {reservation.tableNumber && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <MapPin className="w-3.5 h-3.5" />
                Bàn {reservation.tableNumber}
              </div>
            )}

            {reservation.isDepositPaid && (
              <div className="flex items-center gap-1.5 text-xs text-blue-600">
                <CheckCircle className="w-3.5 h-3.5" />
                Đã đặt cọc {formatCurrency(reservation.depositPaid || 0)}
              </div>
            )}

            {reservation.items && reservation.items.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-orange-600">
                <span className="text-base">🍽️</span>
                {reservation.items.length} món • {formatCurrency(reservation.totalAmount || 0)}
              </div>
            )}

            {reservation.status === "cancelled" && reservation.specialRequests && (
              <div className="text-xs text-gray-500 italic truncate">
                {reservation.specialRequests}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={reservation.status} />
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </button>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50/30 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50/30 to-white">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:-translate-x-0.5 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-600 font-semibold">Tài khoản</p>
            <h1 className="text-3xl font-extrabold text-gray-900">Đơn đặt bàn của tôi</h1>
          </div>
        </div>

        {/* Success Banner — hiện khi vừa đặt bàn thành công */}
        {justBooked && (
          <div className="flex items-start gap-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-5 shadow-lg animate-fade-in">
            <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-md">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-green-800 text-lg">Đặt bàn thành công!</p>
              <p className="text-sm text-green-700 mt-1 leading-relaxed">
                Yêu cầu đã được gửi. Nhà hàng sẽ gọi điện xác nhận trong <strong>30 phút</strong>.
                Bạn có thể xem trạng thái đơn bên dưới.
              </p>
            </div>
            <button
              onClick={() => setJustBooked(false)}
              className="flex-shrink-0 p-1 text-green-400 hover:text-green-600 transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Search form */}
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 flex flex-col sm:flex-row gap-4"
        >
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              Số điện thoại đã đặt bàn
            </label>
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="Nhập số điện thoại đã dùng khi đặt bàn..."
              className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
              required
            />
          </div>
          <div className="flex items-end gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-amber-200/60 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="text-lg">🔍</span>
              )}
              Tra cứu
            </button>
            {phone && (
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="p-3.5 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-all disabled:opacity-50"
                title="Làm mới"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? "animate-spin" : ""}`} />
              </button>
            )}
          </div>
        </form>

        {/* Results */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 flex items-start gap-3">
            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Lỗi</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {!loading && phone && reservations.length === 0 && !error && (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-3xl">📋</div>
            <div>
              <p className="text-lg font-semibold text-gray-700">Chưa có đặt bàn nào</p>
              <p className="text-sm text-gray-500 mt-1">
                Không tìm thấy đặt bàn nào cho số điện thoại "{phone}".
              </p>
            </div>
            <button
              onClick={() => router.push("/reservation")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Đặt bàn ngay
            </button>
          </div>
        )}

        {!loading && reservations.length > 0 && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Chờ duyệt", value: pending.length, color: "from-yellow-100 to-yellow-50", text: "text-yellow-600" },
                { label: "Đang hoạt động", value: active.length, color: "from-blue-100 to-blue-50", text: "text-blue-600" },
                { label: "Đã kết thúc", value: done.length, color: "from-gray-100 to-gray-50", text: "text-gray-500" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-2xl border border-gray-200 bg-gradient-to-br ${stat.color} p-4 text-center`}
                >
                  <p className={`text-3xl font-black ${stat.text}`}>{stat.value}</p>
                  <p className="text-xs font-semibold text-gray-600 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Pending */}
            {pending.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-xl font-bold text-gray-900">Chờ xác nhận</h2>
                </div>
                <div className="space-y-3">
                  {pending.map((r) => (
                    <ReservationCard key={r._id} reservation={r} />
                  ))}
                </div>
              </section>
            )}

            {/* Active */}
            {active.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-bold text-gray-900">Đã xác nhận / Đang phục vụ</h2>
                </div>
                <div className="space-y-3">
                  {active.map((r) => (
                    <ReservationCard key={r._id} reservation={r} />
                  ))}
                </div>
              </section>
            )}

            {/* Done */}
            {done.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-gray-500" />
                  <h2 className="text-xl font-bold text-gray-900">Lịch sử</h2>
                </div>
                <div className="space-y-3">
                  {done.map((r) => (
                    <ReservationCard key={r._id} reservation={r} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 p-6 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold">Chi tiết đặt bàn</p>
                <p className="text-xs text-gray-400 mt-1">#{selectedReservation._id.slice(-8).toUpperCase()}</p>
              </div>
              <button
                onClick={() => setSelectedReservation(null)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status */}
              <div className={`rounded-2xl border ${statusConfig[selectedReservation.status]?.bg} border-gray-200 p-4`}>
                <StatusBadge status={selectedReservation.status} />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-xs text-gray-500">Ngày</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(selectedReservation.reservationDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-xs text-gray-500">Giờ</p>
                    <p className="font-semibold text-gray-900">
                      {formatTime(selectedReservation.reservationDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-3">
                {[
                  { label: "Tên khách", value: selectedReservation.customerName },
                  { label: "Số khách", value: `${selectedReservation.numberOfGuests || selectedReservation.partySize || 0} người` },
                  { label: "Bàn", value: selectedReservation.tableNumber ? `Bàn ${selectedReservation.tableNumber}` : "Chưa chọn bàn" },
                  selectedReservation.isDepositPaid && {
                    label: "Đặt cọc",
                    value: `${formatCurrency(selectedReservation.depositPaid || 0)} (${selectedReservation.depositPaymentMethod || "—"})`,
                  },
                ]
                  .filter(Boolean)
                  .map((item: any) => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{item.label}</span>
                      <span className="font-semibold text-gray-900">{item.value}</span>
                    </div>
                  ))}
              </div>

              {/* Deposit info */}
              {!selectedReservation.isDepositPaid && selectedReservation.status === "pending" && (
                <div className="rounded-xl border border-dashed border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-700">
                  <p className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Đơn đang chờ nhà hàng xác nhận. Bạn sẽ được thông báo khi đặt bàn được duyệt.
                  </p>
                </div>
              )}

              {/* Menu Items */}
              {selectedReservation.items && selectedReservation.items.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500 mb-3 font-semibold flex items-center gap-2">
                    <span className="text-base">🍽️</span> Món đã đặt ({selectedReservation.items.length} món)
                  </p>
                  <div className="space-y-3">
                    {selectedReservation.items.map((item: any, idx: number) => {
                      const itemDetails = typeof item.item === 'object' ? item.item : null;
                      const itemName = itemDetails?.name || item.menuItemName || `Món #${idx + 1}`;
                      const itemImg = itemDetails?.images?.[0] || itemDetails?.image;

                      return (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-xl p-3">
                          <div className="flex items-center gap-3">
                            {itemImg ? (
                              <img src={itemImg} alt={itemName} className="w-14 h-14 object-cover rounded-lg shadow-sm" />
                            ) : (
                              <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-[10px] text-center shadow-sm">
                                No image
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800">
                                {itemName}
                              </span>
                              <span className="text-xs text-gray-500 mt-0.5">
                                Đơn giá: {item.unitPrice?.toLocaleString('vi-VN')} VNĐ
                              </span>
                              {item.note && (
                                <span className="text-xs text-orange-600 mt-1 italic">
                                  * {item.note}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="bg-white px-2 py-0.5 rounded-md border border-gray-200 text-xs font-semibold text-gray-600 shadow-sm">
                              x {item.quantity}
                            </div>
                            <span className="text-sm text-green-600 font-bold">
                              {item.subtotal?.toLocaleString('vi-VN')} VNĐ
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {selectedReservation.totalAmount > 0 && (
                      <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200 mt-2">
                        <span className="text-sm font-bold text-gray-900">Tổng cộng</span>
                        <span className="text-base font-bold text-amber-600">
                          {formatCurrency(selectedReservation.totalAmount)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Special requests */}
              {selectedReservation.specialRequests && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500 mb-1">Yêu cầu đặc biệt</p>
                  <p className="text-sm text-gray-700">{selectedReservation.specialRequests}</p>
                </div>
              )}

              {/* Rejection reason */}
              {selectedReservation.rejectedReason && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-xs text-red-500 mb-1">Lý do từ chối</p>
                  <p className="text-sm text-red-700">{selectedReservation.rejectedReason}</p>
                </div>
              )}

              {/* Status history */}
              {selectedReservation.statusHistory && selectedReservation.statusHistory.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500 mb-3 font-semibold">Lịch sử trạng thái</p>
                  <div className="space-y-2">
                    {[...selectedReservation.statusHistory].reverse().map((h, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                        <div className="flex-1">
                          <p className="text-gray-700">
                            <span className="font-medium">
                              {statusConfig[h.status as ReservationStatus]?.label || h.status}
                            </span>
                            {h.note && <span className="text-gray-400"> — {h.note}</span>}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(h.timestamp).toLocaleString("vi-VN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {["pending", "pending_approval"].includes(selectedReservation.status) && (
                  <button
                    onClick={handleRefresh}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Làm mới
                  </button>
                )}
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
