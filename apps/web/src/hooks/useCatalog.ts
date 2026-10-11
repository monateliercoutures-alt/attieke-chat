'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Product, ProductCategory } from '@attieke-chat/shared';
import { catalogService } from '@/services';

export interface UseFeaturedProductsResult {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useFeaturedProducts(limit = 3): UseFeaturedProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await catalogService.getFeaturedProducts(limit);
      setProducts(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CATALOG_LOAD_ERROR');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    products,
    isLoading,
    error,
    reload: load,
  };
}

export interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  selectedCategory: ProductCategory | 'all';
  setSelectedCategory: (cat: ProductCategory | 'all') => void;
  reload: () => Promise<void>;
}

export function useProducts(
  initialCategory: ProductCategory | 'all' = 'all'
): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory | 'all'>(initialCategory);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const categoryFilter =
        selectedCategory === 'all' ? undefined : selectedCategory;
      const items = await catalogService.getProducts(categoryFilter);
      setProducts(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CATALOG_LOAD_ERROR');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    products,
    isLoading,
    error,
    selectedCategory,
    setSelectedCategory,
    reload: load,
  };
}
