'use client'
import React from "react";
import { IMenuItem } from "@/src/Types";
import MenuCard from "./MenuCard";
import styles from "./menu.module.css";

interface Props {
  items: IMenuItem[];
}

export default function MenuGrid({ items }: Props) {
  if (!items.length) return <div>No menu items found.</div>;
  return (
    <div className={styles.menuGrid}>
      {items.map((item) => <MenuCard key={item._id} item={item} />)}
    </div>
  );
}
