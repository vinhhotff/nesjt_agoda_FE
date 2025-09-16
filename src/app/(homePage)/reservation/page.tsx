"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";

export default function ReservationPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
    guests: 1,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const reservationDateTime = new Date(`${form.date}T${form.time}`);

    // kiểm tra nếu người dùng chưa nhập đầy đủ
    if (!form.name || !form.email || !form.date || !form.time) {
      toast.error("Please fill in all required fields!");
      return;
    }

    // kiểm tra ngày giờ phải ở tương lai
    if (reservationDateTime <= now) {
      toast.error("Reservation date and time must be in the future!");
      return;
    }

    toast.success("Your reservation has been submitted!");
    setForm({ name: "", email: "", date: "", time: "", guests: 1 });
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
            placeholder="Email *"
            value={form.email}
            onChange={handleChange}
            className="w-full mb-4 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
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
            value={form.guests}
            onChange={handleChange}
            className="w-full mb-6 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />

          <button
            type="submit"
            className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-lg hover:bg-yellow-600 transition"
          >
            Book Now
          </button>
        </form>

        {/* Image */}
        <div className="relative w-full h-[500px] flex items-center justify-center animate-float">
          <Image
            src="/restaurant.jpg"
            alt="Restaurant table"
            fill
            className="rounded-2xl shadow-lg object-cover"
          />
        </div>
      </div>
    </div>
  );
}
