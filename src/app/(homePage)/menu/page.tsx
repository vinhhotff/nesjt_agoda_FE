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
import ResultsSummary from "@/src/components/menu/ResultsSummary";

function MenuPageInner() {
  const {
    page,
    search,
    debouncedSearch,
    selectedCategories,
    selectedTags,
    setPage,
    setSearch,
    toggleCategory,
    toggleTag,
    clearAllFilters,
    clearSearch,
    removeCategory,
    removeTag,
    queryString
  } = useMenuFilters();

  // Fetch data
  const { data, error, isLoading } = useSWR<PaginatedMenuItem>(
    ["menuItems", page, queryString],
    () => getMenuItemsPaginate(page, 10, queryString),
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

  if (isLoading) {
    return <MenuPageSkeleton />;
  }

  if (error) {
    return (
      <div className="pt-25 bg-[#101826]">
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
    <div className="pt-25 bg-[#101826]">
       <div className={styles.menuContainer}>
      <div className={styles.layout}>
        <div className={styles.filterColumn}>
          <CategoryFilter
            categories={categories}
            selected={selectedCategories}
            toggleCategory={toggleCategory}
          />
          <TagFilter
            tags={tags}
            selected={selectedTags}
            toggleTag={toggleTag}
          />
        </div>
        <div className={styles.menuColumn}>
          <SearchBar search={search} setSearch={setSearch} />
          
          
          <ResultsSummary
            totalItems={data?.total || 0}
            currentItemsCount={(data?.items || []).length}
            currentPage={page}
          />
          
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
