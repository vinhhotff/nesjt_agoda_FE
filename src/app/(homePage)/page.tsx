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
            <div className={styles.title}>
              Restaurant Theme <br />
            </div>
            <div className={styles.typingText}>
              <div className="min-h-[72px] flex items-center">
                <TypingTitle texts={["Fine Dining", "Food Lovers"]} />
              </div>
            </div>
            <div className={styles.description}>
              <p>
                With our Restaurant theme you can build a modern website for fine
                dining, café, or food delivery business with ready-made templates
                and an intuitive page builder.
              </p>
            </div>
          </div>
          <ImageSlider />
        </div>
      </div>

      {/* menu section */}
      <div className={styles.menuSection}>
        <MenuItemComponent/>
      </div>
    </div>
  );
}
