import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';
import { getCachedData, setCachedData } from '../utils/productCache';

/**
 * Custom hook to fetch and cache products from backend.
 * Normalizes MongoDB fields (_id -> id, stock fallbacks).
 */
export function useProducts({ endpoint = '/api/products', cacheKey = 'all_products' } = {}) {
  const [products, setProducts] = useState(() => getCachedData(cacheKey) || []);
  const [loading, setLoading] = useState(() => !getCachedData(cacheKey));
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(
    async (useCache = true) => {
      if (useCache) {
        const cached = getCachedData(cacheKey);
        if (cached && cached.length > 0) {
          setProducts(cached);
          setLoading(false);
        } else {
          setLoading(true);
        }
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

        const data = await res.json();
        if (Array.isArray(data)) {
          const formatted = data.map((item) => ({
            ...item,
            id: item._id || item.id,
            name: item.name,
            price: item.price,
            category: item.category,
            image: item.image,
            description: item.description || '',
            stock:
              typeof item.stock === 'number'
                ? item.stock
                : typeof item.countInStock === 'number'
                ? item.countInStock
                : 15,
            inStock:
              item.inStock !== undefined
                ? Boolean(item.inStock)
                : item.stock === undefined || item.stock > 0,
          }));

          setCachedData(cacheKey, formatted);
          setProducts(formatted);
          setError(null);
        } else if (!getCachedData(cacheKey)) {
          setProducts([]);
        }
      } catch (err) {
        console.error(`Failed to fetch products from ${endpoint}:`, err);
        if (!getCachedData(cacheKey)) {
          setProducts([]);
          setError('Server is offline or unavailable. Products cannot be loaded.');
        }
      } finally {
        setLoading(false);
      }
    },
    [endpoint, cacheKey]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: () => fetchProducts(false),
  };
}
