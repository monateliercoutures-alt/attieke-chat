import { create } from 'zustand';
import {
  resolveDeliveryStatusTransition,
  type ChatPreferences,
  type Conversation,
  type Locale,
  type Message,
  type MessageDeliveryStatus,
  type MessageReplyReference,
  type Presence,
} from '@attieke-chat/shared';
import { INITIAL_CHAT_PREFERENCES } from '@/data/mock/seed';
import { chatService } from '@/services';
import { sortConversations } from '@/services/mock/mockChatService';
import { useAppStore } from './useAppStore';

export type ConversationListFilter = 'all' | 'unread';

export interface NormalizedChatState {
  // Entités normalisées : Conversations
  conversationsById: Record<string, Conversation>;
  conversationIds: string[];
  activeConversationId: string;

  // Entités normalisées : Messages & États d'envoi par ID
  messagesById: Record<string, Message>;
  messageIdsByConversation: Record<string, string[]>;
  deliveryStatesById: Record<string, MessageDeliveryStatus>;
  hasMoreByConversation: Record<string, boolean>;
  totalMessagesByConversation: Record<string, number>;

  // Présence, Brouillons & Réponses citées par conversation
  presenceByConversation: Record<string, Presence>;
  draftsByConversation: Record<string, string>;
  replyingToByConversation: Record<string, MessageReplyReference | null>;

  // Filtres et recherche (Liste de conversations + Fil de messages)
  conversationSearchQuery: string;
  conversationFilter: ConversationListFilter;
  messageSearchQuery: string;

  // Préférences, Réseau & États de chargement
  preferences: ChatPreferences;
  isOnline: boolean;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isLoadingOlder: boolean;
  error: string | null;

  // Mutateurs synchrones normalisés (testables unitairement)
  hydrateConversations: (
    conversations: Conversation[],
    presenceMap?: Record<string, Presence>
  ) => void;
  upsertConversation: (conversation: Conversation) => void;
  selectConversationSync: (conversationId: string) => void;
  setConversationSearchQuery: (query: string) => void;
  setConversationFilter: (filter: ConversationListFilter) => void;
  setMessageSearchQuery: (query: string) => void;
  setDraftSync: (conversationId: string, draftText: string) => void;
  setReplyingTo: (
    conversationId: string,
    reply: MessageReplyReference | null
  ) => void;
  hydrateMessages: (
    conversationId: string,
    messages: Message[],
    hasMore?: boolean,
    totalCount?: number
  ) => void;
  prependOlderMessages: (
    conversationId: string,
    olderMessages: Message[],
    hasMore: boolean
  ) => void;
  upsertMessage: (message: Message) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  transitionMessageStatus: (
    messageId: string,
    nextStatus: MessageDeliveryStatus,
    failedReason?: string
  ) => void;
  setPresenceSync: (presence: Presence) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  setPreferencesSync: (preferences: ChatPreferences) => void;

  // Actions asynchrones passant par ChatService
  initializeChat: (initialConversationId?: string) => Promise<void>;
  switchConversation: (conversationId: string) => Promise<void>;
  togglePinConversation: (conversationId: string) => Promise<void>;
  toggleMuteConversation: (conversationId: string) => Promise<void>;
  markConversationRead: (conversationId: string) => Promise<void>;
  saveConversationDraft: (
    conversationId: string,
    draftText: string
  ) => Promise<void>;
  loadOlderMessages: (conversationId: string) => Promise<void>;
}

const PAGE_SIZE = 25;

function computeSortedIds(map: Record<string, Conversation>): string[] {
  return sortConversations(Object.values(map)).map((c) => c.id);
}

export function selectFilteredConversations(
  state: Pick<
    NormalizedChatState,
    | 'conversationsById'
    | 'conversationIds'
    | 'conversationFilter'
    | 'conversationSearchQuery'
    | 'draftsByConversation'
  >,
  locale: Locale
): Conversation[] {
  const query = state.conversationSearchQuery.trim().toLowerCase();
  const list: Conversation[] = [];

  for (const id of state.conversationIds) {
    const conv = state.conversationsById[id];
    if (!conv) {
      continue;
    }

    if (state.conversationFilter === 'unread' && conv.unreadCount === 0) {
      continue;
    }

    if (query.length > 0) {
      const nameMatch = conv.vendorName.toLowerCase().includes(query);
      const roleMatch =
        conv.vendorRole?.[locale]?.toLowerCase().includes(query) ?? false;
      const previewMatch =
        conv.lastMessagePreview?.[locale]?.toLowerCase().includes(query) ??
        false;
      const draftMatch = (state.draftsByConversation[id] ?? conv.draftText ?? '')
        .toLowerCase()
        .includes(query);

      if (!nameMatch && !roleMatch && !previewMatch && !draftMatch) {
        continue;
      }
    }

    list.push(conv);
  }

  return list;
}

