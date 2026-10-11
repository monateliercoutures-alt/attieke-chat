'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ChatPreferences,
  ContactAttachment,
  Conversation,
  DocumentAttachment,
  ImageAttachmentItem,
  Locale,
  LocationAttachment,
  Message,
  MessageReplyReference,
  Order,
  Presence,
  Product,
  VoiceAttachment,
} from '@attieke-chat/shared';
import {
  callService,
  catalogService,
  chatService,
  orderService,
  type CallSession,
  type CallType,
  type ChatRealtimeEvent,
} from '@/services';
import {
  selectFilteredConversations,
  selectTotalUnreadCount,
  useChatStore,
  type ConversationListFilter,
} from '@/store/useChatStore';
import { useAppStore } from '@/store/useAppStore';

function playSubtleIncomingTone(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) {
      return;
    }
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.24);
  } catch {
    // Ignore audio context restriction
  }
}

export interface UseChatOptions {
  locale: Locale;
  initialProductSlug?: string;
}

export interface UseChatResult {
  conversations: Conversation[];
  filteredConversations: Conversation[];
  activeConversationId: string;
  activeConversation: Conversation | null;
  totalUnreadCount: number;
  conversationSearchQuery: string;
  conversationFilter: ConversationListFilter;
  presenceByConversation: Record<string, Presence>;
  draftsByConversation: Record<string, string>;
  activeDraftText: string;
  replyingTo: MessageReplyReference | null;
  messages: Message[];
  hasMoreOlderMessages: boolean;
  productsMap: Map<string, Product>;
  ordersMap: Map<string, Order>;
  allProducts: Product[];
  isLoading: boolean;
  isBusy: boolean;
  isVendorTyping: boolean;
  isVendorRecordingVoice: boolean;
  messageSearchQuery: string;
  searchMatchIds: string[];
  currentSearchMatchIndex: number;
  isOnlineNetwork: boolean;
  offlineQueueCount: number;
  preferences: ChatPreferences;
  activeCall: CallSession | null;
  error: string | null;
  // Actions Conversations
  selectConversation: (conversationId: string) => Promise<void>;
  setConversationSearchQuery: (query: string) => void;
  setConversationFilter: (filter: ConversationListFilter) => void;
  togglePinConversation: (conversationId: string) => Promise<void>;
  toggleMuteConversation: (conversationId: string) => Promise<void>;
  markConversationRead: (conversationId: string) => Promise<void>;
  updateDraft: (draftText: string) => void;
  // Actions Messages & Pièces jointes
  sendText: (
    text: string,
    replyTo?: MessageReplyReference,
    simulateFail?: boolean
  ) => Promise<void>;
  sendImages: (
    images: ImageAttachmentItem[],
    caption?: string
  ) => Promise<void>;
  sendVoice: (voice: VoiceAttachment) => Promise<void>;
  sendDocument: (doc: DocumentAttachment, caption?: string) => Promise<void>;
  sendLocation: (loc: LocationAttachment) => Promise<void>;
  sendContact: (contact: ContactAttachment) => Promise<void>;
  sendProductInquiry: (productSlugOrId: string) => Promise<void>;
  addToOrderFromChat: (productId: string, quantity: number) => Promise<void>;
  confirmOrderFromChat: (orderId: string) => Promise<void>;
  advanceOrderStepFromChat: (orderId: string) => Promise<void>;
  loadOlderMessages: () => Promise<void>;
  // Recherche dans la conversation
  setMessageSearchQuery: (query: string) => void;
  nextSearchMatch: () => string | null;
  prevSearchMatch: () => string | null;
  // Mode Hors-Ligne, Préférences, Appels & Démo
  toggleOfflineMode: () => Promise<void>;
  updatePreferences: (partial: Partial<ChatPreferences>) => Promise<void>;
  startCall: (type: CallType) => Promise<void>;
  acceptCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleCallMute: () => Promise<void>;
  toggleCallSpeaker: () => Promise<void>;
  toggleCallCamera: () => Promise<void>;
  resetDemo: () => Promise<void>;
  reload: () => Promise<void>;
}

