'use client';

import { useCallback, useEffect, useState } from 'react';
import type { User } from '@attieke-chat/shared';
import {
  authService,
  chatService,
  type LoginInput,
  type RegisterInput,
  type SaveAddressInput,
  type UpdateProfileInput,
} from '@/services';
import { useAppStore } from '@/store/useAppStore';

export interface UseAuthResult {
  user: User | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<User>;
  saveAddress: (input: SaveAddressInput) => Promise<User>;
  deleteAddress: (addressId: string) => Promise<User>;
  resetDemoData: () => Promise<void>;
  reload: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const storeUser = useAppStore((s) => s.user);
  const setStoreUser = useAppStore((s) => s.setUser);
  const refreshCounts = useAppStore((s) => s.refreshCounts);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const current = await authService.getCurrentUser();
      setStoreUser(current);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AUTH_LOAD_ERROR');
    } finally {
      setIsLoading(false);
    }
  }, [setStoreUser]);

  useEffect(() => {
    void load();
  }, [load]);

  const login = useCallback(
    async (input: LoginInput): Promise<User> => {
      setIsSaving(true);
      setError(null);
      try {
        const loggedIn = await authService.login(input);
        setStoreUser(loggedIn);
        await refreshCounts();
        return loggedIn;
      } finally {
        setIsSaving(false);
      }
    },
    [setStoreUser, refreshCounts]
  );

  const register = useCallback(
    async (input: RegisterInput): Promise<User> => {
      setIsSaving(true);
      setError(null);
      try {
        const created = await authService.register(input);
        setStoreUser(created);
        await refreshCounts();
        return created;
      } finally {
        setIsSaving(false);
      }
    },
    [setStoreUser, refreshCounts]
  );

  const logout = useCallback(async (): Promise<void> => {
    setIsSaving(true);
    try {
      await authService.logout();
      setStoreUser(null);
    } finally {
      setIsSaving(false);
    }
  }, [setStoreUser]);

  const updateProfile = useCallback(
    async (input: UpdateProfileInput): Promise<User> => {
      setIsSaving(true);
      setError(null);
      try {
        const updated = await authService.updateProfile(input);
        setStoreUser(updated);
        return updated;
      } finally {
        setIsSaving(false);
      }
    },
    [setStoreUser]
  );

  const saveAddress = useCallback(
    async (input: SaveAddressInput): Promise<User> => {
      setIsSaving(true);
      setError(null);
      try {
        const updated = await authService.saveAddress(input);
        setStoreUser(updated);
        return updated;
      } finally {
        setIsSaving(false);
      }
    },
    [setStoreUser]
  );

  const deleteAddress = useCallback(
    async (addressId: string): Promise<User> => {
      setIsSaving(true);
      setError(null);
      try {
        const updated = await authService.deleteAddress(addressId);
        setStoreUser(updated);
        return updated;
      } finally {
        setIsSaving(false);
      }
    },
    [setStoreUser]
  );

  const resetDemoData = useCallback(async (): Promise<void> => {
    setIsSaving(true);
    setError(null);
    try {
      await chatService.resetDemoState();
      const restoredUser = await authService.getCurrentUser();
      setStoreUser(restoredUser);
      await refreshCounts();
    } finally {
      setIsSaving(false);
    }
  }, [setStoreUser, refreshCounts]);

  return {
    user: storeUser,
    isLoading,
    isSaving,
    error,
    login,
    register,
    logout,
    updateProfile,
    saveAddress,
    deleteAddress,
    resetDemoData,
    reload: load,
  };
}
