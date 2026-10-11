import { z } from 'zod';

// ============================================================================
// 1. INTERNATIONALISATION (zh par défaut, fr, en)
// ============================================================================

export const LocaleSchema = z.enum(['zh', 'fr', 'en']);
export type Locale = z.infer<typeof LocaleSchema>;

export const SUPPORTED_LOCALES: readonly Locale[] = ['zh', 'fr', 'en'] as const;
export const DEFAULT_LOCALE: Locale = 'zh';

export const LocalizedTextSchema = z.object({
  zh: z.string(),
  fr: z.string(),
  en: z.string(),
});
export type LocalizedText = z.infer<typeof LocalizedTextSchema>;

export type CurrencyCode = 'CNY';

// ============================================================================
// 2. ADRESSES DE LIVRAISON EN CHINE & UTILISATEUR (User)
// ============================================================================

export const AddressSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  recipientName: z.string().min(2),
  phone: z.string().min(6),
  province: z.string().min(1),
  city: z.string().min(1),
  district: z.string().min(1),
  streetAddress: z.string().min(3),
  postalCode: z.string().optional(),
  isDefault: z.boolean(),
});
export type Address = z.infer<typeof AddressSchema>;

export const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email().optional(),
  wechatId: z.string().optional(),
  preferredLocale: LocaleSchema,
  avatarUrl: z.string().optional(),
  addresses: z.array(AddressSchema),
  createdAt: z.string(),
});
export type User = z.infer<typeof UserSchema>;

// ============================================================================
// 3. CATALOGUE PRODUITS (Product)
// ============================================================================

export const ProductCategorySchema = z.enum([
  'attieke',
  'combo_fish',
  'combo_meat',
  'condiment',
]);
export type ProductCategory = z.infer<typeof ProductCategorySchema>;

export const ProductSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  category: ProductCategorySchema,
  name: LocalizedTextSchema,
  shortDescription: LocalizedTextSchema,
  fullDescription: LocalizedTextSchema,
  weightKg: z.number().positive(),
  formatLabel: LocalizedTextSchema,
  priceYuan: z.number().positive(),
  currency: z.literal('CNY'),
  imageSrc: z.string().min(1),
  inStock: z.boolean(),
  featured: z.boolean(),
  preparationTips: LocalizedTextSchema,
});
export type Product = z.infer<typeof ProductSchema>;

// ============================================================================
// 4. COMMANDES & 7 ÉTAPES DE SUIVI (Order, OrderStatus, OrderStatusEvent)
// ============================================================================

