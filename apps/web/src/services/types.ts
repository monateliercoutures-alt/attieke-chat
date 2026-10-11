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
  OrderItem,
  Presence,
  PresenceStatus,
  Product,
  ProductCategory,
  User,
  VoiceAttachment,
} from '@attieke-chat/shared';

export interface LoginInput {
  phoneOrEmail: string;
  password?: string;
}

export interface RegisterInput {
  name: string;
  phone: string;
  email?: string;
  wechatId?: string;
  preferredLocale: Locale;
}

export interface UpdateProfileInput {
  name: string;
  phone: string;
  email?: string;
  wechatId?: string;
  preferredLocale: Locale;
}

export interface SaveAddressInput {
  id?: string;
  label: string;
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  streetAddress: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface AuthService {
  getCurrentUser(): Promise<User | null>;
  login(input: LoginInput): Promise<User>;
  register(input: RegisterInput): Promise<User>;
  logout(): Promise<void>;
  updateProfile(input: UpdateProfileInput): Promise<User>;
  saveAddress(input: SaveAddressInput): Promise<User>;
  deleteAddress(addressId: string): Promise<User>;
}

export interface CatalogService {
  getProducts(category?: ProductCategory): Promise<Product[]>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductById(id: string): Promise<Product | null>;
}

export interface CreateOrderInput {
  items: OrderItem[];
  shippingAddressId?: string;
}

export interface OrderService {
  getOrders(): Promise<Order[]>;
  getOrderById(orderId: string): Promise<Order | null>;
  createOrder(input: CreateOrderInput): Promise<Order>;
  confirmOrder(orderId: string): Promise<Order>;
  advanceOrderStatus(orderId: string): Promise<Order>;
}

export interface MessagesPageOptions {
  beforeMessageId?: string;
  limit?: number;
}

export interface MessagesPageResult {
  messages: Message[];
  hasMore: boolean;
  totalCount: number;
}

export interface SendMessageOptions {
  conversationId?: string;
  replyTo?: MessageReplyReference;
  simulateFail?: boolean;
  offlineQueued?: boolean;
}

export interface ChatRealtimeEvent {
  type:
    | 'vendor_typing'
    | 'presence_changed'
    | 'message_added'
    | 'message_updated'
    | 'message_deleted'
    | 'conversation_updated'
    | 'order_updated';
  conversationId?: string;
  isTyping?: boolean;
  presenceStatus?: PresenceStatus;
  presence?: Presence;
  message?: Message;
  messageId?: string;
  conversation?: Conversation;
  order?: Order;
}

export type ChatRealtimeListener = (event: ChatRealtimeEvent) => void;

export interface ChatService {
  // Conversations (liste & détails)
  getConversations(): Promise<Conversation[]>;
  getConversation(conversationId?: string): Promise<Conversation>;
  pinConversation(conversationId: string, pinned: boolean): Promise<Conversation>;
  muteConversation(conversationId: string, muted: boolean): Promise<Conversation>;
  saveDraft(conversationId: string, draftText: string): Promise<Conversation>;
  markAllAsRead(conversationId?: string): Promise<void>;

  // Présence temps réel
  getPresence(conversationId: string): Promise<Presence>;
  getAllPresence(): Promise<Record<string, Presence>>;

  // Chargement & pagination des messages
  getMessages(conversationId?: string): Promise<Message[]>;
  getMessagesPage(
    conversationId: string,
    options?: MessagesPageOptions
  ): Promise<MessagesPageResult>;

  // Envoi de messages & gestion d'échec / hors-ligne
  sendTextMessage(
    content: string,
    locale: Locale,
    options?: SendMessageOptions
  ): Promise<Message>;
  retryMessage(messageId: string, locale: Locale): Promise<Message>;
  flushOfflineQueue(locale: Locale): Promise<Message[]>;

  // Pièces jointes & Messages vocaux
  sendImageMessage(
    imageDataUrl: string,
    caption: string | undefined,
    locale: Locale,
    options?: SendMessageOptions & { images?: ImageAttachmentItem[] }
  ): Promise<Message>;
  sendVoiceMessage(
    voice: VoiceAttachment,
    locale: Locale,
    options?: SendMessageOptions
  ): Promise<Message>;
  sendDocumentMessage(
    document: DocumentAttachment,
    caption: string | undefined,
    locale: Locale,
    options?: SendMessageOptions
  ): Promise<Message>;
  sendLocationMessage(
    location: LocationAttachment,
    locale: Locale,
    options?: SendMessageOptions
  ): Promise<Message>;
  sendContactMessage(
    contact: ContactAttachment,
    locale: Locale,
    options?: SendMessageOptions
  ): Promise<Message>;

  // Actions sur un message (réagir, étoile, supprimer, transférer)
  toggleReaction(
    messageId: string,
    emoji: string,
    sender?: 'customer' | 'vendor'
  ): Promise<Message>;
  toggleStarMessage(messageId: string): Promise<Message>;
  deleteMessage(
    messageId: string,
    mode: 'me' | 'everyone'
  ): Promise<Message | null>;
  forwardMessage(
    messageId: string,
    targetConversationId: string,
    locale: Locale
  ): Promise<Message>;

  // Actions commerce dans le chat
  sendProductInquiry(
    productSlugOrId: string,
    locale: Locale,
    conversationId?: string
  ): Promise<Message>;
  addProductToOrderFromChat(
    productId: string,
    quantity?: number,
    conversationId?: string
  ): Promise<Order>;
  confirmOrderInChat(orderId: string, conversationId?: string): Promise<Order>;
  simulateNextOrderStepInChat(
    orderId: string,
    conversationId?: string
  ): Promise<Order>;

  // Préférences de chat (thème, fond d'écran, taille de police, sons)
  getPreferences(): Promise<ChatPreferences>;
  updatePreferences(partial: Partial<ChatPreferences>): Promise<ChatPreferences>;

  // Abonnement temps réel & réinitialisation
  subscribe(listener: ChatRealtimeListener): () => void;
  clearMessages(conversationId?: string): Promise<void>;
  resetDemoState(): Promise<void>;
}

export type CallType = 'audio' | 'video';
export type CallStatus = 'idle' | 'ringing' | 'connected' | 'ended';

export interface CallSession {
  id: string;
  conversationId: string;
  vendorName: string;
  vendorAvatarUrl: string;
  type: CallType;
  status: CallStatus;
  startedAt?: string;
  connectedAt?: string;
  endedAt?: string;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isCameraOn: boolean;
}

export interface CallService {
  getCurrentCall(): CallSession | null;
  startCall(conversationId: string, type: CallType): Promise<CallSession>;
  acceptCall(): Promise<CallSession | null>;
  endCall(): Promise<void>;
  toggleMute(): Promise<CallSession | null>;
  toggleSpeaker(): Promise<CallSession | null>;
  toggleCamera(): Promise<CallSession | null>;
  subscribe(listener: (session: CallSession | null) => void): () => void;
}
