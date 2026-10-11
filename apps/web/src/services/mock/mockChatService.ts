import {
  resolveDeliveryStatusTransition,
  type ChatPreferences,
  type ContactAttachment,
  type Conversation,
  type DocumentAttachment,
  type ImageAttachmentItem,
  type Locale,
  type LocalizedText,
  type LocationAttachment,
  type Message,
  type MessageDeliveryStatus,
  type Order,
  type Presence,
  type PresenceStatus,
  type VoiceAttachment,
} from '@attieke-chat/shared';
import {
  loadMockState,
  resetMockState,
  saveMockState,
} from './storage';
import type {
  CallService,
  CallSession,
  CallType,
  ChatRealtimeEvent,
  ChatRealtimeListener,
  ChatService,
  MessagesPageOptions,
  MessagesPageResult,
  OrderService,
  SendMessageOptions,
} from '../types';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function sanitizeText(raw: string): string {
  return raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
}

function makeMultilingualText(text: string): LocalizedText {
  const safe = sanitizeText(text);
  return {
    zh: safe,
    fr: safe,
    en: safe,
  };
}

export function sortConversations(conversations: Conversation[]): Conversation[] {
  return [...conversations].sort((a, b) => {
    const aPinned = Boolean(a.pinned);
    const bPinned = Boolean(b.pinned);
    if (aPinned !== bPinned) {
      return aPinned ? -1 : 1;
    }
    return (
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  });
}

export class MockChatService implements ChatService {
  private readonly listeners = new Set<ChatRealtimeListener>();
  private readonly orderService: OrderService;

  public constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  public subscribe(listener: ChatRealtimeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(event: ChatRealtimeEvent): void {
    this.listeners.forEach((listener) => {
      listener(event);
    });
  }

  private updateConversationSummary(
    conversationId: string,
    message: Message,
    incrementUnread = false
  ): Conversation | null {
    const state = loadMockState();
    const idx = state.conversations.findIndex((c) => c.id === conversationId);
    if (idx === -1) {
      return null;
    }

    const current = state.conversations[idx];
    const preview: LocalizedText = message.deletedForEveryone
      ? {
          zh: '🚫 此消息已被撤回',
          fr: '🚫 Ce message a été supprimé',
          en: '🚫 This message was deleted',
        }
      : message.text ??
        message.imageCaption ??
        (message.type === 'image'
          ? { zh: '📷 图片', fr: '📷 Photo', en: '📷 Photo' }
          : message.type === 'voice'
          ? {
              zh: `🎤 语音消息 (${message.voice?.durationSec ?? 12}s)`,
              fr: `🎤 Message vocal (${message.voice?.durationSec ?? 12}s)`,
              en: `🎤 Voice message (${message.voice?.durationSec ?? 12}s)`,
            }
          : message.type === 'document'
          ? {
              zh: `📄 ${message.document?.fileName ?? '文件'}`,
              fr: `📄 ${message.document?.fileName ?? 'Document'}`,
              en: `📄 ${message.document?.fileName ?? 'Document'}`,
            }
          : message.type === 'location'
          ? {
              zh: `📍 ${message.location?.title.zh ?? '位置'}`,
              fr: `📍 ${message.location?.title.fr ?? 'Position'}`,
              en: `📍 ${message.location?.title.en ?? 'Location'}`,
            }
          : message.type === 'contact'
          ? {
              zh: `👤 ${message.contact?.name ?? '联系人'}`,
              fr: `👤 ${message.contact?.name ?? 'Contact'}`,
              en: `👤 ${message.contact?.name ?? 'Contact'}`,
            }
          : message.type === 'product_card'
          ? {
              zh: '🛒 商品卡片',
              fr: '🛒 Fiche produit',
              en: '🛒 Product card',
            }
          : message.type === 'order_card'
          ? {
              zh: '📦 订单摘要卡片',
              fr: '📦 Récapitulatif de commande',
              en: '📦 Order summary card',
            }
          : {
              zh: '🔔 物流状态更新',
              fr: '🔔 Mise à jour du statut',
              en: '🔔 Order status update',
            });

    const updated: Conversation = {
      ...current,
      lastMessageId: message.id,
      lastMessagePreview: preview,
      lastMessageType: message.type,
      lastMessageSender: message.sender,
      lastMessageStatus: message.deliveryStatus,
      lastMessageAt: message.createdAt,
      unreadCount: incrementUnread
        ? current.unreadCount + 1
        : current.unreadCount,
    };

    state.conversations[idx] = updated;
    saveMockState(state);
    return structuredClone(updated);
  }

  public async getConversations(): Promise<Conversation[]> {
    await delay(50);
    const state = loadMockState();
    return sortConversations(structuredClone(state.conversations));
  }

  public async getConversation(conversationId?: string): Promise<Conversation> {
    await delay(50);
    const state = loadMockState();
    const targetId = conversationId ?? state.conversations[0]?.id ?? 'conv-main-01';
    const found =
      state.conversations.find((c) => c.id === targetId) ??
      state.conversations[0] ??
      state.conversation;
    return structuredClone(found);
  }

  public async pinConversation(
    conversationId: string,
    pinned: boolean
  ): Promise<Conversation> {
    await delay(40);
    const state = loadMockState();
    const idx = state.conversations.findIndex((c) => c.id === conversationId);
    if (idx === -1) {
      throw new Error('CONVERSATION_NOT_FOUND');
    }

    const updated: Conversation = {
      ...state.conversations[idx],
      pinned,
    };
    state.conversations[idx] = updated;
    saveMockState(state);

    const cloned = structuredClone(updated);
    this.emit({
      type: 'conversation_updated',
      conversationId,
      conversation: cloned,
    });
    return cloned;
  }

  public async muteConversation(
    conversationId: string,
    muted: boolean
  ): Promise<Conversation> {
    await delay(40);
    const state = loadMockState();
    const idx = state.conversations.findIndex((c) => c.id === conversationId);
    if (idx === -1) {
      throw new Error('CONVERSATION_NOT_FOUND');
    }

    const updated: Conversation = {
      ...state.conversations[idx],
      muted,
    };
    state.conversations[idx] = updated;
    saveMockState(state);

    const cloned = structuredClone(updated);
    this.emit({
      type: 'conversation_updated',
      conversationId,
      conversation: cloned,
    });
    return cloned;
  }

  public async saveDraft(
    conversationId: string,
    draftText: string
  ): Promise<Conversation> {
    const state = loadMockState();
    const idx = state.conversations.findIndex((c) => c.id === conversationId);
    if (idx === -1) {
      throw new Error('CONVERSATION_NOT_FOUND');
    }

    const updated: Conversation = {
      ...state.conversations[idx],
      draftText,
    };
    state.conversations[idx] = updated;
    saveMockState(state);

    const cloned = structuredClone(updated);
    this.emit({
      type: 'conversation_updated',
      conversationId,
      conversation: cloned,
    });
    return cloned;
  }

  public async markAllAsRead(conversationId?: string): Promise<void> {
    const state = loadMockState();
    const targetConvId = conversationId ?? state.conversations[0]?.id ?? 'conv-main-01';
    const nowIso = new Date().toISOString();

    state.conversations = state.conversations.map((conv) =>
      conv.id === targetConvId
        ? {
            ...conv,
            unreadCount: 0,
            lastMessageStatus: conv.lastMessageStatus
              ? resolveDeliveryStatusTransition(conv.lastMessageStatus, 'read')
              : 'read',
          }
        : conv
    );

    state.messages = state.messages.map((m) => {
      if (m.conversationId !== targetConvId) {
        return m;
      }
      const nextStatus = resolveDeliveryStatusTransition(m.deliveryStatus, 'read');
      return {
        ...m,
        deliveryStatus: nextStatus,
        readAt: m.readAt ?? nowIso,
      };
    });

    saveMockState(state);
    const updatedConv = state.conversations.find((c) => c.id === targetConvId);
    if (updatedConv) {
      this.emit({
        type: 'conversation_updated',
        conversationId: targetConvId,
        conversation: structuredClone(updatedConv),
      });
    }
  }

  public async getPresence(conversationId: string): Promise<Presence> {
    const state = loadMockState();
    const existing = state.presenceByConversation[conversationId];
    if (existing) {
      return structuredClone(existing);
    }
    const conv = state.conversations.find((c) => c.id === conversationId);
    return {
      conversationId,
      status: conv?.vendorOnline ? 'online' : 'offline',
      lastSeenAt: conv?.lastSeenAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  public async getAllPresence(): Promise<Record<string, Presence>> {
    const state = loadMockState();
    return structuredClone(state.presenceByConversation);
  }

  private setPresence(conversationId: string, status: PresenceStatus): void {
    const state = loadMockState();
    const nowIso = new Date().toISOString();
    const prev = state.presenceByConversation[conversationId];
    const nextPresence: Presence = {
      conversationId,
      status,
      lastSeenAt: status === 'offline' ? nowIso : prev?.lastSeenAt ?? nowIso,
      updatedAt: nowIso,
    };
    state.presenceByConversation[conversationId] = nextPresence;
    const convIdx = state.conversations.findIndex((c) => c.id === conversationId);
    if (convIdx !== -1) {
      state.conversations[convIdx] = {
        ...state.conversations[convIdx],
        presenceStatus: status,
        vendorOnline: status !== 'offline',
      };
    }
    saveMockState(state);

    this.emit({
      type: 'presence_changed',
      conversationId,
      presenceStatus: status,
      presence: structuredClone(nextPresence),
    });
    this.emit({
      type: 'vendor_typing',
      conversationId,
      isTyping: status === 'typing' || status === 'recording_voice',
      presenceStatus: status,
    });
  }

  public async getMessages(conversationId?: string): Promise<Message[]> {
    await delay(50);
    const state = loadMockState();
    const targetId = conversationId ?? state.conversations[0]?.id ?? 'conv-main-01';
    const filtered = state.messages
      .filter((m) => m.conversationId === targetId && !m.deletedForMe)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    return structuredClone(filtered);
  }

  public async getMessagesPage(
    conversationId: string,
    options?: MessagesPageOptions
  ): Promise<MessagesPageResult> {
    await delay(60);
    const state = loadMockState();
    const limit = options?.limit ?? 25;
    const allForConv = state.messages
      .filter((m) => m.conversationId === conversationId && !m.deletedForMe)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    let endIdx = allForConv.length;
    if (options?.beforeMessageId) {
      const foundIdx = allForConv.findIndex(
        (m) => m.id === options.beforeMessageId
      );
      if (foundIdx !== -1) {
        endIdx = foundIdx;
      }
    }

    const startIdx = Math.max(0, endIdx - limit);
    const slice = allForConv.slice(startIdx, endIdx);
    return {
      messages: structuredClone(slice),
      hasMore: startIdx > 0,
      totalCount: allForConv.length,
    };
  }

  private transitionMessageStatus(
    messageId: string,
    targetStatus: MessageDeliveryStatus,
    failedReason?: string
  ): Message | null {
    const state = loadMockState();
    const idx = state.messages.findIndex((m) => m.id === messageId);
    if (idx === -1) {
      return null;
    }

    const current = state.messages[idx];
    const resolved = resolveDeliveryStatusTransition(
      current.deliveryStatus,
      targetStatus
    );
    const nowIso = new Date().toISOString();

    const updated: Message = {
      ...current,
      deliveryStatus: resolved,
      sentAt: resolved === 'sent' ? current.sentAt ?? nowIso : current.sentAt,
      deliveredAt:
        resolved === 'delivered'
          ? current.deliveredAt ?? nowIso
          : current.deliveredAt,
      readAt: resolved === 'read' ? current.readAt ?? nowIso : current.readAt,
      failedReason: resolved === 'failed' ? failedReason : undefined,
    };

    state.messages[idx] = updated;
    saveMockState(state);

    const conv = this.updateConversationSummary(
      updated.conversationId,
      updated,
      false
    );
    const clonedMsg = structuredClone(updated);

    this.emit({
      type: 'message_updated',
      conversationId: updated.conversationId,
      message: clonedMsg,
    });
    if (conv) {
      this.emit({
        type: 'conversation_updated',
        conversationId: updated.conversationId,
        conversation: conv,
      });
    }
    return clonedMsg;
  }

  private scheduleDeliveryProgression(
    message: Message,
    options?: SendMessageOptions,
    onReadCallback?: () => void
  ): void {
    if (options?.offlineQueued) {
      return;
    }

    if (options?.simulateFail) {
      setTimeout(() => {
        this.transitionMessageStatus(
          message.id,
          'failed',
          'NETWORK_TIMEOUT_RETRY'
        );
      }, 320);
      return;
    }

    // 1. sending -> sent (✓)
    setTimeout(() => {
      this.transitionMessageStatus(message.id, 'sent');
    }, 180);

    // 2. sent -> delivered (✓✓)
    setTimeout(() => {
      this.transitionMessageStatus(message.id, 'delivered');
    }, 450);

    // 3. delivered -> read (✓✓ bleu)
    setTimeout(() => {
      this.transitionMessageStatus(message.id, 'read');
      if (onReadCallback) {
        onReadCallback();
      }
    }, 800);
  }

  public async sendTextMessage(
    content: string,
    _locale: Locale,
    options?: SendMessageOptions
  ): Promise<Message> {
    const trimmed = sanitizeText(content);
    if (!trimmed) {
      throw new Error('EMPTY_MESSAGE');
    }

    const state = loadMockState();
    const convId =
      options?.conversationId ?? state.conversations[0]?.id ?? 'conv-main-01';
    const nowIso = new Date().toISOString();

    const customerMsg: Message = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      conversationId: convId,
      sender: 'customer',
      type: 'text',
      text: makeMultilingualText(trimmed),
      replyTo: options?.replyTo,
      createdAt: nowIso,
      deliveryStatus: 'sending',
    };

    state.messages.push(customerMsg);
    const convIdx = state.conversations.findIndex((c) => c.id === convId);
    if (convIdx !== -1) {
      state.conversations[convIdx].draftText = '';
    }
    saveMockState(state);

    const updatedConv = this.updateConversationSummary(convId, customerMsg, false);
    const cloned = structuredClone(customerMsg);

    this.emit({
      type: 'message_added',
      conversationId: convId,
      message: cloned,
    });
    if (updatedConv) {
      this.emit({
        type: 'conversation_updated',
        conversationId: convId,
        conversation: updatedConv,
      });
    }

    this.scheduleDeliveryProgression(customerMsg, options, () => {
      this.triggerVendorRealtimeReply(convId, trimmed);
    });

    return cloned;
  }

  public async retryMessage(
    messageId: string,
    _locale: Locale
  ): Promise<Message> {
    const state = loadMockState();
    const idx = state.messages.findIndex((m) => m.id === messageId);
    if (idx === -1) {
      throw new Error('MESSAGE_NOT_FOUND');
    }

    const target = state.messages[idx];
    const resetStatus = resolveDeliveryStatusTransition(
      target.deliveryStatus,
      'sending'
    );
    const updated: Message = {
      ...target,
      deliveryStatus: resetStatus,
      failedReason: undefined,
      createdAt: new Date().toISOString(),
    };
    state.messages[idx] = updated;
    saveMockState(state);

    const cloned = structuredClone(updated);
    this.emit({
      type: 'message_updated',
      conversationId: updated.conversationId,
      message: cloned,
    });

    this.scheduleDeliveryProgression(updated, undefined, () => {
      const rawText = updated.text?.fr ?? '';
      if (rawText) {
        this.triggerVendorRealtimeReply(updated.conversationId, rawText);
      }
    });

    return cloned;
  }

  public async flushOfflineQueue(_locale: Locale): Promise<Message[]> {
    const state = loadMockState();
    const queued = state.messages.filter(
      (m) => m.sender === 'customer' && m.deliveryStatus === 'sending'
    );
    const flushed: Message[] = [];

    for (const msg of queued) {
      this.scheduleDeliveryProgression(msg);
      flushed.push(structuredClone(msg));
    }
    return flushed;
  }

  public async sendImageMessage(
    imageDataUrl: string,
    caption: string | undefined,
    _locale: Locale,
    options?: SendMessageOptions & { images?: ImageAttachmentItem[] }
  ): Promise<Message> {
    const state = loadMockState();
    const convId =
      options?.conversationId ?? state.conversations[0]?.id ?? 'conv-main-01';
    const nowIso = new Date().toISOString();

    const imageMsg: Message = {
      id: `msg-img-${Date.now()}`,
      conversationId: convId,
      sender: 'customer',
      type: 'image',
      imageUrl: imageDataUrl,
      images: options?.images,
      imageCaption: caption ? makeMultilingualText(caption) : undefined,
      replyTo: options?.replyTo,
      createdAt: nowIso,
      deliveryStatus: 'sending',
    };

    state.messages.push(imageMsg);
    saveMockState(state);
    this.updateConversationSummary(convId, imageMsg, false);

    const cloned = structuredClone(imageMsg);
    this.emit({
      type: 'message_added',
      conversationId: convId,
      message: cloned,
    });

    this.scheduleDeliveryProgression(imageMsg, options, () => {
      this.triggerVendorImageAcknowledgement(convId);
    });

    return cloned;
  }

  public async sendVoiceMessage(
    voice: VoiceAttachment,
    _locale: Locale,
    options?: SendMessageOptions
  ): Promise<Message> {
    const state = loadMockState();
    const convId =
      options?.conversationId ?? state.conversations[0]?.id ?? 'conv-main-01';
    const nowIso = new Date().toISOString();

    const voiceMsg: Message = {
      id: `msg-voice-${Date.now()}`,
      conversationId: convId,
      sender: 'customer',
      type: 'voice',
      voice,
      replyTo: options?.replyTo,
      createdAt: nowIso,
      deliveryStatus: 'sending',
    };

    state.messages.push(voiceMsg);
    saveMockState(state);
    this.updateConversationSummary(convId, voiceMsg, false);

    const cloned = structuredClone(voiceMsg);
    this.emit({
      type: 'message_added',
      conversationId: convId,
      message: cloned,
    });

    this.scheduleDeliveryProgression(voiceMsg, options, () => {
      this.triggerVendorVoiceReply(convId);
    });

    return cloned;
  }

  public async sendDocumentMessage(
    document: DocumentAttachment,
    caption: string | undefined,
    _locale: Locale,
    options?: SendMessageOptions
  ): Promise<Message> {
    const state = loadMockState();
    const convId =
      options?.conversationId ?? state.conversations[0]?.id ?? 'conv-main-01';
    const nowIso = new Date().toISOString();

    const docMsg: Message = {
      id: `msg-doc-${Date.now()}`,
      conversationId: convId,
      sender: 'customer',
      type: 'document',
      document,
      text: caption ? makeMultilingualText(caption) : undefined,
      replyTo: options?.replyTo,
      createdAt: nowIso,
      deliveryStatus: 'sending',
    };

    state.messages.push(docMsg);
    saveMockState(state);
    this.updateConversationSummary(convId, docMsg, false);

    const cloned = structuredClone(docMsg);
    this.emit({
      type: 'message_added',
      conversationId: convId,
      message: cloned,
    });

    this.scheduleDeliveryProgression(docMsg, options, () => {
      this.triggerVendorImageAcknowledgement(convId);
    });

    return cloned;
  }

  public async sendLocationMessage(
    location: LocationAttachment,
    _locale: Locale,
    options?: SendMessageOptions
  ): Promise<Message> {
    const state = loadMockState();
    const convId =
      options?.conversationId ?? state.conversations[0]?.id ?? 'conv-main-01';
    const nowIso = new Date().toISOString();

    const locMsg: Message = {
      id: `msg-loc-${Date.now()}`,
      conversationId: convId,
      sender: 'customer',
      type: 'location',
      location,
      replyTo: options?.replyTo,
      createdAt: nowIso,
      deliveryStatus: 'sending',
    };

    state.messages.push(locMsg);
    saveMockState(state);
    this.updateConversationSummary(convId, locMsg, false);

    const cloned = structuredClone(locMsg);
    this.emit({
      type: 'message_added',
      conversationId: convId,
      message: cloned,
    });

    this.scheduleDeliveryProgression(locMsg, options, () => {
      this.triggerVendorRealtimeReply(convId, 'location');
    });

    return cloned;
  }

  public async sendContactMessage(
    contact: ContactAttachment,
    _locale: Locale,
    options?: SendMessageOptions
  ): Promise<Message> {
    const state = loadMockState();
    const convId =
      options?.conversationId ?? state.conversations[0]?.id ?? 'conv-main-01';
    const nowIso = new Date().toISOString();

    const contactMsg: Message = {
      id: `msg-contact-${Date.now()}`,
      conversationId: convId,
      sender: 'customer',
      type: 'contact',
      contact,
      replyTo: options?.replyTo,
      createdAt: nowIso,
      deliveryStatus: 'sending',
    };

    state.messages.push(contactMsg);
    saveMockState(state);
    this.updateConversationSummary(convId, contactMsg, false);

    const cloned = structuredClone(contactMsg);
    this.emit({
      type: 'message_added',
      conversationId: convId,
      message: cloned,
    });

    this.scheduleDeliveryProgression(contactMsg, options);
    return cloned;
  }

  public async toggleReaction(
    messageId: string,
    emoji: string,
    sender: 'customer' | 'vendor' = 'customer'
  ): Promise<Message> {
    const state = loadMockState();
    const idx = state.messages.findIndex((m) => m.id === messageId);
    if (idx === -1) {
      throw new Error('MESSAGE_NOT_FOUND');
    }

    const msg = state.messages[idx];
    const existing = msg.reactions ?? [];
    const alreadyHasSame = existing.some(
      (r) => r.sender === sender && r.emoji === emoji
    );

    const filtered = existing.filter((r) => r.sender !== sender);
    const nextReactions = alreadyHasSame
      ? filtered
      : [
          ...filtered,
          {
            emoji,
            sender,
            createdAt: new Date().toISOString(),
          },
        ];

    const updated: Message = {
      ...msg,
      reactions: nextReactions,
    };
    state.messages[idx] = updated;
    saveMockState(state);

    const cloned = structuredClone(updated);
    this.emit({
      type: 'message_updated',
      conversationId: updated.conversationId,
      message: cloned,
    });
    return cloned;
  }

  public async toggleStarMessage(messageId: string): Promise<Message> {
    const state = loadMockState();
    const idx = state.messages.findIndex((m) => m.id === messageId);
    if (idx === -1) {
      throw new Error('MESSAGE_NOT_FOUND');
    }

    const updated: Message = {
      ...state.messages[idx],
      starred: !state.messages[idx].starred,
    };
    state.messages[idx] = updated;
    saveMockState(state);

    const cloned = structuredClone(updated);
    this.emit({
      type: 'message_updated',
      conversationId: updated.conversationId,
      message: cloned,
    });
    return cloned;
  }

  public async deleteMessage(
    messageId: string,
    mode: 'me' | 'everyone'
  ): Promise<Message | null> {
    const state = loadMockState();
    const idx = state.messages.findIndex((m) => m.id === messageId);
    if (idx === -1) {
      return null;
    }

    const current = state.messages[idx];
    const updated: Message =
      mode === 'me'
        ? { ...current, deletedForMe: true }
        : {
            ...current,
            deletedForEveryone: true,
            text: {
              zh: '🚫 此消息已被撤回',
              fr: '🚫 Ce message a été supprimé',
              en: '🚫 This message was deleted',
            },
            imageUrl: undefined,
            images: undefined,
            voice: undefined,
            document: undefined,
          };

    state.messages[idx] = updated;
    saveMockState(state);

    this.updateConversationSummary(updated.conversationId, updated, false);
    const cloned = structuredClone(updated);

    if (mode === 'me') {
      this.emit({
        type: 'message_deleted',
        conversationId: updated.conversationId,
        messageId,
      });
      return null;
    }

    this.emit({
      type: 'message_updated',
      conversationId: updated.conversationId,
      message: cloned,
    });
    return cloned;
  }

  public async forwardMessage(
    messageId: string,
    targetConversationId: string,
    _locale: Locale
  ): Promise<Message> {
    const state = loadMockState();
    const source = state.messages.find((m) => m.id === messageId);
    if (!source) {
      throw new Error('MESSAGE_NOT_FOUND');
    }

    const nowIso = new Date().toISOString();
    const forwardedMsg: Message = {
      ...structuredClone(source),
      id: `msg-fwd-${Date.now()}`,
      conversationId: targetConversationId,
      sender: 'customer',
      forwarded: true,
      replyTo: undefined,
      reactions: [],
      starred: false,
      createdAt: nowIso,
      deliveryStatus: 'sending',
    };

    state.messages.push(forwardedMsg);
    saveMockState(state);
    this.updateConversationSummary(targetConversationId, forwardedMsg, false);

    const cloned = structuredClone(forwardedMsg);
    this.emit({
      type: 'message_added',
      conversationId: targetConversationId,
      message: cloned,
    });

    this.scheduleDeliveryProgression(forwardedMsg);
    return cloned;
  }

  public async sendProductInquiry(
    productSlugOrId: string,
    _locale: Locale,
    conversationId?: string
  ): Promise<Message> {
    const state = loadMockState();
    const convId =
      conversationId ?? state.conversations[0]?.id ?? 'conv-main-01';
    const product =
      state.products.find(
        (p) => p.slug === productSlugOrId || p.id === productSlugOrId
      ) ?? state.products[0];

    const nowIso = new Date().toISOString();
    const inquiryMsg: Message = {
      id: `msg-inq-${Date.now()}`,
      conversationId: convId,
      sender: 'customer',
      type: 'text',
      text: {
        zh: `你好！我想订购这款产品：${product.name.zh}（${product.weightKg} kg · ¥ ${product.priceYuan.toFixed(2)}）`,
        fr: `Bonjour ! Je souhaite commander ce produit : ${product.name.fr} (${product.weightKg} kg · ¥ ${product.priceYuan.toFixed(2)})`,
        en: `Hello! I would like to order this item: ${product.name.en} (${product.weightKg} kg · ¥ ${product.priceYuan.toFixed(2)})`,
      },
      createdAt: nowIso,
      deliveryStatus: 'read',
      sentAt: nowIso,
      deliveredAt: nowIso,
      readAt: nowIso,
    };

    state.messages.push(inquiryMsg);
    saveMockState(state);
    this.updateConversationSummary(convId, inquiryMsg, false);
    this.emit({
      type: 'message_added',
      conversationId: convId,
      message: structuredClone(inquiryMsg),
    });

    setTimeout(() => {
      this.setPresence(convId, 'typing');
      setTimeout(() => {
        const latestState = loadMockState();
        const cardMsg: Message = {
          id: `msg-card-${Date.now()}`,
          conversationId: convId,
          sender: 'vendor',
          type: 'product_card',
          productId: product.id,
          text: {
            zh: '太好了！这是您选择的商品卡片，点击下方按钮即可直接生成订单 👇',
            fr: 'Excellent choix ! Voici la fiche du produit, cliquez sur le bouton ci-dessous pour l’ajouter à votre commande 👇',
            en: 'Great choice! Here is the product card—tap the button below to add it to your order 👇',
          },
          createdAt: new Date().toISOString(),
          deliveryStatus: 'read',
        };
        latestState.messages.push(cardMsg);
        saveMockState(latestState);
        this.updateConversationSummary(convId, cardMsg, false);
        this.setPresence(convId, 'online');
        this.emit({
          type: 'message_added',
          conversationId: convId,
          message: structuredClone(cardMsg),
        });
      }, 850);
    }, 220);

    return structuredClone(inquiryMsg);
  }

  public async addProductToOrderFromChat(
    productId: string,
    quantity = 1,
    conversationId?: string
  ): Promise<Order> {
    const state = loadMockState();
    const convId =
      conversationId ?? state.conversations[0]?.id ?? 'conv-main-01';
    const product =
      state.products.find((p) => p.id === productId) ?? state.products[0];

    const newOrder = await this.orderService.createOrder({
      items: [
        {
          productId: product.id,
          productSlug: product.slug,
          productName: product.name,
          productImage: product.imageSrc,
          weightKg: product.weightKg,
          unitPriceYuan: product.priceYuan,
          quantity,
        },
      ],
    });

    const latestState = loadMockState();
    const orderCardMsg: Message = {
      id: `msg-ordcard-${Date.now()}`,
      conversationId: convId,
      sender: 'vendor',
      type: 'order_card',
      orderId: newOrder.id,
      createdAt: new Date().toISOString(),
      deliveryStatus: 'read',
    };

    latestState.messages.push(orderCardMsg);
    saveMockState(latestState);
    this.updateConversationSummary(convId, orderCardMsg, false);
    this.emit({
      type: 'message_added',
      conversationId: convId,
      message: structuredClone(orderCardMsg),
    });
    this.emit({
      type: 'order_updated',
      conversationId: convId,
      order: structuredClone(newOrder),
    });

    return structuredClone(newOrder);
  }

  public async confirmOrderInChat(
    orderId: string,
    conversationId?: string
  ): Promise<Order> {
    const updatedOrder = await this.orderService.confirmOrder(orderId);
    const state = loadMockState();
    const convId =
      conversationId ?? state.conversations[0]?.id ?? 'conv-main-01';
    const confirmedEvent =
      updatedOrder.timeline.find((e) => e.status === 'confirmed') ??
      updatedOrder.timeline[0];

    const statusMsg: Message = {
      id: `msg-status-${Date.now()}`,
      conversationId: convId,
      sender: 'system',
      type: 'status_event',
      orderId: updatedOrder.id,
      statusEvent: confirmedEvent,
      createdAt: new Date().toISOString(),
      deliveryStatus: 'read',
    };

    state.messages.push(statusMsg);
    saveMockState(state);
    this.updateConversationSummary(convId, statusMsg, false);
    this.emit({
      type: 'message_added',
      conversationId: convId,
      message: structuredClone(statusMsg),
    });
    this.emit({
      type: 'order_updated',
      conversationId: convId,
      order: structuredClone(updatedOrder),
    });

    return structuredClone(updatedOrder);
  }

  public async simulateNextOrderStepInChat(
    orderId: string,
    conversationId?: string
  ): Promise<Order> {
    const updatedOrder = await this.orderService.advanceOrderStatus(orderId);
    const state = loadMockState();
    const convId =
      conversationId ?? state.conversations[0]?.id ?? 'conv-main-01';
    const activeEvent =
      updatedOrder.timeline.find((e) => e.status === updatedOrder.status) ??
      updatedOrder.timeline[updatedOrder.timeline.length - 1];

    const statusMsg: Message = {
      id: `msg-step-${Date.now()}`,
      conversationId: convId,
      sender: 'system',
      type: 'status_event',
      orderId: updatedOrder.id,
      statusEvent: activeEvent,
      createdAt: new Date().toISOString(),
      deliveryStatus: 'read',
    };

    state.messages.push(statusMsg);
    saveMockState(state);
    this.updateConversationSummary(convId, statusMsg, false);
    this.emit({
      type: 'message_added',
      conversationId: convId,
      message: structuredClone(statusMsg),
    });
    this.emit({
      type: 'order_updated',
      conversationId: convId,
      order: structuredClone(updatedOrder),
    });

    return structuredClone(updatedOrder);
  }

  public async getPreferences(): Promise<ChatPreferences> {
    const state = loadMockState();
    return structuredClone(state.preferences);
  }

  public async updatePreferences(
    partial: Partial<ChatPreferences>
  ): Promise<ChatPreferences> {
    const state = loadMockState();
    state.preferences = {
      ...state.preferences,
      ...partial,
    };
    saveMockState(state);
    return structuredClone(state.preferences);
  }

  public async clearMessages(conversationId?: string): Promise<void> {
    const state = loadMockState();
    if (conversationId) {
      state.messages = state.messages.filter(
        (m) => m.conversationId !== conversationId
      );
      const convIdx = state.conversations.findIndex(
        (c) => c.id === conversationId
      );
      if (convIdx !== -1) {
        state.conversations[convIdx].unreadCount = 0;
      }
    } else {
      state.messages = [];
      state.conversations = state.conversations.map((c) => ({
        ...c,
        unreadCount: 0,
      }));
    }
    saveMockState(state);
  }

  public async resetDemoState(): Promise<void> {
    resetMockState();
  }

  private triggerVendorRealtimeReply(
    conversationId: string,
    customerText: string
  ): void {
    setTimeout(() => {
      this.setPresence(conversationId, 'typing');

      setTimeout(() => {
        const current = loadMockState();
        const lower = customerText.toLowerCase();

        const matchedProduct =
          lower.includes('tilapia') ||
          lower.includes('poisson') ||
          lower.includes('鱼')
            ? current.products[1]
            : lower.includes('kedjenou') ||
              lower.includes('poulet') ||
              lower.includes('鸡')
            ? current.products[2]
            : null;

        const replyMsg: Message = {
          id: `msg-vendor-${Date.now()}`,
          conversationId,
          sender: 'vendor',
          type: 'text',
          text:
            conversationId === 'conv-logistics-02'
              ? {
                  zh: '顺丰冷链客服已收到您的消息！您的包裹全程处于 2°C-4°C 恒温监控中 ❄️📦',
                  fr: 'Cellule SF Express Cold Chain : message bien reçu ! Votre colis est maintenu entre 2°C et 4°C ❄️📦',
                  en: 'SF Express Cold Chain Desk: message received! Your parcel is monitored at 2°C–4°C ❄️📦',
                }
              : conversationId === 'conv-chef-03'
              ? {
                  zh: 'Chef Kouadio 收到 👨‍🍳！记得蒸的时候加几滴柠檬汁和一点花生油，香气立马出来！',
                  fr: 'Chef Kouadio à l’écoute 👨‍🍳 ! Ajoutez quelques gouttes de citron vert et un filet d’huile avant de passer à la vapeur !',
                  en: 'Chef Kouadio here 👨‍🍳! Add a few drops of lime juice and peanut oil before steaming!',
                }
              : {
                  zh: '收到！😊 我们今天有新鲜出炉的阿蒂耶克和烤鱼现货，顺丰冷链直发全国。您可以点击商品卡片直接加入订单！',
                  fr: 'Bien reçu ! 😊 Notre attiéké frais et nos accompagnements sont disponibles immédiatement. Cliquez sur une carte produit pour commander !',
                  en: 'Got it! 😊 Our fresh attiéké and combos are in stock for immediate SF Express dispatch. Tap any product card to add it to your order!',
                },
          createdAt: new Date().toISOString(),
          deliveryStatus: 'read',
        };

        current.messages.push(replyMsg);
        saveMockState(current);
        this.updateConversationSummary(conversationId, replyMsg, false);

        if (matchedProduct && conversationId === 'conv-main-01') {
          const productCardMsg: Message = {
            id: `msg-vendor-prod-${Date.now() + 1}`,
            conversationId,
            sender: 'vendor',
            type: 'product_card',
            productId: matchedProduct.id,
            createdAt: new Date().toISOString(),
            deliveryStatus: 'read',
          };
          const latest = loadMockState();
          latest.messages.push(productCardMsg);
          saveMockState(latest);
          this.updateConversationSummary(conversationId, productCardMsg, false);
          this.setPresence(conversationId, 'online');
          this.emit({
            type: 'message_added',
            conversationId,
            message: structuredClone(replyMsg),
          });
          this.emit({
            type: 'message_added',
            conversationId,
            message: structuredClone(productCardMsg),
          });
          return;
        }

        this.setPresence(conversationId, 'online');
        this.emit({
          type: 'message_added',
          conversationId,
          message: structuredClone(replyMsg),
        });
      }, 950);
    }, 250);
  }

  private triggerVendorVoiceReply(conversationId: string): void {
    setTimeout(() => {
      this.setPresence(conversationId, 'recording_voice');
      setTimeout(() => {
        const current = loadMockState();
        const voiceReply: Message = {
          id: `msg-vendor-voice-${Date.now()}`,
          conversationId,
          sender: 'vendor',
          type: 'voice',
          voice: {
            id: `v-rep-${Date.now()}`,
            url: 'mock-voice://vendor-reply',
            durationSec: 12,
            waveform: [
              22, 45, 68, 84, 60, 40, 75, 92, 70, 50, 38, 65, 88, 72, 48, 30,
            ],
            mimeType: 'audio/webm',
          },
          text: {
            zh: '语音回复：收到您的语音！我们马上为您核对安排 😊',
            fr: 'Réponse vocale : Message vocal bien reçu ! On s’en occupe immédiatement 😊',
            en: 'Voice reply: Voice note received! We are taking care of it right away 😊',
          },
          createdAt: new Date().toISOString(),
          deliveryStatus: 'read',
        };
        current.messages.push(voiceReply);
        saveMockState(current);
        this.updateConversationSummary(conversationId, voiceReply, false);
        this.setPresence(conversationId, 'online');
        this.emit({
          type: 'message_added',
          conversationId,
          message: structuredClone(voiceReply),
        });
      }, 1100);
    }, 250);
  }

  private triggerVendorImageAcknowledgement(conversationId: string): void {
    setTimeout(() => {
      this.setPresence(conversationId, 'typing');
      setTimeout(() => {
        const current = loadMockState();
        const replyMsg: Message = {
          id: `msg-vendor-img-${Date.now()}`,
          conversationId,
          sender: 'vendor',
          type: 'text',
          text: {
            zh: '文件/图片已收到！👍 我马上为您核对并安排打包。',
            fr: 'Fichier bien reçu ! 👍 Je vérifie cela tout de suite pour votre commande.',
            en: 'Attachment received! 👍 I am checking this right away for your order.',
          },
          createdAt: new Date().toISOString(),
          deliveryStatus: 'read',
        };
        current.messages.push(replyMsg);
        saveMockState(current);
        this.updateConversationSummary(conversationId, replyMsg, false);
        this.setPresence(conversationId, 'online');
        this.emit({
          type: 'message_added',
          conversationId,
          message: structuredClone(replyMsg),
        });
      }, 850);
    }, 220);
  }
}

export class MockCallService implements CallService {
  private currentSession: CallSession | null = null;
  private readonly listeners = new Set<(session: CallSession | null) => void>();

  private notify(): void {
    const snapshot = this.currentSession
      ? structuredClone(this.currentSession)
      : null;
    this.listeners.forEach((l) => l(snapshot));
  }

  public getCurrentCall(): CallSession | null {
    return this.currentSession ? structuredClone(this.currentSession) : null;
  }

  public async startCall(
    conversationId: string,
    type: CallType
  ): Promise<CallSession> {
    const state = loadMockState();
    const conv =
      state.conversations.find((c) => c.id === conversationId) ??
      state.conversations[0];

    this.currentSession = {
      id: `call-${Date.now()}`,
      conversationId: conv.id,
      vendorName: conv.vendorName,
      vendorAvatarUrl: conv.vendorAvatarUrl,
      type,
      status: 'ringing',
      startedAt: new Date().toISOString(),
      isMuted: false,
      isSpeakerOn: type === 'video',
      isCameraOn: type === 'video',
    };
    this.notify();

    setTimeout(() => {
      if (this.currentSession && this.currentSession.status === 'ringing') {
        this.currentSession = {
          ...this.currentSession,
          status: 'connected',
          connectedAt: new Date().toISOString(),
        };
        this.notify();
      }
    }, 1800);

    return structuredClone(this.currentSession);
  }

  public async acceptCall(): Promise<CallSession | null> {
    if (!this.currentSession) {
      return null;
    }
    this.currentSession = {
      ...this.currentSession,
      status: 'connected',
      connectedAt: new Date().toISOString(),
    };
    this.notify();
    return structuredClone(this.currentSession);
  }

  public async endCall(): Promise<void> {
    if (!this.currentSession) {
      return;
    }
    this.currentSession = {
      ...this.currentSession,
      status: 'ended',
      endedAt: new Date().toISOString(),
    };
    this.notify();
    setTimeout(() => {
      this.currentSession = null;
      this.notify();
    }, 400);
  }

  public async toggleMute(): Promise<CallSession | null> {
    if (!this.currentSession) {
      return null;
    }
    this.currentSession = {
      ...this.currentSession,
      isMuted: !this.currentSession.isMuted,
    };
    this.notify();
    return structuredClone(this.currentSession);
  }

  public async toggleSpeaker(): Promise<CallSession | null> {
    if (!this.currentSession) {
      return null;
    }
    this.currentSession = {
      ...this.currentSession,
      isSpeakerOn: !this.currentSession.isSpeakerOn,
    };
    this.notify();
    return structuredClone(this.currentSession);
  }

  public async toggleCamera(): Promise<CallSession | null> {
    if (!this.currentSession) {
      return null;
    }
    this.currentSession = {
      ...this.currentSession,
      isCameraOn: !this.currentSession.isCameraOn,
    };
    this.notify();
    return structuredClone(this.currentSession);
  }

  public subscribe(listener: (session: CallSession | null) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
