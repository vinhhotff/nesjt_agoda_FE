"use client";
import { useRevealOnScroll } from "@/src/hooks/useRevealOnScroll";
import styles from "./MenuItem.module.css";

export default function MenuItemComponent() {
  useRevealOnScroll(".reveal");

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
        <div className={`${styles.card} reveal`}>
          <img src="/img1.jpg" alt="Visual Design Editor" className={styles.image} />
          <h3 className={styles.cardTitle}>Visual Design Editor</h3>
          <p className={styles.cardDesc}>
            Build and customize your site visually. Changing element options ex.
            color, size and see result instantly!
          </p>
        </div>

        <div className={`${styles.card} reveal`}>
          <img src="/img2.jpg" alt="Widgets" className={styles.image} />
          <h3 className={styles.cardTitle}>110+ Predefined Widgets</h3>
          <p className={styles.cardDesc}>
            Theme is packed with design widgets and options, they are highly
            flexible for any creations.
          </p>
        </div>

        <div className={`${styles.card} reveal`}>
          <img src="/img3.jpg" alt="Templates" className={styles.image} />
          <h3 className={styles.cardTitle}>Templates Collection</h3>
          <p className={styles.cardDesc}>
            We created ready to use templates for various kind of cafe and
            restaurant related websites.
          </p>
        </div>

          <div className={`${styles.card} reveal`}>
          <img src="/img4.jpg" alt="Templates" className={styles.image} />
          <h3 className={styles.cardTitle}>Templates Collection</h3>
          <p className={styles.cardDesc}>
            We created ready to use templates for various kind of cafe and
            restaurant related websites.
          </p>
        </div>
      </div>
    </section>
  );
}