export const OrderStatusSchema = z.enum([
  'pending',          // 1. En attente
  'confirmed',        // 2. Confirmée
  'paid',             // 3. Payée
  'shipped',          // 4. Expédiée (Abidjan)
  'customs',          // 5. En douane
  'in_china_transit', // 6. Livrée en Chine (transit SF Express)
  'delivered',        // 7. Livrée au client
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const ORDER_STATUS_SEQUENCE: readonly OrderStatus[] = [
  'pending',
  'confirmed',
  'paid',
  'shipped',
  'customs',
  'in_china_transit',
  'delivered',
] as const;

export const OrderStatusEventSchema = z.object({
  id: z.string().min(1),
  status: OrderStatusSchema,
  timestamp: z.string(),
  location: LocalizedTextSchema,
  note: LocalizedTextSchema,
  completed: z.boolean(),
});
export type OrderStatusEvent = z.infer<typeof OrderStatusEventSchema>;

export const OrderItemSchema = z.object({
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  productName: LocalizedTextSchema,
  productImage: z.string().min(1),
  weightKg: z.number().positive(),
  unitPriceYuan: z.number().positive(),
  quantity: z.number().int().positive(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.string().min(1),
  orderNumber: z.string().min(1),
  userId: z.string().min(1),
  items: z.array(OrderItemSchema).min(1),
  subtotalYuan: z.number().nonnegative(),
  shippingFeeYuan: z.number().nonnegative(),
  totalYuan: z.number().nonnegative(),
  currency: z.literal('CNY'),
  status: OrderStatusSchema,
  trackingNumber: z.string().optional(),
  shippingAddress: AddressSchema,
  timeline: z.array(OrderStatusEventSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Order = z.infer<typeof OrderSchema>;

// ============================================================================
// 5. MESSAGERIE TEMPS RÉEL WHATSAPP (Presence, Attachment, Message, Conversation)
// ============================================================================

export const MessageSenderSchema = z.enum(['customer', 'vendor', 'system']);
export type MessageSender = z.infer<typeof MessageSenderSchema>;

/**
 * États d'envoi WhatsApp :
 * - sending   : horloge (en cours d'envoi ou en file d'attente hors-ligne)
 * - sent      : ✓ envoyé au serveur
 * - delivered : ✓✓ remis sur l'appareil du destinataire
 * - read      : ✓✓ bleu lu par le destinataire
 * - failed    : ! échec d'envoi avec bouton "Renvoyer"
 */
export const MessageDeliveryStatusSchema = z.enum([
  'sending',
  'sent',
  'delivered',
  'read',
  'failed',
]);
export type MessageDeliveryStatus = z.infer<typeof MessageDeliveryStatusSchema>;

const DELIVERY_STATUS_RANK: Record<Exclude<MessageDeliveryStatus, 'failed'>, number> = {
  sending: 0,
  sent: 1,
  delivered: 2,
  read: 3,
};

/**
 * Vérifie si une transition d'état d'envoi est valide selon les règles WhatsApp :
 * - De `sending`, on peut aller vers `sent`, `delivered`, `read` ou `failed`.
 * - De `failed`, on ne peut aller que vers `sending` (lors d'un clic sur "Renvoyer").
 * - Entre `sent` -> `delivered` -> `read`, l'état est strictement monotone croissant
 *   (un message déjà `read` ne redescend jamais à `sent` ou `delivered`).
 */
export function canTransitionDeliveryStatus(
  from: MessageDeliveryStatus,
  to: MessageDeliveryStatus
): boolean {
  if (from === to) {
    return true;
  }
  if (from === 'failed') {
    return to === 'sending';
  }
  if (to === 'failed') {
    return from === 'sending';
  }
  return DELIVERY_STATUS_RANK[to] > DELIVERY_STATUS_RANK[from];
}

/**
 * Retourne le prochain état d'envoi autorisé (ignore les régressions d'état).
 */
export function resolveDeliveryStatusTransition(
  current: MessageDeliveryStatus,
  incoming: MessageDeliveryStatus
): MessageDeliveryStatus {
  return canTransitionDeliveryStatus(current, incoming) ? incoming : current;
}

export const PresenceStatusSchema = z.enum([
  'online',
  'offline',
  'typing',
  'recording_voice',
]);
export type PresenceStatus = z.infer<typeof PresenceStatusSchema>;

export const PresenceSchema = z.object({
  conversationId: z.string().min(1),
  status: PresenceStatusSchema,
  lastSeenAt: z.string(),
  updatedAt: z.string(),
});
export type Presence = z.infer<typeof PresenceSchema>;

export const MessageTypeSchema = z.enum([
  'text',
  'image',
  'voice',
  'document',
  'location',
  'contact',
  'product_card',
  'order_card',
  'status_event',
]);
export type MessageType = z.infer<typeof MessageTypeSchema>;

export const ImageAttachmentItemSchema = z.object({
  id: z.string().min(1),
  url: z.string().min(1),
  thumbnailUrl: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
  mimeType: z.string().optional(),
});
export type ImageAttachmentItem = z.infer<typeof ImageAttachmentItemSchema>;

export const VoiceAttachmentSchema = z.object({
  id: z.string().min(1),
  url: z.string().min(1),
  durationSec: z.number().positive(),
  waveform: z.array(z.number().min(0).max(100)).min(8),
  mimeType: z.string().default('audio/webm'),
});
export type VoiceAttachment = z.infer<typeof VoiceAttachmentSchema>;

export const DocumentAttachmentSchema = z.object({
  id: z.string().min(1),
  url: z.string().min(1),
  fileName: z.string().min(1),
  fileSizeBytes: z.number().int().positive(),
  mimeType: z.string().min(1),
  pageCount: z.number().int().positive().optional(),
});
export type DocumentAttachment = z.infer<typeof DocumentAttachmentSchema>;

export const LocationAttachmentSchema = z.object({
  id: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  title: LocalizedTextSchema,
  address: LocalizedTextSchema,
});
export type LocationAttachment = z.infer<typeof LocationAttachmentSchema>;

export const ContactAttachmentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().min(4),
  wechatId: z.string().optional(),
  role: LocalizedTextSchema,
  avatarUrl: z.string().optional(),
});
export type ContactAttachment = z.infer<typeof ContactAttachmentSchema>;

export const AttachmentSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('image'), item: ImageAttachmentItemSchema }),
  z.object({ kind: z.literal('voice'), item: VoiceAttachmentSchema }),
  z.object({ kind: z.literal('document'), item: DocumentAttachmentSchema }),
  z.object({ kind: z.literal('location'), item: LocationAttachmentSchema }),
  z.object({ kind: z.literal('contact'), item: ContactAttachmentSchema }),
]);
export type Attachment = z.infer<typeof AttachmentSchema>;

export const MessageReactionSchema = z.object({
  emoji: z.string().min(1),
  sender: z.enum(['customer', 'vendor']),
  createdAt: z.string(),
});
export type MessageReaction = z.infer<typeof MessageReactionSchema>;

