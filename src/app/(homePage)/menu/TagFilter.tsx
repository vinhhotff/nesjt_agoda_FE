import React, { memo } from "react";
import { Flame, Shield, Leaf, Tag } from "lucide-react";

interface Props {
  tags: string[];
  selected: string[];
  toggleTag: (tag: string) => void;
  className?: string;
}

const getTagIcon = (tag: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    Vegetarian: <Leaf size={14} />,
    Vegan: <Leaf size={14} />,
    Spicy: <Flame size={14} />,
    "Gluten-Free": <Shield size={14} />,
  };
  return iconMap[tag] || <Tag size={14} />;
};

const getTagStyle = (tag: string, isActive: boolean) => {
  const styleMap: Record<string, { bg: string; text: string; border: string; activeBg: string }> = {
    Vegetarian: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      activeBg: 'bg-gradient-to-r from-green-500 to-emerald-600'
    },
    Vegan: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      activeBg: 'bg-gradient-to-r from-emerald-500 to-teal-600'
    },
    Spicy: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      activeBg: 'bg-gradient-to-r from-red-500 to-orange-600'
    },
    "Gluten-Free": {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      activeBg: 'bg-gradient-to-r from-blue-500 to-cyan-600'
    },
  };
  
  const style = styleMap[tag] || {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    activeBg: 'bg-gradient-to-r from-gray-500 to-gray-600'
  };

  if (isActive) {
    return `${style.activeBg} text-white border-transparent shadow-lg`;
  }
  return `${style.bg} ${style.text} border ${style.border} hover:shadow-md`;
};

function TagFilter({ tags, selected, toggleTag, className = "" }: Props) {
  if (!tags.length) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 mb-3">
          <Tag size={20} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Dietary Tags</h3>
        </div>
        <div className="text-gray-500 text-sm italic">
          No tags available
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Tag size={20} className="text-gray-700" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Dietary Tags
          </h3>
          {selected.length > 0 && (
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
              {selected.length}
            </span>
          )}
        </div>
        {selected.length > 0 && (
          <button
            onClick={() => selected.forEach((tag) => toggleTag(tag))}
            className="text-xs text-gray-500 hover:text-red-500 transition-colors font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isActive = selected.includes(tag);
          return (
            <button
              key={tag}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${getTagStyle(tag, isActive)}`}
              onClick={() => toggleTag(tag)}
            >
              {getTagIcon(tag)}
              <span>{tag}</span>
              {isActive && <span className="text-xs ml-0.5">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(TagFilter);
