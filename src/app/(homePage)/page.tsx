"use client";

import styles from "./page.module.css";
import TypingTitle from "../../components/TypingTitle/TypingTitle";
import ImageSlider from "../../components/ImageSlider/ImageSlider";
import MenuItemComponent from "@/src/components/MenuItem/MenuItemComponent";

export default function Home() {
  return (
    <div>
      <div className={styles.bgContainer}>
        <div className={styles.container}>
          <div className={styles.contentWrapper}>
            <h1 className={styles.title}>
              Restaurant Theme
            </h1>
            <div className={styles.typingText}>
              <TypingTitle texts={["Fine Dining", "Food Lovers"]} />
            </div>
            <p className={styles.description}>
              With our Restaurant theme you can build a modern website for fine
              dining, café, or food delivery business with ready-made templates
              and an intuitive page builder.
            </p>
          </div>
          <div className={styles.imgContainer}>
            <ImageSlider />
          </div>
        </div>
      </div>

      {/* Menu section */}
      <section className={styles.menuSection}>
        <MenuItemComponent />
      </section>
    </div>
  );
}
