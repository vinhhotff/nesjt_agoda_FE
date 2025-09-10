'use client'
import React from "react";
import { IMenuItem } from "@/src/Types";
import MenuCard from "./MenuCard";
import styles from "./menu.module.css";

interface Props {
  items: IMenuItem[];
  className?: string;
}

function MenuGrid({ items, className = "" }: Props) {
  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4 opacity-50">🍽️</div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">
          No menu items found
        </h3>
        <p className="text-gray-400">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }
  
  return (
    <div className={`${styles.menuGrid} ${className}`}>
      {items.map((item) => <MenuCard key={item._id} item={item} />)}
    </div>
  );
}

export default React.memo(MenuGrid);
