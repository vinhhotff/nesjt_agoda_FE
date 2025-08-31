"use client";
import React, { useState, useEffect } from "react";
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

export default function Page() {
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

  // Build qs cho API
  const qsParts: string[] = [];
  if (debouncedSearch) qsParts.push(`search=${encodeURIComponent(debouncedSearch)}`);
  if (selectedCategories.length)
    qsParts.push(`category=${selectedCategories.map((c) => encodeURIComponent(c)).join(",")}`);
  if (selectedTags.length)
    qsParts.push(`tags=${selectedTags.map((t) => encodeURIComponent(t)).join(",")}`);

  const qs = qsParts.join("&");

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
        ...item.allergens!,
      ])
    )
  );

  if (isLoading)
    return (
      <div className={styles.loading_screen}>
        <div className={styles.loading_text}>Đang tải menu...</div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Failed to load menu items.
      </div>
    );

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
          <MenuGrid items={data?.items || []} />
          <Pagination page={page} total={data?.total || 0} limit={data?.limit || 10} setPage={setPage} />
        </div>
      </div>
    </div>
    </div>
   
  );
}
