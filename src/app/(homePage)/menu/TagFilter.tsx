import React, { memo } from "react";
import { Flame, Shield } from "lucide-react";
import styles from "./menu.module.css";

interface Props {
  tags: string[];
  selected: string[];
  toggleTag: (tag: string) => void;
  className?: string;
}

const getTagIcon = (tag: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    Vegetarian: <span className="text-green-400">🌱</span>,
    Vegan: <span className="text-green-500">🌿</span>,
    Spicy: <Flame size={14} className="text-red-500" />,
    "Gluten-Free": <Shield size={14} className="text-blue-400" />,
  };
  return iconMap[tag] || <span className="text-gray-400">🏷️</span>;
};

const getTagColor = (tag: string) => {
  const colorMap: Record<string, string> = {
    Vegetarian: "bg-green-600 text-green-100",
    Vegan: "bg-green-700 text-green-100",
    Spicy: "bg-red-600 text-red-100",
    "Gluten-Free": "bg-blue-600 text-blue-100",
  };
  return colorMap[tag] || "bg-gray-600 text-gray-100";
};

function TagFilter({ tags, selected, toggleTag, className = "" }: Props) {
  if (!tags.length) {
    return (
      <div className={`${styles.filterBox} ${className}`}>
        <div className={styles.filterTitle}>🏷️ DIETARY TAGS</div>
        <div className="text-gray-500 text-sm italic py-2">
          No tags available
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.filterBox} ${className}`}>
      <div className={styles.filterTitle}>
        🏷️ DIETARY TAGS ({selected.length})
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isActive = selected.includes(tag);
          return (
            <button
              key={tag}
              className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? `${getTagColor(tag)} ring-2 ring-yellow-400 transform scale-105`
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
              }`}
              onClick={() => toggleTag(tag)}
            >
              {getTagIcon(tag)}
              <span>{tag}</span>
              {isActive && <span className="text-xs opacity-80">✓</span>}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <button
          onClick={() => selected.forEach((tag) => toggleTag(tag))}
          className="w-full mt-3 text-xs text-gray-400 hover:text-red-400 transition-colors py-1"
        >
          Clear all tags
        </button>
      )}

      {/* Tag info */}
      <div className="mt-3 pt-2 border-t border-gray-700">
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-green-400">🌱</span>
            <span>Vegetarian-friendly</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">🌿</span>
            <span>100% plant-based</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(TagFilter);
