import React, { memo } from "react";
import { Search, X, Sparkles } from "lucide-react";

interface Props {
  search: string;
  setSearch: (val: string) => void;
  className?: string;
}

function SearchBar({ search, setSearch, className = "" }: Props) {
  const handleClear = () => {
    setSearch("");
  };

  return (
    <div className={className}>
      <div className="relative w-full">
        {/* Icon */}
        <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          {!search && (
            <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
          )}
        </div>
        
        {/* Input */}
        <input
          type="text"
          placeholder="Search for dishes, ingredients, or categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-16 pr-14 py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 
                     focus:outline-none focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 
                     transition-all duration-300 shadow-sm hover:shadow-md text-base"
        />

        {/* Clear button */}
        {search && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
            type="button"
            aria-label="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Search suggestions hint */}
        {!search && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hidden md:block">
            Try "Spicy" or "Vegan"
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(SearchBar);
