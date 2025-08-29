"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

const ContactPage = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Kiểm tra từng field
    if (!form.name.trim()) {
      toast.error("Name cannot be empty!");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Email cannot be empty!");
      return;
    }
    if (!form.subject.trim()) {
      toast.error("Subject cannot be empty!");
      return;
    }
    if (!form.message.trim()) {
      toast.error("Message cannot be empty!");
      return;
    }

    console.log("Submit form:", form);
    toast.success("Your message has been sent!");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-[120vh] bg-black text-white pb-20">
      {/* Header image + h1 overlay */}
      <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh]">
        <Image
          src="./contactimg.jpg"
          alt="contact"
          fill
          className="object-cover"
        />
        <h1 className="absolute inset-0 flex items-center justify-center text-4xl md:text-5xl lg:text-6xl font-bold bg-black/50 text-white hover:text-yellow-500 transition-colors duration-300 cursor-pointer">
          Contact Us
        </h1>
      </div>

      {/* Content: info + form */}
      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-8 text-gray-300 mt-30">
        {/* Thông tin liên hệ */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-yellow-500">Keep Close</h2>
          <h3 className="text-2xl font-bold">Get In Touch</h3>
          <p className="text-sm">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean quis
            pellentesque magna.
          </p>
          <div className="space-y-4">
            <p>
              <span className="text-yellow-500">📍</span> 88/13 Hoang Van Thu,
              Quy Nhon Nam
            </p>
            <p>
              <span className="text-yellow-500">📞</span> (+62) 111 222 333 44
            </p>
            <p>
              <span className="text-yellow-500">📧</span> Thanvinh1602@gmail.com
            </p>
            <p>
              <span className="text-yellow-500">⏰</span> Open 04:00 AM WITA -
              Closed 01:00 AM WITA
            </p>
          </div>
        </div>

        {/* Form liên hệ */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold text-yellow-500">
            Your Details
          </h2>
          <p className="text-sm">Let us know how to get back to you</p>
          <input
            type="text"
            name="name"
            placeholder="Name *"
            value={form.name}
            onChange={handleChange}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address *"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
          <input
            type="text"
            name="subject"
            placeholder="Subject *"
            value={form.subject}
            onChange={handleChange}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
          <textarea
            name="message"
            placeholder="Comments / Questions *"
            value={form.message}
            onChange={handleChange}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            rows={5}
            required
          />
          <button
            type="submit"
            className="px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition w-full"
          >
            Contact Us
          </button>
        </form>
      </div>

      {/* Reservation Section */}
      <div className="relative w-full h-[40vh] md:h-[50vh] lg:h-[60vh] mt-10 mb-15">
        <Image
          src="./food.jpg"
          alt="reservation"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-black/50">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold hover:text-yellow-500 cursor-pointer">
            Reserve A Table Now
          </h2>
          <button
            className="mt-8 px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition cursor-pointer"
            onClick={() => router.replace("/reservation")}
          >
            Make A Reservation
          </button>
        </div>
      </div>

      {/* Bản đồ */}
      <div className="w-full max-w-5xl mt-8 h-46 md:h-[400px] lg:h-[500px] mx-auto rounded-xl overflow-hidden shadow-lg">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.274083222838!2d109.20711867473939!3d13.76233809705014!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x316f6cc044ed95e9%3A0xa7f84878c057d97b!2zODgtMTAgxJAuIEhvw6BuZyBWxINuIFRo4bulLCBRdWFuZyBUcnVuZywgUXV5IE5oxqFuLCBCw6xuaCDEkOG7i25oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1756400820415!5m2!1svi!2s"
          className="w-full h-full border-0"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default ContactPage;
