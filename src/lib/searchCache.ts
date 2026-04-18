import { Document } from '../types';

interface CacheEntry {
  results: Document[];
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const searchCache = new Map<string, CacheEntry>();

export const getCachedResults = (key: string): Document[] | null => {
  const entry = searchCache.get(key);
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    searchCache.delete(key);
    return null;
  }
  
  return entry.results;
};

export const setCachedResults = (key: string, results: Document[]) => {
  searchCache.set(key, {
    results,
    timestamp: Date.now(),
  });
};
