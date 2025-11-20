"use client";

import TypingTitle from "../../components/TypingTitle/TypingTitle";
import ImageSlider from "../../components/ImageSlider/ImageSlider";
import MenuItemComponent from "@/src/components/MenuItem/MenuItemComponent";
import { useRestaurant } from "@/src/Context/RestaurantContext";
import Link from "next/link";
import { ArrowRight, Star, Clock, Award } from "lucide-react";

export default function Home() {
  const { restaurant } = useRestaurant();

  const homepageTitle = restaurant?.homepageTitle || "Welcome to Foodies";
  const homepageSubtitle = restaurant?.homepageSubtitle || "Fine Dining";
  const homepageDescription =
    restaurant?.homepageDescription ||
    "Experience exceptional dining with our carefully curated menu and outstanding service. Every dish tells a story of passion and perfection.";

  const typingTexts = restaurant?.homepageSubtitle
    ? [restaurant.homepageSubtitle, "Food Lovers"]
    : ["Fine Dining", "Food Lovers", "Culinary Excellence"];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        {/* Animated Background Blobs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Centered Content */}
          <div className="text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full shadow-sm hover:shadow-md transition-shadow">
              <Star className="w-4 h-4 text-yellow-600 fill-yellow-600 animate-pulse" />
              <span className="text-sm font-bold text-yellow-700">Rated #1 Restaurant</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 leading-tight tracking-tight">
              {homepageTitle}
            </h1>
            
            <div className="text-3xl md:text-4xl lg:text-5xl font-semibold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
              <TypingTitle texts={typingTexts} />
            </div>
            
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              {homepageDescription}
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4 justify-center">
              <Link
                href="/menu"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                View Menu
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/reservation"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl shadow-xl hover:shadow-2xl border-2 border-gray-200 hover:border-yellow-500 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                Book a Table
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto">
              <div className="group text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                <div className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform inline-block">500+</div>
                <div className="text-sm text-gray-600 font-medium mt-2">Happy Customers</div>
              </div>
              <div className="group text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                <div className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform inline-block">50+</div>
                <div className="text-sm text-gray-600 font-medium mt-2">Dishes</div>
              </div>
              <div className="group text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                <div className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform inline-block">4.9</div>
                <div className="text-sm text-gray-600 font-medium mt-2">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Width Image Slider Section */}
      <section className="relative -mt-16 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-50/20 to-transparent pointer-events-none" />
        <div className="relative">
          <ImageSlider />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full">
              <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
              <span className="text-sm font-bold text-yellow-700">Our Advantages</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900">Why Choose Us</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Experience the difference that makes us special</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 border-gray-100 hover:border-yellow-200 overflow-hidden">
              {/* Hover Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-yellow-600 transition-colors">Premium Quality</h3>
                <p className="text-gray-600 leading-relaxed">Only the finest ingredients for exceptional taste and quality in every dish we serve.</p>
              </div>
            </div>
            
            <div className="group relative p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 border-gray-100 hover:border-yellow-200 overflow-hidden">
              {/* Hover Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <Clock className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-yellow-600 transition-colors">Fast Service</h3>
                <p className="text-gray-600 leading-relaxed">Quick preparation without compromising quality. Your satisfaction is our priority.</p>
              </div>
            </div>
            
            <div className="group relative p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 border-gray-100 hover:border-yellow-200 overflow-hidden">
              {/* Hover Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <Star className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-yellow-600 transition-colors">5-Star Experience</h3>
                <p className="text-gray-600 leading-relaxed">Exceptional service and ambiance that makes every visit memorable and special.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <MenuItemComponent />
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full mb-8">
            <Star className="w-4 h-4 text-white fill-white animate-pulse" />
            <span className="text-sm font-bold text-white">Limited Availability</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Ready to Experience Excellence?
          </h2>
          <p className="text-2xl mb-12 text-white/95 max-w-3xl mx-auto leading-relaxed">
            Book your table now and discover why we're the top-rated restaurant in town
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/reservation"
              className="group inline-flex items-center gap-2 px-10 py-5 bg-white text-yellow-600 font-bold text-lg rounded-2xl shadow-2xl hover:shadow-white/50 hover:scale-105 transition-all duration-300"
            >
              Reserve Your Table
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/menu"
              className="group inline-flex items-center gap-2 px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white text-white font-bold text-lg rounded-2xl hover:bg-white/20 transition-all duration-300"
            >
              View Menu
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/90">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-white" />
              <span className="font-semibold">4.9/5 Rating</span>
            </div>
            <div className="w-px h-6 bg-white/30" />
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span className="font-semibold">500+ Happy Customers</span>
            </div>
            <div className="w-px h-6 bg-white/30" />
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Fast Service</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
