'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Order } from '@attieke-chat/shared';
import { orderService } from '@/services';
import { useAppStore } from '@/store/useAppStore';

export interface UseOrdersResult {
  orders: Order[];
  selectedOrder: Order | null;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  confirmOrder: (orderId: string) => Promise<void>;
  advanceOrderStatus: (orderId: string) => Promise<void>;
  reload: () => Promise<void>;
}

export function useOrders(): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const refreshCounts = useAppStore((s) => s.refreshCounts);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await orderService.getOrders();
      setOrders(list);
      setSelectedOrderId((prev) => prev ?? list[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ORDERS_LOAD_ERROR');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const confirmOrder = useCallback(
    async (orderId: string) => {
      setIsUpdating(true);
      try {
        const updated = await orderService.confirmOrder(orderId);
        setOrders((prev) =>
          prev.map((o) => (o.id === updated.id ? updated : o))
        );
        await refreshCounts();
      } finally {
        setIsUpdating(false);
      }
    },
    [refreshCounts]
  );

  const advanceOrderStatus = useCallback(
    async (orderId: string) => {
      setIsUpdating(true);
      try {
        const updated = await orderService.advanceOrderStatus(orderId);
        setOrders((prev) =>
          prev.map((o) => (o.id === updated.id ? updated : o))
        );
        await refreshCounts();
      } finally {
        setIsUpdating(false);
      }
    },
    [refreshCounts]
  );

  const selectedOrder =
    orders.find((o) => o.id === selectedOrderId) ?? orders[0] ?? null;

  return {
    orders,
    selectedOrder,
    selectedOrderId,
    setSelectedOrderId,
    isLoading,
    isUpdating,
    error,
    confirmOrder,
    advanceOrderStatus,
    reload: load,
  };
}
