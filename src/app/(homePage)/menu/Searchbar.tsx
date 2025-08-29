import React from "react";
import styles from "./menu.module.css";

interface Props {
  search: string;
  setSearch: (val: string) => void;
}

export default function SearchBar({ search, setSearch }: Props) {
  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        placeholder="Search menu..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}
