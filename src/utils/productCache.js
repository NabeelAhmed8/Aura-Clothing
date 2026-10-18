const memoryCache = new Map();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

export const getCachedData = (key) => {
  const cached = memoryCache.get(key);
  if (!cached) return null;

  const isExpired = Date.now() - cached.timestamp > CACHE_TTL_MS;
  if (isExpired) {
    memoryCache.delete(key);
    return null;
  }

  return cached.data;
};

export const setCachedData = (key, data) => {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

export const clearCache = (key) => {
  if (key) {
    memoryCache.delete(key);
  } else {
    memoryCache.clear();
  }
};
