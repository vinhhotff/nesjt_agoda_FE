import React from "react";
import styles from "./menu.module.css";

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  setPage: (p: number) => void;
}

export default function Pagination({ page, total, limit, setPage }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);

  return (
    <div className={styles.pagination}>
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>
        Previous
      </button>

      <span>
        Page {page} / {totalPages}
      </span>

      <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
        Next
      </button>
    </div>
  );
}
