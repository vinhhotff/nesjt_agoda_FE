"use client";
import React, { Suspense } from "react";
import useSWR from "swr";
import { getMenuItemsPaginate } from "@/src/lib/api";
import { PaginatedMenuItem } from "@/src/Types";
import { useMenuFilters } from "@/src/hooks/useMenuFilters";

import styles from "./menu.module.css";
import MenuGrid from "./MenuGrid";
import SearchBar from "./Searchbar";
import CategoryFilter from "./CategoryFilter";
import TagFilter from "./TagFilter";
import Pagination from "./Pagination";
import MenuPageSkeleton from "@/src/components/menu/MenuPageSkeleton";
import ErrorState from "@/src/components/ui/ErrorState";
import { Sparkles } from "lucide-react";

function MenuPageInner() {
  const {
    page,
    search,
    selectedCategories,
    selectedTags,
    setPage,
    setSearch,
    toggleCategory,
    toggleTag,
    queryString
  } = useMenuFilters();

  // Fetch data
  const { data, error, isLoading } = useSWR<PaginatedMenuItem>(
    ["menuItems", page, queryString],
    () => getMenuItemsPaginate(page, 12, queryString),
    { keepPreviousData: true, revalidateOnFocus: false, dedupingInterval: 2000 }
  );

  const categories = React.useMemo(() => Array.from(new Set(data?.items.map((item) => item.category))), [data?.items]);
  const tags = React.useMemo(
    () => Array.from(
      new Set(
        (data?.items || []).flatMap((item) => [
          ...(item.isVegetarian ? ["Vegetarian"] : []),
          ...(item.isVegan ? ["Vegan"] : []),
          ...(item.tag || []),
        ])
      )
    ),
    [data?.items]
  );

  const hasActiveFilters = selectedCategories.length > 0 || selectedTags.length > 0 || search.length > 0;

  if (isLoading) {
    return <MenuPageSkeleton />;
  }

  if (error) {
    return (
      <div className="pt-25 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className={styles.menuContainer}>
          <ErrorState
            title="Oops! Something went wrong"
            message="We couldn't load the menu items. Please check your connection and try again."
            onRetry={() => window.location.reload()}
            retryText="Reload Page"
            className="min-h-[60vh]"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Minimalist Hero Section */}
      <div className="relative bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full text-yellow-700 text-sm font-medium">
              <Sparkles size={16} />
              <span>Curated Selection</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
              Explore Our Menu
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Handcrafted dishes made with passion and the finest ingredients
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar search={search} setSearch={setSearch} />
        </div>

        {/* Horizontal Filters - Categories and Tags in one row */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
              {/* Categories */}
              <div className="pt-0">
                <CategoryFilter
                  categories={categories}
                  selected={selectedCategories}
                  toggleCategory={toggleCategory}
                />
              </div>

              {/* Tags */}
              <div className="pt-6 lg:pt-0 lg:pl-8">
                <TagFilter
                  tags={tags}
                  selected={selectedTags}
                  toggleTag={toggleTag}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mb-6 flex items-center gap-3 text-sm text-gray-600">
            <span className="font-medium">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {search && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full border border-yellow-200">
                  Search: "{search}"
                </span>
              )}
              {selectedCategories.map(cat => (
                <span key={cat} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                  {cat}
                </span>
              ))}
              {selectedTags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-green-100 text-green-700 rounded-full border border-green-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{(data?.items || []).length}</span> of{" "}
            <span className="font-semibold text-gray-900">{data?.total || 0}</span> dishes
          </p>
        </div>

        {/* Menu Grid */}
        <MenuGrid items={data?.items || []} />

        {/* Pagination */}
        {(data?.total || 0) > (data?.limit || 12) && (
          <div className="mt-12 flex justify-center">
            <Pagination 
              page={page} 
              total={data?.total || 0} 
              limit={data?.limit || 12} 
              setPage={setPage} 
            />
          </div>
        )}
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
