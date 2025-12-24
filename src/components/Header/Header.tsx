"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, ChevronDown } from "lucide-react";

const DynamicCartModal = dynamic(() => import("../Cart/CartModal"), { ssr: false });
const DynamicCheckoutModal = dynamic(() => import("../CheckoutModal/CheckoutModal"), { ssr: false });
const DynamicNotificationCenter = dynamic(() => import("../notifications/NotificationCenter"), { ssr: false });

const links = [
  { id: 1, title: "Home", url: "/" },
  { id: 2, title: "Menu", url: "/menu" },
  { id: 3, title: "About", url: "/about" },
  { id: 4, title: "Contact", url: "/contact" },
  { id: 5, title: "Reservation", url: "/reservation" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { user, logoutUser } = useAuth();
  const { cartItems } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isMounted, setIsMounted] = useState(false);
  const cartItemCount = isMounted ? cartItems.reduce((sum, item) => sum + item.quantity, 0) : 0;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleOpenCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleLogout = () => {
    logoutUser("/");
    setProfileOpen(false);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-lg' 
          : 'bg-white/80 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link 
              href="/" 
              className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300"
            >
              Foodies
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {links.map((link) => {
                const isActive = pathname === link.url;
                return (
                  <Link
                    key={link.id}
                    href={link.url}
                    className={`relative font-medium transition-colors duration-300 whitespace-nowrap ${
                      isActive 
                        ? 'text-amber-500' 
                        : 'text-gray-700 hover:text-amber-500'
                    }`}
                  >
                    {link.title}
                    {isActive && (
                      <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
            
            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Notification Center */}
              {(user || typeof window !== 'undefined' && localStorage.getItem('guestId')) && (
                <DynamicNotificationCenter />
              )}

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110"
              >
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {!user ? (
                <Link
                  href="/login"
                  className="hidden md:inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Login
                </Link>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-700 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {profileOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setProfileOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                        
                        <button
                          onClick={() => {
                            const role = String(user.role || "").toLowerCase();
                            const url = role === "admin" ? "/admin/profile" : "/user/profile";
                            router.push(url);
                            setProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                        >
                          <User className="w-5 h-5" />
                          Profile
                        </button>
                        
                        <button
                          onClick={() => {
                            const role = String(user.role || "").toLowerCase();
                            const url = role === "admin" ? "/admin/dashboard" : "/user/home";
                            router.push(url);
                            setProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                        >
                          <LayoutDashboard className="w-5 h-5" />
                          Dashboard
                        </button>
                        
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-5 h-5" />
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                {menuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <nav className="px-4 py-4 space-y-2">
              {links.map((link) => {
                const isActive = pathname === link.url;
                return (
                  <Link
                    key={link.id}
                    href={link.url}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl font-medium transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {link.title}
                  </Link>
                );
              })}
              {!user && (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl text-center shadow-md"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-20" />

      {isCartOpen && (
        <DynamicCartModal
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onCheckout={handleOpenCheckout}
        />
      )}
      {isCheckoutOpen && (
        <DynamicCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onSubmit={() => {
            setIsCheckoutOpen(false);
          }}
        />
      )}
    </>
  );
};

export default Header;
