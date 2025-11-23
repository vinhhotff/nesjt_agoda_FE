"use client";

import { useAuth } from "../../Context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  UtensilsCrossed, 
  Ticket, 
  ShoppingCart, 
  Calendar, 
  Table2, 
  LayoutGrid, 
  MousePointerClick, 
  Users, 
  TrendingUp,
  ChevronRight,
  LogOut,
  Sparkles,
  Star
} from "lucide-react";

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/menu-items", label: "Menu Items", icon: UtensilsCrossed },
  { href: "/admin/vouchers", label: "Voucher Management", icon: Ticket },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/reservations", label: "Reservations", icon: Calendar },
  { href: "/admin/tables", label: "Quản lý bàn", icon: Table2 },
  { href: "/admin/tables/layout", label: "Không gian quán", icon: LayoutGrid },
  { href: "/admin/tables/select", label: "Chọn bàn", icon: MousePointerClick },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/revenue", label: "Revenue", icon: TrendingUp },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
];

const Aside = () => {
  const { user, logoutUser } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 backdrop-blur-sm"
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 w-72 h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white shadow-2xl transform transition-all duration-300 z-40 border-r border-gray-800
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-blue-500/5 pointer-events-none" />
        
        <div className="relative flex flex-col h-screen">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-800/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Admin Panel
                </h2>
                <p className="text-xs text-gray-400">Restaurant Management</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`group relative flex items-center gap-3 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 shadow-lg shadow-amber-500/20"
                      : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                  }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                  )}
                  
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${
                    isActive ? "scale-110" : "group-hover:scale-110"
                  }`} />
                  
                  <span className="flex-1 text-sm">{link.label}</span>
                  
                  <ChevronRight className={`w-4 h-4 transition-all duration-300 ${
                    isActive 
                      ? "opacity-100 translate-x-0" 
                      : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                  }`} />
                </Link>
              );
            })}
          </div>

          {/* User Profile Section */}
          {user && (
            <div className="p-4 border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-gray-800/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-gray-900 font-bold shadow-lg">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-white truncate">{user.name}</div>
                  <div className="text-xs text-gray-400 truncate">{user.email}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-amber-400 font-medium">
                      {typeof user.role === 'string' ? user.role : (user.role as any)?.name}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => logoutUser()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden z-30 transition-opacity duration-300"
        />
      )}
    </>
  );
};

export default Aside;