export function selectTotalUnreadCount(
  state: Pick<NormalizedChatState, 'conversationsById' | 'conversationIds'>
): number {
  return state.conversationIds.reduce((sum, id) => {
    const conv = state.conversationsById[id];
    return sum + (conv ? conv.unreadCount : 0);
  }, 0);
}

export const useChatStore = create<NormalizedChatState>((set, get) => ({
  conversationsById: {},
  conversationIds: [],
  activeConversationId: 'conv-main-01',

  messagesById: {},
  messageIdsByConversation: {},
  deliveryStatesById: {},
  hasMoreByConversation: {},
  totalMessagesByConversation: {},

  presenceByConversation: {},
  draftsByConversation: {},
  replyingToByConversation: {},

  conversationSearchQuery: '',
  conversationFilter: 'all',
  messageSearchQuery: '',

  preferences: INITIAL_CHAT_PREFERENCES,
  isOnline: true,
  isLoadingConversations: false,
  isLoadingMessages: false,
  isLoadingOlder: false,
  error: null,

  hydrateConversations: (conversations, presenceMap) => {
    const byId: Record<string, Conversation> = {};
    const drafts: Record<string, string> = { ...get().draftsByConversation };

    for (const conv of conversations) {
      byId[conv.id] = conv;
      if (conv.draftText !== undefined && drafts[conv.id] === undefined) {
        drafts[conv.id] = conv.draftText;
      }
    }

    const sortedIds = computeSortedIds(byId);
    const currentActive = get().activeConversationId;
    const nextActive = byId[currentActive]
      ? currentActive
      : sortedIds[0] ?? 'conv-main-01';

    set((state) => ({
      conversationsById: byId,
      conversationIds: sortedIds,
      activeConversationId: nextActive,
      draftsByConversation: drafts,
      presenceByConversation: presenceMap
        ? { ...state.presenceByConversation, ...presenceMap }
        : state.presenceByConversation,
    }));
  },

  upsertConversation: (conversation) => {
    set((state) => {
      const nextById = {
        ...state.conversationsById,
        [conversation.id]: conversation,
      };
      const nextDrafts =
        conversation.draftText !== undefined
          ? {
              ...state.draftsByConversation,
              [conversation.id]: conversation.draftText,
            }
          : state.draftsByConversation;

      return {
        conversationsById: nextById,
        conversationIds: computeSortedIds(nextById),
        draftsByConversation: nextDrafts,
      };
    });
  },

  selectConversationSync: (conversationId) => {
    set({ activeConversationId: conversationId, messageSearchQuery: '' });
  },

  setConversationSearchQuery: (query) => {
    set({ conversationSearchQuery: query });
  },

  setConversationFilter: (filter) => {
    set({ conversationFilter: filter });
  },

  setMessageSearchQuery: (query) => {
    set({ messageSearchQuery: query });
  },

  setDraftSync: (conversationId, draftText) => {
    set((state) => {
      const existingConv = state.conversationsById[conversationId];
      const nextById = existingConv
        ? {
            ...state.conversationsById,
            [conversationId]: {
              ...existingConv,
              draftText,
            },
          }
        : state.conversationsById;

      return {
        draftsByConversation: {
          ...state.draftsByConversation,
          [conversationId]: draftText,
        },
        conversationsById: nextById,
      };
    });
  },

  setReplyingTo: (conversationId, reply) => {
    set((state) => ({
      replyingToByConversation: {
        ...state.replyingToByConversation,
        [conversationId]: reply,
      },
    }));
  },

  hydrateMessages: (conversationId, messages, hasMore = false, totalCount) => {
    set((state) => {
      const nextMessagesById = { ...state.messagesById };
      const nextDeliveryStates = { ...state.deliveryStatesById };
      const ids: string[] = [];

      for (const msg of messages) {
        nextMessagesById[msg.id] = msg;
        nextDeliveryStates[msg.id] = msg.deliveryStatus;
        ids.push(msg.id);
      }

      return {
        messagesById: nextMessagesById,
        deliveryStatesById: nextDeliveryStates,
        messageIdsByConversation: {
          ...state.messageIdsByConversation,
          [conversationId]: ids,
        },
        hasMoreByConversation: {
          ...state.hasMoreByConversation,
          [conversationId]: hasMore,
        },
        totalMessagesByConversation: {
          ...state.totalMessagesByConversation,
          [conversationId]: totalCount ?? messages.length,
        },
      };
    });
  },

  prependOlderMessages: (conversationId, olderMessages, hasMore) => {
    set((state) => {
      const existingIds =
        state.messageIdsByConversation[conversationId] ?? [];
      const nextMessagesById = { ...state.messagesById };
      const nextDeliveryStates = { ...state.deliveryStatesById };
      const newIds: string[] = [];

      for (const msg of olderMessages) {
        nextMessagesById[msg.id] = msg;
        nextDeliveryStates[msg.id] = msg.deliveryStatus;
        if (!existingIds.includes(msg.id)) {
          newIds.push(msg.id);
        }
      }

      return {
        messagesById: nextMessagesById,
        deliveryStatesById: nextDeliveryStates,
        messageIdsByConversation: {
          ...state.messageIdsByConversation,
          [conversationId]: [...newIds, ...existingIds],
        },
        hasMoreByConversation: {
          ...state.hasMoreByConversation,
          [conversationId]: hasMore,
        },
      };
    });
  },

  upsertMessage: (message) => {
    set((state) => {
      const existing = state.messagesById[message.id];
      const currentStatus =
        state.deliveryStatesById[message.id] ?? existing?.deliveryStatus;
      const resolvedStatus = currentStatus
        ? resolveDeliveryStatusTransition(currentStatus, message.deliveryStatus)
        : message.deliveryStatus;

      const normalizedMsg: Message = {
        ...existing,
        ...message,
        deliveryStatus: resolvedStatus,
      };

      const convIds =
        state.messageIdsByConversation[message.conversationId] ?? [];
      const hasId = convIds.includes(message.id);
      const nextConvIds = hasId ? convIds : [...convIds, message.id];

      return {
        messagesById: {
          ...state.messagesById,
          [message.id]: normalizedMsg,
        },
        deliveryStatesById: {
          ...state.deliveryStatesById,
          [message.id]: resolvedStatus,
        },
        messageIdsByConversation: {
          ...state.messageIdsByConversation,
          [message.conversationId]: nextConvIds,
        },
      };
    });
  },

  removeMessage: (conversationId, messageId) => {
    set((state) => {
      const nextMessages = { ...state.messagesById };
      delete nextMessages[messageId];
      const nextDelivery = { ...state.deliveryStatesById };
      delete nextDelivery[messageId];
      const existingIds =
        state.messageIdsByConversation[conversationId] ?? [];

      return {
        messagesById: nextMessages,
        deliveryStatesById: nextDelivery,
        messageIdsByConversation: {
          ...state.messageIdsByConversation,
          [conversationId]: existingIds.filter((id) => id !== messageId),
        },
      };
    });
  },

  transitionMessageStatus: (messageId, nextStatus, failedReason) => {
    set((state) => {
      const existing = state.messagesById[messageId];
      const currentStatus =
        state.deliveryStatesById[messageId] ??
        existing?.deliveryStatus ??
        'sending';
      const resolved = resolveDeliveryStatusTransition(
        currentStatus,
        nextStatus
      );
      const nowIso = new Date().toISOString();

      const updatedMsg: Message | undefined = existing
        ? {
            ...existing,
            deliveryStatus: resolved,
            sentAt: resolved === 'sent' ? existing.sentAt ?? nowIso : existing.sentAt,
            deliveredAt:
              resolved === 'delivered'
                ? existing.deliveredAt ?? nowIso
                : existing.deliveredAt,
            readAt: resolved === 'read' ? existing.readAt ?? nowIso : existing.readAt,
            failedReason: resolved === 'failed' ? failedReason : undefined,
          }
        : undefined;

      return {
        deliveryStatesById: {
          ...state.deliveryStatesById,
          [messageId]: resolved,
        },
        messagesById: updatedMsg
          ? {
              ...state.messagesById,
              [messageId]: updatedMsg,
            }
          : state.messagesById,
      };
    });
  },

  setPresenceSync: (presence) => {
    set((state) => {
      const existingConv = state.conversationsById[presence.conversationId];
      return {
        presenceByConversation: {
          ...state.presenceByConversation,
          [presence.conversationId]: presence,
        },
        conversationsById: existingConv
          ? {
              ...state.conversationsById,
              [presence.conversationId]: {
                ...existingConv,
                presenceStatus: presence.status,
                vendorOnline: presence.status !== 'offline',
                lastSeenAt: presence.lastSeenAt,
              },
            }
          : state.conversationsById,
      };
    });
  },

  setOnlineStatus: (isOnline) => {
    set({ isOnline });
  },

  setPreferencesSync: (preferences) => {
    set({ preferences });
  },

  initializeChat: async (initialConversationId) => {
    set({ isLoadingConversations: true, isLoadingMessages: true, error: null });
    try {
      const [conversations, presenceMap, preferences] = await Promise.all([
        chatService.getConversations(),
        chatService.getAllPresence(),
        chatService.getPreferences(),
      ]);

      get().hydrateConversations(conversations, presenceMap);
      get().setPreferencesSync(preferences);

      const targetConvId =
        initialConversationId &&
        conversations.some((c) => c.id === initialConversationId)
          ? initialConversationId
          : get().activeConversationId;

      get().selectConversationSync(targetConvId);

      const page = await chatService.getMessagesPage(targetConvId, {
        limit: PAGE_SIZE,
      });
      get().hydrateMessages(
        targetConvId,
        page.messages,
        page.hasMore,
        page.totalCount
      );

      await useAppStore.getState().refreshCounts();
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'CHAT_STORE_INIT_ERROR',
      });
    } finally {
      set({ isLoadingConversations: false, isLoadingMessages: false });
    }
  },

  switchConversation: async (conversationId) => {
    get().selectConversationSync(conversationId);
    set({ isLoadingMessages: true, error: null });
    try {
      const [page] = await Promise.all([
        chatService.getMessagesPage(conversationId, { limit: PAGE_SIZE }),
        chatService.markAllAsRead(conversationId),
      ]);
      get().hydrateMessages(
        conversationId,
        page.messages,
        page.hasMore,
        page.totalCount
      );
      const updatedConv = await chatService.getConversation(conversationId);
      get().upsertConversation(updatedConv);
      await useAppStore.getState().refreshCounts();
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'SWITCH_CONVERSATION_ERROR',
      });
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  togglePinConversation: async (conversationId) => {
    const current = get().conversationsById[conversationId];
    if (!current) {
      return;
    }
    const updated = await chatService.pinConversation(
      conversationId,
      !current.pinned
    );
    get().upsertConversation(updated);
  },

  toggleMuteConversation: async (conversationId) => {
    const current = get().conversationsById[conversationId];
    if (!current) {
      return;
    }
    const updated = await chatService.muteConversation(
      conversationId,
      !current.muted
    );
    get().upsertConversation(updated);
  },

  markConversationRead: async (conversationId) => {
    await chatService.markAllAsRead(conversationId);
    const updated = await chatService.getConversation(conversationId);
    get().upsertConversation(updated);
    await useAppStore.getState().refreshCounts();
  },

  saveConversationDraft: async (conversationId, draftText) => {
    get().setDraftSync(conversationId, draftText);
    await chatService.saveDraft(conversationId, draftText);
  },

  loadOlderMessages: async (conversationId) => {
    const state = get();
    if (state.isLoadingOlder || !state.hasMoreByConversation[conversationId]) {
      return;
    }
    const currentIds = state.messageIdsByConversation[conversationId] ?? [];
    const oldestId = currentIds[0];
    if (!oldestId) {
      return;
    }

    set({ isLoadingOlder: true });
    try {
      const page = await chatService.getMessagesPage(conversationId, {
        beforeMessageId: oldestId,
        limit: PAGE_SIZE,
      });
      get().prependOlderMessages(conversationId, page.messages, page.hasMore);
    } finally {
      set({ isLoadingOlder: false });
    }
  },
}));
