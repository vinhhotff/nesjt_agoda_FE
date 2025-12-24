"use client";

// PUBLIC PAGE - No authentication required
// This page allows guests to make reservations without logging in

import Image from "next/image";
import { useState } from "react";
import { toast } from "@/src/lib/utils/toast";
import { reservationsAPI, CreateReservationDto } from "@/src/lib/api/reservationsApi";
import TableSelectionModal from "@/src/components/reservations/TableSelectionModal";
import { createPayOSPaymentLink } from "@/src/lib/api/payosApi";
import { MapPin, Calendar, Clock, Users, Mail, Phone, User, MessageSquare, Sparkles, AlertCircle } from "lucide-react";

export default function ReservationPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: 1,
    specialRequests: "",
    tableNumber: "",
    tableId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const now = new Date();
    const reservationDateTime = new Date(`${form.date}T${form.time}`);

    // kiểm tra nếu người dùng chưa nhập đầy đủ
    if (!form.name || !form.phone || !form.date || !form.time) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc!");
      setIsSubmitting(false);
      return;
    }

    // kiểm tra ngày giờ phải ở tương lai
    if (reservationDateTime <= now) {
      toast.error("Ngày và giờ đặt bàn phải ở tương lai!");
      setIsSubmitting(false);
      return;
    }

    // Nếu đã chọn bàn nhưng chưa có date/time, báo lỗi
    if (form.tableNumber && (!form.date || !form.time)) {
      toast.error("Vui lòng chọn ngày và giờ trước khi chọn bàn!");
      setIsSubmitting(false);
      return;
    }

    // Nếu đã chọn bàn, cần thanh toán 300k trước
    if (form.tableNumber) {
      try {
        // Combine date and time into ISO string format
        const reservationDate = `${form.date}T${form.time}:00`;

        // Prepare reservation data
        const reservationData: CreateReservationDto = {
          customerName: form.name,
          customerPhone: form.phone,
          customerEmail: form.email || undefined,
          reservationDate: reservationDate,
          numberOfGuests: form.guests,
          specialRequests: form.specialRequests || undefined,
          tableNumber: form.tableNumber,
        };

        // Lưu reservation data vào localStorage để tạo sau khi payment thành công
        const reservationId = `reservation_${Date.now()}`;
        localStorage.setItem('pending_reservation', JSON.stringify({
          reservationId,
          reservationData,
        }));

        // Tạo payment link với PayOS (300,000 VND = 300k)
        const depositAmount = 300000;
        toast.info("Đang tạo liên kết thanh toán...");
        
        const paymentLinkResponse = await createPayOSPaymentLink({
          orderId: reservationId,
          amount: depositAmount,
          description: `Đặt cọc giữ bàn ${form.tableNumber} - ${form.name}`,
          returnUrl: `${window.location.origin}/payment/reservation-callback?reservationId=${reservationId}`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
        });

        if (paymentLinkResponse.success && paymentLinkResponse.paymentLink) {
          toast.success("Vui lòng thanh toán 300,000 VND để giữ bàn. Đang chuyển hướng...");
          // Redirect to PayOS payment page
          window.location.href = paymentLinkResponse.paymentLink;
        } else {
          throw new Error(paymentLinkResponse.message || 'Không thể tạo liên kết thanh toán');
        }
      } catch (error: any) {
        console.error("Error creating payment link:", error);
        const errorMessage = error.message || error.response?.data?.message || "Có lỗi xảy ra khi tạo liên kết thanh toán. Vui lòng thử lại.";
        toast.error(errorMessage);
        localStorage.removeItem('pending_reservation');
        setIsSubmitting(false);
      }
    } else {
      // Nếu không chọn bàn, tạo reservation trực tiếp (không cần thanh toán)
      try {
        const reservationDate = `${form.date}T${form.time}:00`;

        const reservationData: CreateReservationDto = {
          customerName: form.name,
          customerPhone: form.phone,
          customerEmail: form.email || undefined,
          reservationDate: reservationDate,
          numberOfGuests: form.guests,
          specialRequests: form.specialRequests || undefined,
        };

        await reservationsAPI.createReservationPublic(reservationData);

        toast.success("Đặt bàn của bạn đã được gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.");
        setForm({ name: "", email: "", phone: "", date: "", time: "", guests: 1, specialRequests: "", tableNumber: "", tableId: "" });
      } catch (error: any) {
        console.error("Error creating reservation:", error);
        const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra khi gửi đặt bàn. Vui lòng thử lại.";
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Hero Section */}
      <div className="relative h-[50vh] overflow-hidden">
        <Image
          src="/restaurant.jpg"
          alt="Reserve Your Table"
          fill
          unoptimized
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-6 px-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium">
              <Sparkles size={16} />
              <span>Book Your Experience</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
              Reserve a Table
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Secure your spot for an unforgettable dining experience
            </p>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="rgb(248, 250, 252)"/>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Image Section - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image with Parallax Effect */}
            <div className="relative h-[400px] rounded-3xl overflow-hidden group shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
              <Image
                src="/restaurant.jpg"
                alt="Restaurant Interior"
                fill
                unoptimized
                className="object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 transform group-hover:translate-y-0 translate-y-2 transition-transform duration-500">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-12 h-1 bg-yellow-500 rounded-full" />
                    <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                  </div>
                  <h3 className="text-3xl font-bold text-white">Elegant Dining</h3>
                  <p className="text-white/90 text-lg">Perfect ambiance for every occasion</p>
                </div>
              </div>
            </div>

            {/* Additional Images Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative h-[180px] rounded-2xl overflow-hidden group">
                <Image
                  src="/food.jpg"
                  alt="Delicious Food"
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-semibold text-sm">Exquisite Cuisine</p>
                </div>
              </div>
              <div className="relative h-[180px] rounded-2xl overflow-hidden group">
                <Image
                  src="/restaurant.jpg"
                  alt="Cozy Atmosphere"
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-semibold text-sm">Warm Atmosphere</p>
                </div>
              </div>
            </div>

            {/* Policy Card with Animation */}
            <div className="bg-gradient-to-br from-yellow-50 via-yellow-50 to-yellow-100/50 rounded-3xl border-2 border-yellow-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-md">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">Reservation Policy</h3>
                  <ul className="text-sm text-gray-700 space-y-3">
                    <li className="flex items-start gap-3 group/item">
                      <span className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold text-xs group-hover/item:bg-yellow-500 group-hover/item:text-white transition-colors">
                        1
                      </span>
                      <span className="leading-relaxed">Select a specific table requires 300,000 VND deposit</span>
                    </li>
                    <li className="flex items-start gap-3 group/item">
                      <span className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold text-xs group-hover/item:bg-yellow-500 group-hover/item:text-white transition-colors">
                        2
                      </span>
                      <span className="leading-relaxed">General reservations are free (no table selection)</span>
                    </li>
                    <li className="flex items-start gap-3 group/item">
                      <span className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold text-xs group-hover/item:bg-yellow-500 group-hover/item:text-white transition-colors">
                        3
                      </span>
                      <span className="leading-relaxed">We'll contact you to confirm your booking</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section - 3 columns */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Reservation Details</h2>
                  <p className="text-sm text-gray-600 mt-1">Fill in your information below</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Name */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 group-focus-within:text-yellow-600 transition-colors">
                    <div className="p-1.5 bg-gray-100 rounded-lg group-focus-within:bg-yellow-100 transition-colors">
                      <User size={16} className="text-gray-600 group-focus-within:text-yellow-600 transition-colors" />
                    </div>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 focus:bg-white transition-all hover:border-gray-300"
                    required
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 group-focus-within:text-yellow-600 transition-colors">
                      <div className="p-1.5 bg-gray-100 rounded-lg group-focus-within:bg-yellow-100 transition-colors">
                        <Mail size={16} className="text-gray-600 group-focus-within:text-yellow-600 transition-colors" />
                      </div>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 focus:bg-white transition-all hover:border-gray-300"
                    />
                  </div>

                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 group-focus-within:text-yellow-600 transition-colors">
                      <div className="p-1.5 bg-gray-100 rounded-lg group-focus-within:bg-yellow-100 transition-colors">
                        <Phone size={16} className="text-gray-600 group-focus-within:text-yellow-600 transition-colors" />
                      </div>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="0123456789"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 focus:bg-white transition-all hover:border-gray-300"
                      required
                    />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 group-focus-within:text-yellow-600 transition-colors">
                      <div className="p-1.5 bg-gray-100 rounded-lg group-focus-within:bg-yellow-100 transition-colors">
                        <Calendar size={16} className="text-gray-600 group-focus-within:text-yellow-600 transition-colors" />
                      </div>
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 focus:bg-white transition-all hover:border-gray-300"
                      required
                    />
                  </div>

                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 group-focus-within:text-yellow-600 transition-colors">
                      <div className="p-1.5 bg-gray-100 rounded-lg group-focus-within:bg-yellow-100 transition-colors">
                        <Clock size={16} className="text-gray-600 group-focus-within:text-yellow-600 transition-colors" />
                      </div>
                      Time *
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={form.time}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 focus:bg-white transition-all hover:border-gray-300"
                      required
                    />
                  </div>
                </div>

                {/* Number of Guests */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 group-focus-within:text-yellow-600 transition-colors">
                    <div className="p-1.5 bg-gray-100 rounded-lg group-focus-within:bg-yellow-100 transition-colors">
                      <Users size={16} className="text-gray-600 group-focus-within:text-yellow-600 transition-colors" />
                    </div>
                    Number of Guests *
                  </label>
                  <input
                    type="number"
                    name="guests"
                    min="1"
                    max="20"
                    placeholder="2"
                    value={form.guests}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 focus:bg-white transition-all hover:border-gray-300"
                    required
                  />
                </div>

                {/* Special Requests */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 group-focus-within:text-yellow-600 transition-colors">
                    <div className="p-1.5 bg-gray-100 rounded-lg group-focus-within:bg-yellow-100 transition-colors">
                      <MessageSquare size={16} className="text-gray-600 group-focus-within:text-yellow-600 transition-colors" />
                    </div>
                    Special Requests (Optional)
                  </label>
                  <textarea
                    name="specialRequests"
                    placeholder="Any dietary restrictions or special occasions?"
                    value={form.specialRequests}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 focus:bg-white transition-all resize-none hover:border-gray-300"
                  />
                </div>

                {/* Table Selection */}
                <div className="group/table">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    <div className="p-1.5 bg-gray-100 rounded-lg">
                      <MapPin size={16} className="text-gray-600" />
                    </div>
                    Select Table (Optional)
                  </label>
                  <div
                    onClick={() => {
                      // Allow opening modal even without date/time - validation will happen on submit
                      setShowTableModal(true);
                    }}
                    className="relative w-full px-5 py-4 bg-gradient-to-br from-gray-50 to-gray-100/50 border-2 border-gray-200 rounded-2xl hover:from-yellow-50 hover:to-yellow-100/50 hover:border-yellow-400 transition-all text-left flex items-center justify-between cursor-pointer group/btn shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-yellow-100 group-hover/btn:bg-yellow-500 rounded-xl transition-all shadow-sm group-hover/btn:scale-110">
                        <MapPin className="w-5 h-5 text-yellow-600 group-hover/btn:text-white transition-colors" />
                      </div>
                      <div>
                        <span className="text-gray-900 font-bold block">
                          {form.tableNumber ? `Table ${form.tableNumber}` : 'Choose a table'}
                        </span>
                        {form.tableNumber && (
                          <span className="text-xs text-gray-600">Click to change selection</span>
                        )}
                      </div>
                    </div>
                    {form.tableNumber && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setForm({ ...form, tableNumber: '', tableId: '' });
                          // No toast - user can see the change visually
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {!form.tableNumber && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-xs text-blue-700 flex items-start gap-2">
                        <span className="text-base">💡</span>
                        <span className="leading-relaxed">Select a specific table to guarantee your seat. Requires 300,000 VND deposit.</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Deposit Notice */}
                {form.tableNumber && (
                  <div className="p-5 bg-gradient-to-br from-yellow-50 via-yellow-50 to-yellow-100/50 border-2 border-yellow-400 rounded-2xl shadow-lg animate-fade-in">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-md">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                          Deposit Required
                          <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">Required</span>
                        </p>
                        <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                          You've selected <strong className="text-yellow-700">Table {form.tableNumber}</strong>. To secure this table, a deposit of <strong className="text-yellow-700 text-base">300,000 VND</strong> is required via PayOS.
                        </p>
                        <div className="flex items-start gap-2 p-3 bg-yellow-100/50 rounded-lg">
                          <span className="text-yellow-600">⚠️</span>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            Your reservation will be automatically confirmed after successful payment.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : form.tableNumber ? (
                    <>
                      <Calendar className="w-6 h-6" />
                      Pay 300k to Reserve Table
                    </>
                  ) : (
                    <>
                      <Calendar className="w-6 h-6" />
                      Book Now
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Table Selection Modal */}
      <TableSelectionModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onSelectTable={(tableId, tableName) => {
          setForm({ ...form, tableId, tableNumber: tableName });
          setShowTableModal(false);
        }}
        selectedTableId={form.tableId}
        numberOfGuests={form.guests}
        reservationDate={form.date}
        reservationTime={form.time}
      />
    </div>
  );
}
