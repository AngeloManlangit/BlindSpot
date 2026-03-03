/*
    useCache.ts — Offline-first caching layer for BlindSpot
    Uses localStorage as a lightweight SQLite alternative for browser persistence.
    Results from Gemini are cached automatically and regularly for the offline-first function.
 */

import { ref, watch } from "vue";

interface CachedEntry<T> {
  data: T;
  timestamp: string;
  expiresAt: number;
}

const CACHE_PREFIX = "blindspot_";
const DEFAULT_TTL = 10 * 60 * 1000; // cache every 10 minutes (10 minutes * 60s/m * 1000ms/s)

export function useCache<T>(key: string, ttl: number = DEFAULT_TTL) {
  const cachedData = ref<T | null>(null);
  const lastUpdated = ref<string | null>(null);
  const isStale = ref(false);

  const fullKey = `${CACHE_PREFIX}${key}`;

  /*
    Read from cache. Returns null if missing.
   */
  const read = (): T | null => {
    try {
      const raw = localStorage.getItem(fullKey);
      if (!raw) return null;

      const entry: CachedEntry<T> = JSON.parse(raw);
      const now = Date.now();

      if (now > entry.expiresAt) {
        isStale.value = true;
        // Return stale data anyway — offline-first means stale > nothing
        cachedData.value = entry.data;
        lastUpdated.value = entry.timestamp;
        return entry.data;
      }

      isStale.value = false;
      cachedData.value = entry.data;
      lastUpdated.value = entry.timestamp;
      return entry.data;
    } catch (err) {
      console.warn(`[BlindSpot Cache] Read failed for "${key}":`, err);
      return null;
    }
  };

  /*
    Write to cache with TTL.
   */
  const write = (data: T): void => {
    try {
      const entry: CachedEntry<T> = {
        data,
        timestamp: new Date().toISOString(),
        expiresAt: Date.now() + ttl,
      };
      localStorage.setItem(fullKey, JSON.stringify(entry));
      cachedData.value = data;
      lastUpdated.value = entry.timestamp;
      isStale.value = false;
    } catch (err) {
      console.warn(`[BlindSpot Cache] Write failed for "${key}":`, err);
    }
  };

  /*
    Clear specific cache key.
   */
  const clear = (): void => {
    localStorage.removeItem(fullKey);
    cachedData.value = null;
    lastUpdated.value = null;
  };

  /*
    Clear ALL BlindSpot cache entries.
   */
  const clearAll = (): void => {
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith(CACHE_PREFIX)
    );
    keys.forEach((k) => localStorage.removeItem(k));
  };

  /*
    Get cache age in seconds.
   */
  const getAge = (): number | null => {
    if (!lastUpdated.value) return null;
    return Math.floor(
      (Date.now() - new Date(lastUpdated.value).getTime()) / 1000
    );
  };

  // Initialize on creation
  read();

  return {
    cachedData,
    lastUpdated,
    isStale,
    read,
    write,
    clear,
    clearAll,
    getAge,
  };
}
