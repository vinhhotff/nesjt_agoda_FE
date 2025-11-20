"use client";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Foodies
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Experience the finest dining with our curated menu and exceptional service. Your satisfaction is our passion.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: "Home", href: "/" },
                { name: "Menu", href: "/menu" },
                { name: "About Us", href: "/about" },
                { name: "Reservation", href: "/reservation" },
                { name: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-amber-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-amber-400 transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
                <span>123 Restaurant Street, Food District, City 12345</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 hover:text-amber-400 transition-colors">
                <Phone className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <a href="tel:+84123456789">+84 123 456 789</a>
              </li>
              <li className="flex items-center gap-3 text-gray-400 hover:text-amber-400 transition-colors">
                <Mail className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <a href="mailto:info@foodies.com">info@foodies.com</a>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Opening Hours</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex justify-between">
                <span>Monday - Friday</span>
                <span className="text-amber-400 font-semibold">9AM - 10PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span className="text-amber-400 font-semibold">10AM - 11PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span className="text-amber-400 font-semibold">10AM - 9PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2025 Foodies Restaurant. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              Design and coding with <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> by{" "}
              <span className="text-amber-400 font-semibold">VinhIT</span>
            </p>
          </div>
        </div>
      </div>

      {/* Decorative gradient line */}
      <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
    </footer>
  );
}
