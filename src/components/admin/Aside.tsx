"use client";

import { useAuth } from "../../Context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/menu-items", label: "Menu Items" },
  { href: "/admin/vouchers", label: "Voucher Management" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/revenue", label: "Revenue" },
];

const Aside = () => {
  const { user, logoutUser } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile menu button (top-left corner) */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-[#101826] text-white shadow-md hover:bg-[#1c2535] transition"
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>



      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-64 bg-[#101826] text-white shadow-lg transform transition-transform duration-300 z-40
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Top: Logo + Nav */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
            <div className="text-2xl font-bold mb-8 tracking-wide flex items-center">
              <span className="mr-3">🍽️</span> Admin Panel
            </div>
            <nav className="space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`block py-2 px-4 rounded-lg font-medium transition ${isActive
                        ? "bg-[#edb021] text-[#101826] font-bold"
                        : "text-white hover:bg-[#edb021] hover:text-[#101826]"
                      }`}
                  >
                    {link.label}
                  </Link>

                );
              })}
            </nav>
          </div>

          {/* Bottom: User info + Logout */}
          {user && (
            <div className="border-t border-amber-300 pt-4 sticky bottom-0 bg-[#101826]">
              <div className="font-bold text-sm">{user.name}</div>
              <div className="text-xs">({user.email})</div>
              <div className="mt-1 text-orange-300 text-xs">
                Role: {user.role}
              </div>
              <button
                onClick={() => logoutUser()}
                className="mt-4 w-full py-2 px-4 bg-red-500 hover:bg-red-600 rounded text-sm font-semibold transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay when mobile menu is open */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-40 md:hidden z-30"
        />
      )}
    </>
  );
};

export default Aside;
