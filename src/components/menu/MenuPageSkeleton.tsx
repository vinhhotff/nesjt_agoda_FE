import styles from "../../app/(homePage)/menu/menu.module.css";

export default function MenuPageSkeleton() {
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
            <MenuGridSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuGridSkeleton() {
  return (
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
  );
}
