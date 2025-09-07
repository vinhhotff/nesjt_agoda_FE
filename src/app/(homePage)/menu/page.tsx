"use client";
import React, { useState, useEffect, Suspense } from "react";
import useSWR from "swr";
import { useRouter, useSearchParams } from "next/navigation";
import { getMenuItemsPaginate } from "@/src/lib/api";
import { IMenuItem, PaginatedMenuItem } from "@/src/Types";

import styles from "./menu.module.css";
import MenuGrid from "./MenuGrid";
import SearchBar from "./Searchbar";
import CategoryFilter from "./CategoryFilter";
import TagFilter from "./TagFilter";
import Pagination from "./Pagination";

function MenuPageInner() {
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

  const qs = qsParts.join(",");

  // Fetch data
  const { data, error, isLoading } = useSWR<PaginatedMenuItem>(
    ["menuItems", page, qs],
    () => getMenuItemsPaginate(page, 10, qs),
    { keepPreviousData: true }
  );

  const categories = Array.from(new Set(data?.items.map((item) => item.category)));
  const tags = Array.from(
    new Set(
      data?.items.flatMap((item) => [
        ...(item.isVegetarian ? ["Vegetarian"] : []),
        ...(item.isVegan ? ["Vegan"] : []),
        ...item.tag!,
      ])
    )
  );

  if (isLoading) {
    return (
      <div className="pt-25 bg-[#101826]">
        <div className={styles.menuContainer}>
          <div className={styles.layout}>
            <div className={styles.filterColumn}>
              {/* Filter skeletons */}
              <div className={styles.filterBox}>
                <div className="h-6 bg-gray-700 rounded w-32 mb-4 animate-pulse" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-8 bg-gray-700 rounded animate-pulse" />
                  ))}
                </div>
              </div>
              <div className={styles.filterBox}>
                <div className="h-6 bg-gray-700 rounded w-32 mb-4 animate-pulse" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-8 bg-gray-700 rounded-full w-20 animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.menuColumn}>
              {/* Search skeleton */}
              <div className={styles.searchBar}>
                <div className="h-12 bg-gray-700 rounded-lg w-full max-w-2xl animate-pulse" />
              </div>
              {/* Menu grid skeleton */}
              <div className={styles.menuGrid}>
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className={`${styles.menuCard} animate-pulse`}>
                    <div className="h-48 bg-gray-700" />
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-gray-700 rounded w-3/4" />
                      <div className="h-4 bg-gray-700 rounded w-full" />
                      <div className="h-4 bg-gray-700 rounded w-2/3" />
                      <div className="flex justify-between items-center pt-2">
                        <div className="h-6 bg-gray-700 rounded w-20" />
                        <div className="h-8 w-8 bg-gray-700 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-25 bg-[#101826]">
        <div className={styles.menuContainer}>
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="text-6xl mb-4 opacity-50">😕</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-400 mb-6 max-w-md">
              We couldn't load the menu items. Please check your connection and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="pt-25 bg-[#101826]">
       <div className={styles.menuContainer}>
      <div className={styles.layout}>
        <div className={styles.filterColumn}>
          <CategoryFilter
            categories={categories}
            selected={selectedCategories}
            toggleCategory={(name) =>
              setSelectedCategories((prev) =>
                prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
              )
            }
          />
          <TagFilter
            tags={tags}
            selected={selectedTags}
            toggleTag={(tag) =>
              setSelectedTags((prev) =>
                prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
              )
            }
          />
        </div>
        <div className={styles.menuColumn}>
          <SearchBar search={search} setSearch={setSearch} />
          
          {/* Active filters display */}
          {(debouncedSearch || selectedCategories.length > 0 || selectedTags.length > 0) && (
            <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-yellow-400">
                  🔍 Active Filters
                </span>
                <button
                  onClick={() => {
                    setSearch('');
                    setDebouncedSearch('');
                    setSelectedCategories([]);
                    setSelectedTags([]);
                    setPage(1);
                  }}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-gray-700"
                >
                  Clear all
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {debouncedSearch && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-blue-100 text-sm rounded-full">
                    📝 Search: "{debouncedSearch}"
                    <button
                      onClick={() => {
                        setSearch('');
                        setDebouncedSearch('');
                      }}
                      className="ml-1 text-blue-200 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                )}
                
                {selectedCategories.map((cat) => (
                  <span key={cat} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 text-purple-100 text-sm rounded-full">
                    📂 {cat}
                    <button
                      onClick={() => setSelectedCategories(prev => prev.filter(c => c !== cat))}
                      className="ml-1 text-purple-200 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
                
                {selectedTags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-green-100 text-sm rounded-full">
                    🏷️ {tag}
                    <button
                      onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                      className="ml-1 text-green-200 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Results summary */}
          <div className="mb-4">
            <p className="text-gray-400 text-sm">
              {data?.total === 0 
                ? 'No menu items found' 
                : `Showing ${(data?.items || []).length} of ${data?.total || 0} items`
              }
              {page > 1 && ` (Page ${page})`}
            </p>
          </div>
          
          <MenuGrid items={data?.items || []} />
          <Pagination page={page} total={data?.total || 0} limit={data?.limit || 10} setPage={setPage} />
        </div>
      </div>
    </div>
    </div>
   
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className={styles.loading_screen}><div className={styles.loading_text}>Loading...</div></div>}>
      <MenuPageInner />
    </Suspense>
  );
}
