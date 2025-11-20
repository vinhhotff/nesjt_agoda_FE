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

  // Skeleton loading với nhiều placeholder để không bị trống
  if (isLoading) {
    return (
      <div className="w-full relative py-12">
        <div className="overflow-hidden relative">
          <div className={styles.sliderTrack}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[340px] h-[480px] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-200 to-gray-300 mr-6 animate-pulse border-4 border-white"
              >
                <div className="w-full h-full bg-gray-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center min-h-[480px] text-red-500">
        <div className="text-center">
          <p className="text-lg">Không thể tải menu. Vui lòng thử lại sau.</p>
        </div>
      </div>
    );
  }

  // Kiểm tra nếu không có menu items
  if (!menuItems || menuItems.length === 0) {
    return (
      <div className="w-full flex justify-center items-center min-h-[480px]">
        <div className="text-center text-gray-500">
          <p className="text-lg">Chưa có món ăn nào để hiển thị.</p>
        </div>
      </div>
    );
  }

  // Nhân đôi array nhiều lần để đảm bảo animation mượt mà và không bị trống
  // Tạo ít nhất 20 items để đảm bảo luôn có đủ nội dung
  const minItems = 20;
  const repeatCount = Math.max(2, Math.ceil(minItems / menuItems.length));
  const duplicatedItems = Array.from({ length: repeatCount }, () => menuItems).flat();

  return (
    <div className="w-full relative py-12">
      <div className="overflow-hidden relative">
        {/* Gradient overlay để tạo hiệu ứng fade ở 2 bên */}
        <div className={styles.gradientLeft} />
        <div className={styles.gradientRight} />
        
        <div className={styles.sliderTrack}>
          {duplicatedItems.map((site, i) => (
            <div
              key={`${site._id || site.name}-${i}`}
              className="group flex-shrink-0 w-[340px] h-[480px] rounded-3xl overflow-hidden shadow-2xl bg-white mr-6 transition-all duration-500 hover:shadow-yellow-500/30 hover:scale-[1.03] hover:-translate-y-1 border-4 border-white"
            >
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={site.images?.[0]?.trim() || "/default.jpeg"}
                  alt={site.name || `menu-${i}`}
                  width={340}
                  height={480}
                  unoptimized
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Overlay gradient khi hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Tên món ăn hiển thị khi hover */}
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-white font-bold text-xl mb-2 drop-shadow-lg">{site.name}</h3>
                  {site.price && (
                    <p className="text-yellow-400 font-semibold text-lg drop-shadow-lg">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        maximumFractionDigits: 0,
                      }).format(site.price)}
                    </p>
                  )}
                </div>
                {/* Badge category */}
                {site.category && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {typeof site.category === 'object' ? (site.category as any).name : site.category}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;
