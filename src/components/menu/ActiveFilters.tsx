interface ActiveFiltersProps {
  search: string;
  selectedCategories: string[];
  selectedTags: string[];
  onClearSearch: () => void;
  onRemoveCategory: (category: string) => void;
  onRemoveTag: (tag: string) => void;
  onClearAll: () => void;
}

export default function ActiveFilters({
  search,
  selectedCategories,
  selectedTags,
  onClearSearch,
  onRemoveCategory,
  onRemoveTag,
  onClearAll
}: ActiveFiltersProps) {
  const hasActiveFilters = search || selectedCategories.length > 0 || selectedTags.length > 0;

  if (!hasActiveFilters) return null;

  return (
    <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-yellow-400">
          🔍 Active Filters
        </span>
        <button
          onClick={onClearAll}
          className="text-xs text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-gray-700"
        >
          Clear all
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {search && (
          <FilterChip
            type="search"
            label={`Search: "${search}"`}
            onRemove={onClearSearch}
          />
        )}
        
        {selectedCategories.map((category) => (
          <FilterChip
            key={category}
            type="category"
            label={category}
            onRemove={() => onRemoveCategory(category)}
          />
        ))}
        
        {selectedTags.map((tag) => (
          <FilterChip
            key={tag}
            type="tag"
            label={tag}
            onRemove={() => onRemoveTag(tag)}
          />
        ))}
      </div>
    </div>
  );
}

interface FilterChipProps {
  type: 'search' | 'category' | 'tag';
  label: string;
  onRemove: () => void;
}

function FilterChip({ type, label, onRemove }: FilterChipProps) {
  const typeConfig = {
    search: {
      bgColor: 'bg-blue-600',
      textColor: 'text-blue-100',
      hoverColor: 'text-blue-200',
      icon: '📝'
    },
    category: {
      bgColor: 'bg-purple-600',
      textColor: 'text-purple-100',
      hoverColor: 'text-purple-200',
      icon: '📂'
    },
    tag: {
      bgColor: 'bg-green-600',
      textColor: 'text-green-100',
      hoverColor: 'text-green-200',
      icon: '🏷️'
    }
  };

  const config = typeConfig[type];

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 ${config.bgColor} ${config.textColor} text-sm rounded-full`}>
      {config.icon} {label}
      <button
        onClick={onRemove}
        className={`ml-1 ${config.hoverColor} hover:text-white`}
      >
        ×
      </button>
    </span>
  );
}
