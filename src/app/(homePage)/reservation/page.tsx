"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";
import { reservationsAPI } from "@/src/lib/api/reservationsApi";

export default function ReservationPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: 1,
    specialRequests: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    try {
      // Combine date and time into ISO string format
      const reservationDate = `${form.date}T${form.time}:00`;

      // Prepare data according to backend DTO
      const reservationData = {
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email || undefined,
        reservationDate: reservationDate,
        numberOfGuests: form.guests,
        specialRequests: form.specialRequests || undefined,
      };

      await reservationsAPI.createReservationPublic(reservationData);

      toast.success("Đặt bàn của bạn đã được gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.");
      setForm({ name: "", email: "", phone: "", date: "", time: "", guests: 1, specialRequests: "" });
    } catch (error: any) {
      console.error("Error creating reservation:", error);
      const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra khi gửi đặt bàn. Vui lòng thử lại.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-6 pt-20">
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 p-8 rounded-2xl shadow-lg"
        >
          <h2 className="text-3xl font-bold mb-6">Reserve a Table</h2>

          <input
            type="text"
            name="name"
            placeholder="Name *"
            value={form.name}
            onChange={handleChange}
            className="w-full mb-4 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full mb-4 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />

          <input
            type="tel"
            name="phone"
            placeholder="Số điện thoại *"
            value={form.phone}
            onChange={handleChange}
            className="w-full mb-4 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full mb-4 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />

          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            className="w-full mb-4 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />

          <input
            type="number"
            name="guests"
            min="1"
            max="20"
            placeholder="Số lượng khách *"
            value={form.guests}
            onChange={handleChange}
            className="w-full mb-4 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />

          <textarea
            name="specialRequests"
            placeholder="Yêu cầu đặc biệt (tùy chọn)"
            value={form.specialRequests}
            onChange={handleChange}
            rows={3}
            className="w-full mb-6 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-lg hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Đang gửi..." : "Đặt Bàn Ngay"}
          </button>
        </form>

        {/* Image */}
        <div className="relative w-full h-[500px] flex items-center justify-center animate-float">
          <Image
            src="/restaurant.jpg"
            alt="Restaurant table"
            fill
            unoptimized
            className="rounded-2xl shadow-lg object-cover"
          />
        </div>
      </div>
    </div>
  );
}
