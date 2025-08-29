import React from "react";
import { MenuItem } from "@/src/Types";
import styles from "./menu.module.css";

interface Props {
  item: MenuItem;
}

export default function MenuCard({ item }: Props) {
  return (
    <div className={styles.menuCard}>
      <img src={item.images[0] || "/placeholder.png"} alt={item.name} className={styles.menuImage} />
      <div className={styles.menuContent}>
        <h3 className={styles.menuTitle}>{item.name}</h3>
        <p className={styles.menuDescription}>{item.description}</p>
        <div className={styles.menuInfo}>
          <span>Prep: {item.preparationTime} min</span>
          {!item.available && <span className={`${styles.menuTag} ${styles.unavailable}`}>Unavailable</span>}
        </div>
        <div className={styles.menuTags}>
          {item.isVegetarian && <span className={`${styles.menuTag} ${styles.vegetarian}`}>Vegetarian</span>}
          {item.isVegan && <span className={`${styles.menuTag} ${styles.vegan}`}>Vegan</span>}
          {item.allergens.map((a, idx) => <span key={idx} className={`${styles.menuTag} ${styles.allergen}`}>{a}</span>)}
        </div>
        <p className={styles.menuPrice}>{item.price.toLocaleString()} VND</p>
      </div>
    </div>
  );
}
