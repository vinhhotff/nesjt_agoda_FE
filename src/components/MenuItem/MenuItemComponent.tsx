"use client";
import { useRevealOnScroll } from "@/src/hooks/useRevealOnScroll";
import styles from "./MenuItem.module.css";
import useSWR from "swr";
import { MenuItem } from "@/src/Types";
import { getMenuItems } from "@/src/lib/api";
import Image from "next/image";

export default function MenuItemComponent() {
  useRevealOnScroll(".reveal");
  const { data: menuItems, error, isLoading } = useSWR<MenuItem[]>(
    "menuitem",
    getMenuItems
  );

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
  return (
    <section className={styles.section}>
      <div className={`${styles.textBlock} reveal`}>
        <h2 className={styles.title}>
          Stand out with a professional <br />
          WordPress theme for your website
        </h2>
        <p className={styles.subtitle}>ready to use page templates</p>
      </div>

      <div className={styles.cards}>
        {menuItems &&
          menuItems.slice(0, 8).map((item,key) => (
            <div key={key} className={`${styles.card} reveal`}>
              <Image
                src={
                  item.images?.[0]
                    ? `http://localhost:8083/public/images/MenuItemImages/${item.images[0]}`
                    : "/default.jpeg"

                }
                alt={item.name || `menu-${key}`}
                width={270}
                height={334}
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
