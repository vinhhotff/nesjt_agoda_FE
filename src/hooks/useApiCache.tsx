// hooks/useApiCache.ts
import { useCallback, useRef } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
}

export function useApiCache<T = any>({ ttl = 5 * 60 * 1000 }: CacheOptions = {}) {
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());

  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > ttl;
    if (isExpired) {
      cache.current.delete(key);
      return null;
    }

    return entry.data;
  }, [ttl]);

  const set = useCallback((key: string, data: T) => {
    cache.current.set(key, {
      data,
      timestamp: Date.now(),
    });
  }, []);

  const clear = useCallback((key?: string) => {
    if (key) {
      cache.current.delete(key);
    } else {
      cache.current.clear();
    }
  }, []);

  const has = useCallback((key: string): boolean => {
    const entry = cache.current.get(key);
    if (!entry) return false;

    const isExpired = Date.now() - entry.timestamp > ttl;
    if (isExpired) {
      cache.current.delete(key);
      return false;
    }

    return true;
  }, [ttl]);

  const size = useCallback((): number => {
    return cache.current.size;
  }, []);

  const keys = useCallback((): string[] => {
    return Array.from(cache.current.keys());
  }, []);

  /**
   * cachedCall: wrap API fetcher để cache kết quả
   */
    const cachedCall = useCallback(async (key: string, fetcher: () => Promise<T>): Promise<T> => {
    const cachedData = get(key);
    if (cachedData !== null) {
      return cachedData;
    }
    const data = await fetcher();
    set(key, data);
    return data;
  }, [get, set]);

  return {
    get,
    set,
    clear,
    has,
    size,
    keys,
    cachedCall, 
  };
}
