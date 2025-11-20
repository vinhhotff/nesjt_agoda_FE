'use client'
import React from "react";
import { IMenuItem } from "@/src/Types";
import MenuCard from "./MenuCard";
import { SearchX } from "lucide-react";

interface Props {
  items: IMenuItem[];
  className?: string;
}

function MenuGrid({ items, className = "" }: Props) {
  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-300">
        <div className="p-6 bg-gray-100 rounded-full mb-6">
          <SearchX size={48} className="text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          No dishes found
        </h3>
        <p className="text-gray-600 max-w-md">
          We couldn't find any dishes matching your criteria. Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {items.map((item) => <MenuCard key={item._id} item={item} />)}
    </div>
  );
}

export default React.memo(MenuGrid);
