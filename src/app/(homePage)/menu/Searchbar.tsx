import React, { memo } from "react";
import { Search, X } from "lucide-react";
import styles from "./menu.module.css";

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
    <div className={`${styles.searchBar} ${className}`}>
      <div className="relative w-full max-w-2xl mx-auto">

        {/* Input */}
        <input
          type="text"
          placeholder="Search dishes, categories, or ingredients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 
                     focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
        />

        {/* Nút clear */}
        {search && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-yellow-400 transition-colors"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default memo(SearchBar);
