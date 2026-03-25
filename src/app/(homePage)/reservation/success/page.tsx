"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Calendar, Clock, Users, MapPin, Phone, ArrowRight, Loader2 } from "lucide-react";

interface BookingInfo {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  tableNumber?: string;
  reservationId?: string;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}

export default function ReservationSuccessPage() {
  const [booking, setBooking] = useState<BookingInfo | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("last_reservation_success");
    if (saved) {
      try {
        setBooking(JSON.parse(saved));
        localStorage.removeItem("last_reservation_success");
      } catch {
        // ignore
      }
    }
  }, []);

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50/30 to-white flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy thông tin đặt bàn</h1>
          <p className="text-gray-600">Có thể bạn đã xem trang này rồi, hoặc liên kết đã hết hạn.</p>
          <Link
            href="/reservation"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-semibold rounded-2xl hover:bg-amber-600 transition-colors"
          >
            Đặt bàn mới
          </Link>
        </div>
      </div>
    );
  }

  const statusSteps = [
    { icon: "📋", label: "Đã gửi yêu cầu", done: true },
    { icon: "⏳", label: "Chờ xác nhận", done: false },
    { icon: "✅", label: "Được xác nhận", done: false },
    { icon: "🍽️", label: "Thưởng thức", done: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50/30 to-white flex items-center justify-center px-4 py-12">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <div className="relative w-full max-w-2xl space-y-8 animate-fade-in">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-xl animate-bounce-in">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Đặt bàn thành công!
          </h1>
          <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
            Yêu cầu đặt bàn của bạn đã được gửi. Nhà hàng sẽ xác nhận trong thời gian sớm nhất.
          </p>
        </div>

        {/* Booking Summary Card */}
        <div className="bg-white rounded-3xl border border-amber-200 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-5 border-b border-amber-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-xl shadow-md">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-600 font-semibold">Thông tin đặt bàn</p>
                <h2 className="font-bold text-gray-900 text-lg">
                  {formatDate(booking.date)}
                  {booking.time ? ` lúc ${booking.time}` : ""}
                </h2>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Users className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Số khách</p>
                  <p className="font-semibold text-gray-900">{booking.guests} người</p>
                </div>
              </div>

              {booking.tableNumber && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Bàn</p>
                    <p className="font-semibold text-gray-900">Bàn {booking.tableNumber}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Liên hệ</p>
                  <p className="font-semibold text-gray-900">{booking.phone}</p>
                </div>
              </div>

              {booking.time && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Giờ</p>
                    <p className="font-semibold text-gray-900">{booking.time}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Status Progress */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="text-base">📍</span> Theo dõi trạng thái
              </p>
              <div className="flex items-center justify-between">
                {statusSteps.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md transition-all ${
                      step.done
                        ? "bg-gradient-to-br from-amber-400 to-yellow-500"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      {step.icon}
                    </div>
                    <p className={`text-xs font-medium text-center ${
                      step.done ? "text-amber-700" : "text-gray-400"
                    }`}>{step.label}</p>
                    {idx < statusSteps.length - 1 && (
                      <div className={`absolute h-0.5 w-full -translate-y-12 ${
                        step.done ? "bg-amber-300" : "bg-gray-200"
                      }`} style={{ width: "calc(100% - 2.5rem)", left: "1.25rem" }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5">
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong>📞 Nhà hàng sẽ gọi điện xác nhận</strong> trong vòng <strong>30 phút</strong>.<br/>
            Nếu không nhận được cuộc gọi, vui lòng liên hệ <strong>hotline nhà hàng</strong> để được hỗ trợ.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/user/reservations?phone=${encodeURIComponent(booking.phone)}`}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-amber-400/40 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <ArrowRight className="w-5 h-5" />
            Xem đơn đặt bàn của tôi
          </Link>

          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-amber-200 text-gray-900 font-semibold rounded-2xl hover:bg-amber-50 hover:border-amber-400 transition-all duration-300"
          >
            🪄 Xem thực đơn
          </Link>
        </div>

        <p className="text-center text-sm text-gray-500">
          Bạn cũng có thể <Link href="/contact" className="text-amber-600 hover:underline font-medium">liên hệ trực tiếp</Link> với nhà hàng.
        </p>
      </div>
    </div>
  );
}