export function useChat({
  locale,
  initialProductSlug,
}: UseChatOptions): UseChatResult {
  const conversationsById = useChatStore((s) => s.conversationsById);
  const conversationIds = useChatStore((s) => s.conversationIds);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const conversationSearchQuery = useChatStore(
    (s) => s.conversationSearchQuery
  );
  const conversationFilter = useChatStore((s) => s.conversationFilter);
  const messageSearchQuery = useChatStore((s) => s.messageSearchQuery);
  const presenceByConversation = useChatStore((s) => s.presenceByConversation);
  const draftsByConversation = useChatStore((s) => s.draftsByConversation);
  const replyingToByConversation = useChatStore(
    (s) => s.replyingToByConversation
  );
  const messagesById = useChatStore((s) => s.messagesById);
  const messageIdsByConversation = useChatStore(
    (s) => s.messageIdsByConversation
  );
  const hasMoreByConversation = useChatStore((s) => s.hasMoreByConversation);
  const isOnline = useChatStore((s) => s.isOnline);
  const preferences = useChatStore((s) => s.preferences);
  const isLoadingConversations = useChatStore((s) => s.isLoadingConversations);
  const isLoadingMessages = useChatStore((s) => s.isLoadingMessages);
  const storeError = useChatStore((s) => s.error);

  const initializeChat = useChatStore((s) => s.initializeChat);
  const switchConversation = useChatStore((s) => s.switchConversation);
  const setConversationSearchQuery = useChatStore(
    (s) => s.setConversationSearchQuery
  );
  const setConversationFilter = useChatStore((s) => s.setConversationFilter);
  const setMessageSearchQuery = useChatStore((s) => s.setMessageSearchQuery);
  const togglePinConversation = useChatStore((s) => s.togglePinConversation);
  const toggleMuteConversation = useChatStore((s) => s.toggleMuteConversation);
  const markConversationRead = useChatStore((s) => s.markConversationRead);
  const saveConversationDraft = useChatStore((s) => s.saveConversationDraft);
  const loadOlderMessagesInStore = useChatStore((s) => s.loadOlderMessages);
  const upsertMessage = useChatStore((s) => s.upsertMessage);
  const removeMessage = useChatStore((s) => s.removeMessage);
  const upsertConversation = useChatStore((s) => s.upsertConversation);
  const setPresenceSync = useChatStore((s) => s.setPresenceSync);
  const setOnlineStatus = useChatStore((s) => s.setOnlineStatus);
  const setPreferencesSync = useChatStore((s) => s.setPreferencesSync);

  const refreshCounts = useAppStore((s) => s.refreshCounts);

  const [productsMap, setProductsMap] = useState<Map<string, Product>>(
    new Map()
  );
  const [ordersMap, setOrdersMap] = useState<Map<string, Order>>(new Map());
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [currentSearchMatchIndex, setCurrentSearchMatchIndex] =
    useState<number>(0);
  const [activeCall, setActiveCall] = useState<CallSession | null>(
    callService.getCurrentCall()
  );

  const loadCatalogAndOrders = useCallback(async () => {
    const [products, orders] = await Promise.all([
      catalogService.getProducts(),
      orderService.getOrders(),
    ]);
    setAllProducts(products);
    setProductsMap(new Map(products.map((p) => [p.id, p])));
    setOrdersMap(new Map(orders.map((o) => [o.id, o])));
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([initializeChat(), loadCatalogAndOrders()]);
  }, [initializeChat, loadCatalogAndOrders]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  // Si un slug produit est passé en URL (?product=...), envoyer la carte produit
  useEffect(() => {
    if (!initialProductSlug || isLoadingMessages) {
      return;
    }
    const timer = setTimeout(() => {
      void chatService.sendProductInquiry(
        initialProductSlug,
        locale,
        activeConversationId
      );
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProductSlug]);

  // Abonnement aux événements temps réel du ChatService et du CallService
  useEffect(() => {
    const unsubscribeChat = chatService.subscribe(
      (event: ChatRealtimeEvent) => {
        if (event.type === 'presence_changed' && event.presence) {
          setPresenceSync(event.presence);
        } else if (
          (event.type === 'message_added' ||
            event.type === 'message_updated') &&
          event.message
        ) {
          upsertMessage(event.message);
          if (
            event.type === 'message_added' &&
            event.message.sender === 'vendor' &&
            useChatStore.getState().preferences.soundEnabled
          ) {
            playSubtleIncomingTone();
          }
          void refreshCounts();
        } else if (
          event.type === 'message_deleted' &&
          event.conversationId &&
          event.messageId
        ) {
          removeMessage(event.conversationId, event.messageId);
        } else if (
          event.type === 'conversation_updated' &&
          event.conversation
        ) {
          upsertConversation(event.conversation);
          void refreshCounts();
        } else if (event.type === 'order_updated' && event.order) {
          const updatedOrder = event.order;
          setOrdersMap((prev) => {
            const next = new Map(prev);
            next.set(updatedOrder.id, updatedOrder);
            return next;
          });
          void refreshCounts();
        }
      }
    );

    const unsubscribeCall = callService.subscribe((session) => {
      setActiveCall(session);
    });

    return () => {
      unsubscribeChat();
      unsubscribeCall();
    };
  }, [
    refreshCounts,
    removeMessage,
    setPresenceSync,
    upsertConversation,
    upsertMessage,
  ]);

  const conversations = useMemo(
    () =>
      conversationIds
        .map((id) => conversationsById[id])
        .filter((c): c is Conversation => Boolean(c)),
    [conversationIds, conversationsById]
  );

  const filteredConversations = useMemo(
    () =>
      selectFilteredConversations(
        {
          conversationsById,
          conversationIds,
          conversationFilter,
          conversationSearchQuery,
          draftsByConversation,
        },
        locale
      ),
    [
      conversationsById,
      conversationIds,
      conversationFilter,
      conversationSearchQuery,
      draftsByConversation,
      locale,
    ]
  );

  const totalUnreadCount = useMemo(
    () =>
      selectTotalUnreadCount({
        conversationsById,
        conversationIds,
      }),
    [conversationsById, conversationIds]
  );

  // Badge dans le titre de l'onglet du navigateur
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const baseTitle = 'Attiéké Abidjan — Chat Direct';
    document.title =
      totalUnreadCount > 0 ? `(${totalUnreadCount}) ${baseTitle}` : baseTitle;
  }, [totalUnreadCount]);

  const activeConversation =
    conversationsById[activeConversationId] ?? conversations[0] ?? null;

  const messages = useMemo(() => {
    const ids = messageIdsByConversation[activeConversationId] ?? [];
    return ids
      .map((id) => messagesById[id])
      .filter((m): m is Message => Boolean(m) && !m.deletedForMe);
  }, [activeConversationId, messageIdsByConversation, messagesById]);

  // Recherche dans la conversation active
  const searchMatchIds = useMemo(() => {
    const q = messageSearchQuery.trim().toLowerCase();
    if (!q) {
      return [];
    }
    return messages
      .filter((m) => {
        const textMatch =
          m.text?.zh.toLowerCase().includes(q) ||
          m.text?.fr.toLowerCase().includes(q) ||
          m.text?.en.toLowerCase().includes(q);
        const capMatch =
          m.imageCaption?.zh.toLowerCase().includes(q) ||
          m.imageCaption?.fr.toLowerCase().includes(q) ||
          m.imageCaption?.en.toLowerCase().includes(q);
        const docMatch = m.document?.fileName.toLowerCase().includes(q);
        const locMatch =
          m.location?.title[locale].toLowerCase().includes(q) ||
          m.location?.address[locale].toLowerCase().includes(q);
        return Boolean(textMatch || capMatch || docMatch || locMatch);
      })
      .map((m) => m.id);
  }, [messages, messageSearchQuery, locale]);

  useEffect(() => {
    setCurrentSearchMatchIndex(
      searchMatchIds.length > 0 ? searchMatchIds.length - 1 : 0
    );
  }, [searchMatchIds.length, messageSearchQuery]);

  const nextSearchMatch = useCallback((): string | null => {
    if (searchMatchIds.length === 0) {
      return null;
    }
    const nextIdx = (currentSearchMatchIndex + 1) % searchMatchIds.length;
    setCurrentSearchMatchIndex(nextIdx);
    return searchMatchIds[nextIdx] ?? null;
  }, [currentSearchMatchIndex, searchMatchIds]);

  const prevSearchMatch = useCallback((): string | null => {
    if (searchMatchIds.length === 0) {
      return null;
    }
    const prevIdx =
      (currentSearchMatchIndex - 1 + searchMatchIds.length) %
      searchMatchIds.length;
    setCurrentSearchMatchIndex(prevIdx);
    return searchMatchIds[prevIdx] ?? null;
  }, [currentSearchMatchIndex, searchMatchIds]);

  const activePresence = presenceByConversation[activeConversationId];
  const isVendorTyping = activePresence?.status === 'typing';
  const isVendorRecordingVoice = activePresence?.status === 'recording_voice';
  const activeDraftText = draftsByConversation[activeConversationId] ?? '';
  const replyingTo = replyingToByConversation[activeConversationId] ?? null;
  const hasMoreOlderMessages = Boolean(
    hasMoreByConversation[activeConversationId]
  );

  // Nombre de messages en file d'attente hors-ligne
  const offlineQueueCount = useMemo(
    () =>
      messages.filter(
        (m) => m.sender === 'customer' && m.deliveryStatus === 'sending'
      ).length,
    [messages]
  );

  const selectConversation = useCallback(
    async (conversationId: string) => {
      await switchConversation(conversationId);
    },
    [switchConversation]
  );

  const updateDraft = useCallback(
    (draftText: string) => {
      void saveConversationDraft(activeConversationId, draftText);
    },
    [activeConversationId, saveConversationDraft]
  );

  const sendText = useCallback(
    async (
      text: string,
      replyToRef?: MessageReplyReference,
      simulateFail?: boolean
    ) => {
      setIsBusy(true);
      try {
        await chatService.sendTextMessage(text, locale, {
          conversationId: activeConversationId,
          replyTo: replyToRef,
          simulateFail,
          offlineQueued: !isOnline,
        });
      } finally {
        setIsBusy(false);
      }
    },
    [activeConversationId, isOnline, locale]
  );

  const sendImages = useCallback(
    async (images: ImageAttachmentItem[], caption?: string) => {
      setIsBusy(true);
      try {
        await chatService.sendImageMessage(
          images[0]?.url ?? '/images/products/attieke-pack-1.jpg',
          caption,
          locale,
          {
            conversationId: activeConversationId,
            images,
            offlineQueued: !isOnline,
          }
        );
      } finally {
        setIsBusy(false);
      }
    },
    [activeConversationId, isOnline, locale]
  );

  const sendVoice = useCallback(
    async (voice: VoiceAttachment) => {
      setIsBusy(true);
      try {
        await chatService.sendVoiceMessage(voice, locale, {
          conversationId: activeConversationId,
          offlineQueued: !isOnline,
        });
      } finally {
        setIsBusy(false);
      }
    },
    [activeConversationId, isOnline, locale]
  );

  const sendDocument = useCallback(
    async (doc: DocumentAttachment, caption?: string) => {
      setIsBusy(true);
      try {
        await chatService.sendDocumentMessage(doc, caption, locale, {
          conversationId: activeConversationId,
          offlineQueued: !isOnline,
        });
      } finally {
        setIsBusy(false);
      }
    },
    [activeConversationId, isOnline, locale]
  );

  const sendLocation = useCallback(
    async (loc: LocationAttachment) => {
      setIsBusy(true);
      try {
        await chatService.sendLocationMessage(loc, locale, {
          conversationId: activeConversationId,
          offlineQueued: !isOnline,
        });
      } finally {
        setIsBusy(false);
      }
    },
    [activeConversationId, isOnline, locale]
  );

  const sendContact = useCallback(
    async (contact: ContactAttachment) => {
      setIsBusy(true);
      try {
        await chatService.sendContactMessage(contact, locale, {
          conversationId: activeConversationId,
          offlineQueued: !isOnline,
        });
      } finally {
        setIsBusy(false);
      }
    },
    [activeConversationId, isOnline, locale]
  );

  const sendProductInquiry = useCallback(
    async (productSlugOrId: string) => {
      setIsBusy(true);
      try {
        await chatService.sendProductInquiry(
          productSlugOrId,
          locale,
          activeConversationId
        );
      } finally {
        setIsBusy(false);
      }
    },
    [activeConversationId, locale]
  );

  const addToOrderFromChat = useCallback(
    async (productId: string, quantity: number) => {
      setIsBusy(true);
      try {
        const order = await chatService.addProductToOrderFromChat(
          productId,
          quantity,
          activeConversationId
        );
        setOrdersMap((prev) => {
          const next = new Map(prev);
          next.set(order.id, order);
          return next;
        });
        await refreshCounts();
      } finally {
        setIsBusy(false);
      }
    },
    [activeConversationId, refreshCounts]
  );

  const confirmOrderFromChat = useCallback(
    async (orderId: string) => {
      setIsBusy(true);
      try {
        const order = await chatService.confirmOrderInChat(
          orderId,
          activeConversationId
        );
        setOrdersMap((prev) => {
          const next = new Map(prev);
          next.set(order.id, order);
          return next;
        });
        await refreshCounts();
      } finally {
        setIsBusy(false);
      }
    },
    [activeConversationId, refreshCounts]
  );

  const advanceOrderStepFromChat = useCallback(
    async (orderId: string) => {
      setIsBusy(true);
      try {
        const order = await chatService.simulateNextOrderStepInChat(
          orderId,
          activeConversationId
        );
        setOrdersMap((prev) => {
          const next = new Map(prev);
          next.set(order.id, order);
          return next;
        });
        await refreshCounts();
      } finally {
        setIsBusy(false);
      }
    },
    [activeConversationId, refreshCounts]
  );

  const loadOlderMessages = useCallback(async () => {
    await loadOlderMessagesInStore(activeConversationId);
  }, [activeConversationId, loadOlderMessagesInStore]);

  const toggleOfflineMode = useCallback(async () => {
    const nextOnline = !isOnline;
    setOnlineStatus(nextOnline);
    if (nextOnline) {
      await chatService.flushOfflineQueue(locale);
    }
  }, [isOnline, locale, setOnlineStatus]);

  const updatePreferences = useCallback(
    async (partial: Partial<ChatPreferences>) => {
      const updated = await chatService.updatePreferences(partial);
      setPreferencesSync(updated);
    },
    [setPreferencesSync]
  );

  const startCall = useCallback(
    async (type: CallType) => {
      await callService.startCall(activeConversationId, type);
    },
    [activeConversationId]
  );

  const acceptCall = useCallback(async () => {
    await callService.acceptCall();
  }, []);

  const endCall = useCallback(async () => {
    await callService.endCall();
  }, []);

  const toggleCallMute = useCallback(async () => {
    await callService.toggleMute();
  }, []);

  const toggleCallSpeaker = useCallback(async () => {
    await callService.toggleSpeaker();
  }, []);

  const toggleCallCamera = useCallback(async () => {
    await callService.toggleCamera();
  }, []);

  const resetDemo = useCallback(async () => {
    setIsBusy(true);
    try {
      await chatService.resetDemoState();
      await loadAll();
    } finally {
      setIsBusy(false);
    }
  }, [loadAll]);

  return {
    conversations,
    filteredConversations,
    activeConversationId,
    activeConversation,
    totalUnreadCount,
    conversationSearchQuery,
    conversationFilter,
    presenceByConversation,
    draftsByConversation,
    activeDraftText,
    replyingTo,
    messages,
    hasMoreOlderMessages,
    productsMap,
    ordersMap,
    allProducts,
    isLoading: isLoadingConversations || isLoadingMessages,
    isBusy,
    isVendorTyping,
    isVendorRecordingVoice,
    messageSearchQuery,
    searchMatchIds,
    currentSearchMatchIndex,
    isOnlineNetwork: isOnline,
    offlineQueueCount,
    preferences,
    activeCall,
    error: storeError,
    selectConversation,
    setConversationSearchQuery,
    setConversationFilter,
    togglePinConversation,
    toggleMuteConversation,
    markConversationRead,
    updateDraft,
    sendText,
    sendImages,
    sendVoice,
    sendDocument,
    sendLocation,
    sendContact,
    sendProductInquiry,
    addToOrderFromChat,
    confirmOrderFromChat,
    advanceOrderStepFromChat,
    loadOlderMessages,
    setMessageSearchQuery,
    nextSearchMatch,
    prevSearchMatch,
    toggleOfflineMode,
    updatePreferences,
    startCall,
    acceptCall,
    endCall,
    toggleCallMute,
    toggleCallSpeaker,
    toggleCallCamera,
    resetDemo,
    reload: loadAll,
  };
}
