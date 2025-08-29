"use client";
import useSWR from "swr";
import Image from "next/image";
import { motion } from "framer-motion";
import { Section } from "@/src/Types";
import { getAbout } from "@/src/lib/api";

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

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-red-500">Failed to load</div>;
  if (!AboutData || !AboutData.sections) return <p>No data found</p>;

  return (
    <div className="bg-[#101826] h-[100%] text-white ">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12 ">
        <motion.h1
          className="text-4xl font-bold text-center mb-10 mt-40 text-[#edb021] "
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {AboutData.title}
        </motion.h1>

        {AboutData.sections
          .sort((a, b) => a.order - b.order)
          .map((section, index) => {
            switch (section.type) {
              case "text":
                return (
                  <div key={index} className="text-center space-y-4">
                    <h2 className="text-2xl font-semibold">{section.title}</h2>
                    <p className="text-lg">{section.content}</p>
                  </div>
                );

              case "image":
                return (
                  <div key={index} className="flex justify-center">
                    <Image
                      src={section.url}
                      alt={section.title}
                      width={800}
                      height={500}
                      className="rounded-2xl shadow-lg object-cover"
                    />
                  </div>
                );

              case "team":
                return (
                  <div key={index} className="space-y-6">
                    <h2 className="text-2xl font-semibold text-center">
                      {section.title}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      {section.teamMembers.map((member, i) => (
                        <div
                          key={i}
                          className="flex flex-col items-center text-center"
                        >
                          <Image
                            src={member.photo}
                            alt={member.name}
                            width={200}
                            height={200}
                            className="rounded-full shadow-md object-cover"
                          />
                          <h3 className="mt-4 text-lg font-semibold">
                            {member.name}
                          </h3>
                          <p className="text-gray-500">{member.role}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );

              case "quote":
                return (
                  <blockquote
                    key={index}
                    className="text-center text-xl italic py-8 border-l-4 border-green-500 mb-30"
                  >
                    “{section.quote}”
                  </blockquote>
                );

              case "video":
                return (
                  <div key={index} className="text-center space-y-4">
                    <h2 className="text-5xl font-semibold mb-20">{section.title}</h2>
                    <video
                      src={section.url}
                      controls
                      className="w-full rounded-2xl shadow-lg"
                    />
                  </div>
                );

              default:
                return null;
            }
          })}
      </div>
    </div>
  );
}
