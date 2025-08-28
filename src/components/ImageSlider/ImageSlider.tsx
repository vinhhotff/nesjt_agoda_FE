"use client";

import { getMenuItems } from "@/src/lib/api";
import { MenuItem } from "@/src/Types";
import Image from "next/image";
import { useState, useEffect } from "react";
import useSWR from "swr";
import styles from "./image.module.css";
const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const {
    data: menuItems,
    error,
    isLoading,
  } = useSWR<MenuItem[]>("menuitem", getMenuItems);


  const nextSlide = () => {
    if (!menuItems) return;
    setCurrentIndex((prev) => (prev + 1) % menuItems.length);
  };

  // auto slide
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isHovered && menuItems && menuItems.length > 0) {
      interval = setInterval(nextSlide, 6000);
    }
    return () => clearInterval(interval);
  }, [isHovered, menuItems]);

  if (isLoading) {
    return (
      <div className={styles.loading_screen}>
        <div className={styles.loading_text}>Đang tải menu...</div>
      </div>

    );
  }

  // Return a proper JSX element for error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Failed to load menu items. Please try again later.
      </div>
    );
  }

  return (
    <div
      className="w-full bg-gradient-to-b mt-[90px] relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-7xl mx-auto overflow-hidden flex justify-center">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 175}px)`,
          }}
        >
          {menuItems?.map((site, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-60 h-76 rounded-2xl overflow-hidden shadow-lg bg-white mr-3.5"
            >
              <Image
                src={
                  site.images?.[0]
                    ? `http://localhost:8083/public/images/MenuItemImages/${site.images[0]}`
                    : "/default.png"
                }
                alt={site.name || `menu-${i}`}
                width={270}
                height={334}
                className="w-full h-full object-cover"
              />



            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;