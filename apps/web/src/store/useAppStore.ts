'use client';

import { create } from 'zustand';
import type { User } from '@attieke-chat/shared';
import { authService, chatService, orderService } from '@/services';

interface AppStoreState {
  user: User | null;
  unreadChatCount: number;
  activeOrdersCount: number;
  isHydrated: boolean;
  hydrateSession: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearUnreadChat: (conversationId?: string) => Promise<void>;
  refreshCounts: () => Promise<void>;
}

export const useAppStore = create<AppStoreState>((set) => ({
  user: null,
  unreadChatCount: 5,
  activeOrdersCount: 4,
  isHydrated: false,

  hydrateSession: async () => {
    const [user, conversations, orders] = await Promise.all([
      authService.getCurrentUser(),
      chatService.getConversations(),
      orderService.getOrders(),
    ]);

    const totalUnread = conversations.reduce(
      (sum, c) => sum + c.unreadCount,
      0
    );
    const activeOrders = orders.filter((o) => o.status !== 'delivered').length;

    set({
      user,
      unreadChatCount: totalUnread,
      activeOrdersCount: activeOrders,
      isHydrated: true,
    });
  },

  setUser: (user) => {
    set({ user });
  },

  clearUnreadChat: async (conversationId) => {
    await chatService.markAllAsRead(conversationId);
    const conversations = await chatService.getConversations();
    const totalUnread = conversations.reduce(
      (sum, c) => sum + c.unreadCount,
      0
    );
    set({ unreadChatCount: totalUnread });
  },

  refreshCounts: async () => {
    const [conversations, orders] = await Promise.all([
      chatService.getConversations(),
      orderService.getOrders(),
    ]);
    const totalUnread = conversations.reduce(
      (sum, c) => sum + c.unreadCount,
      0
    );
    const activeOrders = orders.filter((o) => o.status !== 'delivered').length;
    set({
      unreadChatCount: totalUnread,
      activeOrdersCount: activeOrders,
    });
  },
}));