export const MessageReplyReferenceSchema = z.object({
  messageId: z.string().min(1),
  sender: MessageSenderSchema,
  type: MessageTypeSchema,
  previewText: LocalizedTextSchema,
  thumbnailUrl: z.string().optional(),
});
export type MessageReplyReference = z.infer<typeof MessageReplyReferenceSchema>;

export const MessageSchema = z.object({
  id: z.string().min(1),
  conversationId: z.string().min(1),
  sender: MessageSenderSchema,
  type: MessageTypeSchema,
  text: LocalizedTextSchema.optional(),
  imageUrl: z.string().optional(),
  imageCaption: LocalizedTextSchema.optional(),
  images: z.array(ImageAttachmentItemSchema).optional(),
  voice: VoiceAttachmentSchema.optional(),
  document: DocumentAttachmentSchema.optional(),
  location: LocationAttachmentSchema.optional(),
  contact: ContactAttachmentSchema.optional(),
  productId: z.string().optional(),
  orderId: z.string().optional(),
  statusEvent: OrderStatusEventSchema.optional(),
  replyTo: MessageReplyReferenceSchema.optional(),
  reactions: z.array(MessageReactionSchema).optional(),
  starred: z.boolean().optional(),
  deletedForMe: z.boolean().optional(),
  deletedForEveryone: z.boolean().optional(),
  forwarded: z.boolean().optional(),
  createdAt: z.string(),
  sentAt: z.string().optional(),
  deliveredAt: z.string().optional(),
  readAt: z.string().optional(),
  failedReason: z.string().optional(),
  deliveryStatus: MessageDeliveryStatusSchema,
});
export type Message = z.infer<typeof MessageSchema>;

export const ConversationSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  vendorName: z.string().min(1),
  vendorRole: LocalizedTextSchema.optional(),
  vendorAvatarUrl: z.string().min(1),
  vendorOnline: z.boolean(),
  presenceStatus: PresenceStatusSchema.optional(),
  lastSeenAt: z.string().optional(),
  unreadCount: z.number().int().nonnegative(),
  pinned: z.boolean().optional(),
  muted: z.boolean().optional(),
  draftText: z.string().optional(),
  lastMessageId: z.string().optional(),
  lastMessagePreview: LocalizedTextSchema.optional(),
  lastMessageType: MessageTypeSchema.optional(),
  lastMessageSender: MessageSenderSchema.optional(),
  lastMessageStatus: MessageDeliveryStatusSchema.optional(),
  lastMessageAt: z.string(),
  activeDraftOrderItems: z.array(OrderItemSchema),
});
export type Conversation = z.infer<typeof ConversationSchema>;

export const ChatWallpaperSchema = z.enum([
  'ivory_pattern',
  'emerald_mist',
  'warm_sand',
  'night_forest',
  'plain_cream',
]);
export type ChatWallpaper = z.infer<typeof ChatWallpaperSchema>;

export const ChatThemeModeSchema = z.enum(['light', 'dark']);
export type ChatThemeMode = z.infer<typeof ChatThemeModeSchema>;

export const ChatFontSizeSchema = z.enum(['small', 'medium', 'large']);
export type ChatFontSize = z.infer<typeof ChatFontSizeSchema>;

export const ChatPreferencesSchema = z.object({
  theme: ChatThemeModeSchema,
  wallpaper: ChatWallpaperSchema,
  fontSize: ChatFontSizeSchema,
  soundEnabled: z.boolean(),
  notificationsEnabled: z.boolean(),
});
export type ChatPreferences = z.infer<typeof ChatPreferencesSchema>;

export const QUICK_REACTION_EMOJIS: readonly string[] = [
  '❤️',
  '👍',
  '🔥',
  '🙏',
  '😋',
  '🎉',
] as const;

// ============================================================================
// 6. TYPES D'AFFICHAGE PAGE D'ACCUEIL
// ============================================================================

export interface ProductMock {
  id: string;
  slug: string;
  weightKg: number;
  priceYuan: number;
  currency: CurrencyCode;
  imageSrc: string;
  featured?: boolean;
  translationKey: 'attiekeSolo' | 'attiekeTilapia' | 'attiekeKedjenou';
}

export interface DeliveryStepMock {
  id: string;
  stepNumber: number;
  icon: 'origin' | 'departure' | 'airFreight' | 'customs' | 'delivered';
  status: 'completed' | 'active' | 'upcoming';
  translationKey: 'abidjan' | 'departure' | 'airFreight' | 'customs' | 'chinaDelivery';
}

export interface TestimonialMock {
  id: string;
  rating: 5;
  avatarInitials: string;
  translationKey: 'review1' | 'review2' | 'review3';
}

export interface FaqItemMock {
  id: string;
  translationKey: 'shippingTime' | 'storage' | 'paymentMethods' | 'deliveryZones' | 'orderTracking';
}
