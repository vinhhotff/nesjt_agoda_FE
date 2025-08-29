import React from "react";
import styles from "./menu.module.css";

interface Props {
  categories: string[];
  selected: string[];
  toggleCategory: (name: string) => void;
}

export default function CategoryFilter({ categories, selected, toggleCategory }: Props) {
  return (
    <div className={styles.filterBox}>
      <div className={styles.filterTitle}>CATEGORIES</div>
      {categories.map((cat) => (
        <div
          key={cat}
          className={styles.filterItem}
          style={{ fontWeight: selected.includes(cat) ? "600" : "400" }}
          onClick={() => toggleCategory(cat)}
        >
          {cat}
        </div>
      ))}
    </div>
  );
}
