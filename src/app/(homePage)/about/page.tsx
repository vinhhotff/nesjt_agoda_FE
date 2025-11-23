"use client";
import useSWR from "swr";
import Image from "next/image";
import { motion } from "framer-motion";
import { Section } from "@/src/Types";
import { getAbout } from "@/src/lib/api";
import { Sparkles, Users, Quote, Play, FileText, Loader2 } from "lucide-react";

interface AboutData {
  title: string;
  sections: Section[];
  contact: { email: string; phone: string };
  socialLinks: { facebook: string; instagram: string; tiktok: string };
  seo: { metaTitle: string; metaDescription: string; keywords: string[] };
}

export default function AboutPage() {
  const {
    data: AboutData,
    error,
    isLoading,
  } = useSWR<AboutData>("about", getAbout);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mx-auto" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4 p-8 bg-white rounded-3xl shadow-xl border border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Failed to load</h3>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!AboutData || !AboutData.sections) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center">
        <p className="text-gray-600">No data found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Hero Section */}
      <div className="relative bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full text-yellow-700 text-sm font-medium">
              <Sparkles size={16} />
              <span>Our Story</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
              {AboutData.title}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {AboutData.sections
            .sort((a, b) => a.order - b.order)
            .map((section, index) => {
              switch (section.type) {
                case "text":
                  return (
                    <motion.div
                      key={index}
                      className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 md:p-12"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                          {section.title}
                        </h2>
                      </div>
                      <p className="text-lg text-gray-700 leading-relaxed">
                        {section.content}
                      </p>
                    </motion.div>
                  );

                case "image":
                  return (
                    <motion.div
                      key={index}
                      className="bg-white rounded-3xl shadow-sm border border-gray-200 p-4 overflow-hidden"
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
                        <Image
                          src={section.url || section.image || '/default.jpeg'}
                          alt={section.title}
                          fill
                          unoptimized
                          className="object-cover hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      {section.title && (
                        <p className="text-center text-gray-600 mt-4 font-medium">
                          {section.title}
                        </p>
                      )}
                    </motion.div>
                  );

                case "team":
                  return (
                    <motion.div
                      key={index}
                      className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 md:p-12"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-center gap-3 mb-10">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                          {section.title}
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {section.teamMembers?.map((member, i) => (
                          <motion.div
                            key={i}
                            className="group text-center"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <div className="relative w-48 h-48 mx-auto mb-4">
                              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                              <Image
                                src={member.photo}
                                alt={member.name}
                                width={192}
                                height={192}
                                unoptimized
                                className="relative rounded-full shadow-lg object-cover border-4 border-white group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {member.name}
                            </h3>
                            <p className="text-yellow-600 font-medium">
                              {member.role}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  );

                case "quote":
                  return (
                    <motion.div
                      key={index}
                      className="relative"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100/50 rounded-3xl shadow-sm border-l-4 border-yellow-500 p-8 md:p-12">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 p-3 bg-yellow-500 rounded-xl">
                            <Quote className="w-6 h-6 text-white" />
                          </div>
                          <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 italic leading-relaxed">
                            "{section.quote || ''}"
                          </blockquote>
                        </div>
                      </div>
                    </motion.div>
                  );

                case "video":
                  return (
                    <motion.div
                      key={index}
                      className="bg-white rounded-3xl shadow-sm border border-gray-200 p-4 overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3 mb-6 px-4">
                        <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-xl">
                          <Play className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                          {section.title}
                        </h2>
                      </div>
                      <div className="rounded-2xl overflow-hidden">
                        <video
                          src={section.url || ''}
                          controls
                          className="w-full rounded-2xl"
                        />
                      </div>
                    </motion.div>
                  );

                default:
                  return null;
              }
            })}
        </div>
      </div>
    </div>
  );
}
