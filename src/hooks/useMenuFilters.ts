import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function useMenuFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lấy từ URL trước (SEO + reload giữ state)
  const initialPage = Number(searchParams.get("page") || "1");
  const initialSearch = searchParams.get("search") || "";
  const initialCategories = searchParams.get("category")?.split(",") || [];
  const initialTags = searchParams.get("tags")?.split(",") || [];

  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset page khi search mới
    }, 800);
    return () => clearTimeout(handler);
  }, [search]);

  // Sync query lên URL mỗi khi filter/page đổi
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedCategories.length) params.set("category", selectedCategories.join(","));
    if (selectedTags.length) params.set("tags", selectedTags.join(","));
    if (page > 1) params.set("page", page.toString());

    router.replace(`/menu?${params.toString()}`);
  }, [debouncedSearch, selectedCategories, selectedTags, page, router]);

  // Build qs cho API theo format backend expects: key=value,key2=value2
  const buildQueryString = () => {
    const qsParts: string[] = [];
    if (debouncedSearch) qsParts.push(`search=${encodeURIComponent(debouncedSearch)}`);
    if (selectedCategories.length) {
      selectedCategories.forEach(cat => {
        qsParts.push(`category=${encodeURIComponent(cat)}`);
      });
    }
    if (selectedTags.length) {
      selectedTags.forEach(tag => {
        if (tag === 'Vegetarian') qsParts.push('isVegetarian=true');
        else if (tag === 'Vegan') qsParts.push('isVegan=true');
        else qsParts.push(`tag=${encodeURIComponent(tag)}`);
      });
    }
    return qsParts.join(",");
  };

  const toggleCategory = (name: string) => {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedCategories([]);
    setSelectedTags([]);
    setPage(1);
  };

  const clearSearch = () => {
    setSearch('');
    setDebouncedSearch('');
  };

  const removeCategory = (category: string) => {
    setSelectedCategories(prev => prev.filter(c => c !== category));
  };

  const removeTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  return {
    // State
    page,
    search,
    debouncedSearch,
    selectedCategories,
    selectedTags,
    // Setters
    setPage,
    setSearch,
    // Actions
    toggleCategory,
    toggleTag,
    clearAllFilters,
    clearSearch,
    removeCategory,
    removeTag,
    // Computed
    queryString: buildQueryString()
  };
}
