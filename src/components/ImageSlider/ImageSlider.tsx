"use client";

import { getMenuItems } from "@/src/lib/api";
import { IMenuItem } from "@/src/Types";
import Image from "next/image";
import useSWR from "swr";
import styles from "./image.module.css";

const ImageSlider = () => {
  const {
    data: menuItems,
    error,
    isLoading,
  } = useSWR<IMenuItem[]>("menuitem", getMenuItems);

  if (isLoading) {
    return (
      <div className={styles.loading_screen}>
        <div className={styles.loading_text}>Đang tải menu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Failed to load menu items. Please try again later.
      </div>
    );
  }

  // Nhân đôi array để tạo hiệu ứng lặp liên tục
  const duplicatedItems = [...(menuItems || []), ...(menuItems || [])];

  return (
    <div className="w-full flex justify-center mt-10">
      <div className="overflow-hidden w-[90%]">
        {" "}
        {/* 80% màn hình */}
        <div className={styles.sliderTrack}>
          {duplicatedItems.map((site, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-60 h-76 rounded-2xl overflow-hidden shadow-lg bg-white mr-4"
            >
              <Image
                src={site.images?.[0]?.trim() || "/default.jpeg"}
                alt={site.name || `menu-${i}`}
                width={270}
                height={334}
                unoptimized
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;
