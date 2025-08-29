import React from "react";
import styles from "./menu.module.css";

interface Props {
  tags: string[];
  selected: string[];
  toggleTag: (tag: string) => void;
}

export default function TagFilter({ tags, selected, toggleTag }: Props) {
  return (
    <div className={styles.filterBox}>
      <div className={styles.filterTitle}>POPULAR TAGS</div>
      {tags.map((tag) => (
        <div
          key={tag}
          className={styles.filterItem}
          style={{ fontWeight: selected.includes(tag) ? "600" : "400" }}
          onClick={() => toggleTag(tag)}
        >
          {tag}
        </div>
      ))}
    </div>
  );
}
