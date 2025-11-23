"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getMenuItems } from "@/src/lib/api";
import { getTopSellingItems } from "@/src/lib/api/revenueApi";
import { useAuth } from "@/src/Context/AuthContext";
import { 
  User, 
  Mail, 
  Shield, 
  Star, 
  TrendingUp, 
  Calendar, 
  ShoppingBag, 
  Award,
  ChevronRight,
  Sparkles,
  Clock,
  Heart,
  Loader2
} from "lucide-react";

interface ApiResult<T> {
  loading: boolean;
  error?: string;
  data: T | null;
}

export default function UserDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [menuItemsRes, setMenuItemsRes] = useState<ApiResult<any[]>>({ loading: true, data: null });
  const [topSellingRes, setTopSellingRes] = useState<ApiResult<any[]>>({ loading: true, data: null });

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // Fetch API responses
  useEffect(() => {
    if (!user) return;
    
    (async () => {
      try {
        const items = await getMenuItems();
        setMenuItemsRes({ loading: false, data: items });
      } catch (e: any) {
        setMenuItemsRes({ loading: false, data: null, error: e?.message || "Failed" });
      }
      try {
        const top = await getTopSellingItems("30d", 8);
        setTopSellingRes({ loading: false, data: top });
      } catch (e: any) {
        setTopSellingRes({ loading: false, data: null, error: e?.message || "Failed" });
      }
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mx-auto" />
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                <Sparkles size={14} />
                <span>Welcome Back</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Hello, {user.name}!</h1>
              <p className="text-white/90 text-lg">Ready to explore delicious dishes?</p>
            </div>
            
            {user.isMember && (
              <div className="hidden md:flex items-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
                <div className="p-3 bg-white rounded-xl">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Status</p>
                  <p className="font-bold text-lg">Premium Member</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/menu"
            className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-yellow-300 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-yellow-100 rounded-xl group-hover:bg-yellow-500 transition-colors">
                <ShoppingBag className="w-6 h-6 text-yellow-600 group-hover:text-white transition-colors" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Browse Menu</h3>
            <p className="text-sm text-gray-600">Explore our dishes</p>
          </Link>

          <Link
            href="/reservation"
            className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-yellow-300 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-500 transition-colors">
                <Calendar className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Book Table</h3>
            <p className="text-sm text-gray-600">Reserve your spot</p>
          </Link>

          <Link
            href="/profile"
            className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-yellow-300 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-500 transition-colors">
                <User className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">My Profile</h3>
            <p className="text-sm text-gray-600">View & edit info</p>
          </Link>

          <Link
            href="/contact"
            className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-yellow-300 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-500 transition-colors">
                <Mail className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Contact Us</h3>
            <p className="text-sm text-gray-600">Get in touch</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Your Profile</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Role</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {typeof user.role === 'string' 
                        ? user.role 
                        : user.role && typeof user.role === 'object' && 'name' in user.role
                          ? (user.role as { name: string }).name
                          : 'user'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl border border-yellow-200">
                  <Award className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-yellow-700 mb-1">Membership</p>
                    <p className="text-sm font-bold text-yellow-900">
                      {user.isMember ? "Premium Member ⭐" : "Standard Member"}
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/profile"
                className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg"
              >
                Edit Profile
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>

          {/* Right Column - Popular Dishes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Popular Dishes</h2>
                    <p className="text-sm text-gray-600">Top picks this month</p>
                  </div>
                </div>
                <Link
                  href="/menu"
                  className="text-sm font-semibold text-yellow-600 hover:text-yellow-700 flex items-center gap-1"
                >
                  View All
                  <ChevronRight size={16} />
                </Link>
              </div>

              {topSellingRes.loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                </div>
              ) : topSellingRes.error ? (
                <div className="text-center py-12 text-red-600">
                  Failed to load popular dishes
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(topSellingRes.data || []).slice(0, 6).map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="group relative p-4 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-yellow-200"
                    >
                      <div className="flex gap-4">
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-200">
                          {item.images?.[0] ? (
                            <Image
                              src={item.images[0]}
                              alt={item.name}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              🍽️
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 mb-1 truncate group-hover:text-yellow-600 transition-colors">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                            {item.description || "Delicious dish"}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-yellow-600">
                              {item.price?.toLocaleString()} VND
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Star size={14} className="fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{item.totalSold || 0} sold</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
