"use client";
import { useRevealOnScroll } from "@/src/hooks/useRevealOnScroll";
import { LoadingSpinner, ErrorState } from "../ui";
import styles from "./MenuItem.module.css";
import useSWR from "swr";
import { IMenuItem } from "@/src/Types";
import { getMenuItems } from "@/src/lib/api";
import Image from "next/image";

export default function MenuItemComponent() {
  useRevealOnScroll(".reveal");
  const {
    data: menuItems,
    error,
    isLoading,
  } = useSWR<IMenuItem[]>("menuitem", getMenuItems, { revalidateOnFocus: false, dedupingInterval: 3000 });

  if (isLoading) {
    return (
      <div className={styles.loading_screen}>
        <LoadingSpinner size="lg" text="Đang tải menu..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ErrorState
          title="Failed to load menu"
          message="We couldn't load the menu items. Please try again later."
        />
      </div>
    );
  }
  return (
    <section className={styles.section}>
      <div className={`${styles.textBlock} reveal`}>
        <h2 className={styles.title}>
          Delight your guests <br /> showcase your flavors with a stunning
        </h2>
        <p className={styles.subtitle}>Make your restaurant unforgettable</p>
      </div>

      <div className={styles.cards}>
        {menuItems &&
          menuItems.slice(0, 8).map((item, key) => (
            <div key={key} className={`${styles.card} reveal`}>
              <Image
                src={item.images?.[0]?.trim() || "/default.jpeg"}
                alt={item.name || `menu-${key}`}
                width={270}
                height={334}
                unoptimized
                className="w-full h-[400px] rounded-lg mb-4 object-cover transform transition-transform duration-300 hover:scale-105"
              />
              <h3 className={styles.cardTitle}>{item.name}</h3>
              <p className={styles.cardDesc}>{item.description}</p>
            </div>
          ))}
      </div>
    </section>
  );
}
