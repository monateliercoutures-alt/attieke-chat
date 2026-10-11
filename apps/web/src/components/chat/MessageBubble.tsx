'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type {
  ChatFontSize,
  ChatThemeMode,
  ImageAttachmentItem,
  Locale,
  Message,
  MessageDeliveryStatus,
  Order,
  Product,
} from '@attieke-chat/shared';
import type { ChatDictionary, CommonDictionary } from '@/lib/i18n';
import { formatTimeShort } from '@/lib/i18n';
import { ChatProductCard } from './ChatProductCard';
import { ChatOrderCard } from './ChatOrderCard';

export interface MessageBubbleProps {
  message: Message;
  locale: Locale;
  vendorAvatarUrl: string;
  vendorName: string;
  product?: Product;
  order?: Order;
  chatDict: ChatDictionary;
  statusDict: CommonDictionary['orderStatus'];
  isBusy: boolean;
  isHighlighted?: boolean;
  searchQuery?: string;
  themeMode?: ChatThemeMode;
  fontSize?: ChatFontSize;
  onAddToOrder: (productId: string, quantity: number) => Promise<void>;
  onConfirmOrder: (orderId: string) => Promise<void>;
  onAdvanceStep: (orderId: string) => Promise<void>;
  onOpenContextMenu?: (message: Message) => void;
  onReply?: (message: Message) => void;
  onToggleReaction?: (messageId: string, emoji: string) => void;
  onJumpToMessage?: (messageId: string) => void;
  onRetryMessage?: (messageId: string) => void;
  onOpenImageViewer?: (
    images: ImageAttachmentItem[],
    index: number,
    caption?: string
  ) => void;
  onQuickReplyText?: (text: string) => void;
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function highlightTextSegment(
  segment: string,
  query: string | undefined,
  keyPrefix: string
): React.ReactNode {
  if (!query || !query.trim()) {
    return segment;
  }
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = segment.split(regex);

  return parts.map((part, idx) =>
    part.toLowerCase() === query.trim().toLowerCase() ? (
      <mark
        key={`${keyPrefix}-hl-${idx}`}
        className="rounded bg-brand-gold px-0.5 font-extrabold text-brand-ink"
      >
        {part}
      </mark>
    ) : (
      <React.Fragment key={`${keyPrefix}-txt-${idx}`}>{part}</React.Fragment>
    )
  );
}

/**
 * Rend le texte avec liens cliquables et surbrillance de recherche sans aucun dangerouslySetInnerHTML (anti-XSS).
 */
function renderSafeRichText(
  text: string,
  searchQuery?: string
): React.ReactNode[] {
  const segments = text.split(URL_REGEX);
  return segments.map((seg, idx) => {
    if (seg.startsWith('http://') || seg.startsWith('https://')) {
      return (
        <a
          key={`url-${idx}`}
          href={seg}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-brand-green underline break-all hover:text-brand-green-dark"
          onClick={(e) => e.stopPropagation()}
        >
          {highlightTextSegment(seg, searchQuery, `url-${idx}`)}
        </a>
      );
    }
    return (
      <React.Fragment key={`seg-${idx}`}>
        {highlightTextSegment(seg, searchQuery, `seg-${idx}`)}
      </React.Fragment>
    );
  });
}

function DeliveryStatusIndicator({
  status,
  dict,
}: {
  status: MessageDeliveryStatus;
  dict: ChatDictionary['messages'];
}): React.JSX.Element {
  if (status === 'sending') {
    return (
      <span
        aria-label={dict.sendingStatus}
        title={dict.sendingStatus}
        className="inline-flex items-center text-[11px] text-brand-ink-muted"
      >
        🕒
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span
        aria-label={dict.failedStatus}
        title={dict.failedStatus}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-extrabold text-white"
      >
        !
      </span>
    );
  }
  if (status === 'sent') {
    return (
      <span
        aria-label={dict.sentStatus}
        title={dict.sentStatus}
        className="text-[11px] font-bold text-brand-ink-muted"
      >
        ✓
      </span>
    );
  }
  if (status === 'delivered') {
    return (
      <span
        aria-label={dict.deliveredStatus}
        title={dict.deliveredStatus}
        className="text-[11px] font-bold tracking-tighter text-brand-ink-muted"
      >
        ✓✓
      </span>
    );
  }
  return (
    <span
      aria-label={dict.readStatus}
      title={dict.readStatus}
      className="text-[11px] font-extrabold tracking-tighter text-[#0284C7]"
    >
      ✓✓
    </span>
  );
}

export function MessageBubble({
  message,
  locale,
  vendorAvatarUrl,
  vendorName,
  product,
  order,
  chatDict,
  statusDict,
  isBusy,
  isHighlighted = false,
  searchQuery,
  themeMode = 'light',
  fontSize = 'medium',
  onAddToOrder,
  onConfirmOrder,
  onAdvanceStep,
  onOpenContextMenu,
  onReply,
  onToggleReaction,
  onJumpToMessage,
  onRetryMessage,
  onOpenImageViewer,
  onQuickReplyText,
}: MessageBubbleProps): React.JSX.Element {
  const timeText = formatTimeShort(message.createdAt, locale);

  // Lecteur vocal intégré (1x / 1.5x / 2x + progression)
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  const [voiceProgress, setVoiceProgress] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<1 | 1.5 | 2>(1);
  const voiceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Gestes tactiles : appui long (menu) et glissement latéral (répondre)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);

  useEffect(() => {
    return () => {
      if (voiceIntervalRef.current) {
        clearInterval(voiceIntervalRef.current);
      }
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isPlayingVoice || !message.voice) {
      if (voiceIntervalRef.current) {
        clearInterval(voiceIntervalRef.current);
        voiceIntervalRef.current = null;
      }
      return;
    }

    const durationMs = (message.voice.durationSec * 1000) / playbackRate;
    const stepMs = 100;
    const increment = (stepMs / durationMs) * 100;

    voiceIntervalRef.current = setInterval(() => {
      setVoiceProgress((prev) => {
        if (prev + increment >= 100) {
          setIsPlayingVoice(false);
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => {
      if (voiceIntervalRef.current) {
        clearInterval(voiceIntervalRef.current);
      }
    };
  }, [isPlayingVoice, message.voice, playbackRate]);

  const toggleCycleSpeed = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setPlaybackRate((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1));
  };

  const handleTouchStart = (e: React.TouchEvent): void => {
    const touch = e.touches[0];
    if (touch) {
      touchStartXRef.current = touch.clientX;
    }
    if (onOpenContextMenu) {
      longPressTimerRef.current = setTimeout(() => {
        onOpenContextMenu(message);
      }, 520);
    }
  };

  const handleTouchMove = (e: React.TouchEvent): void => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    const startX = touchStartXRef.current;
    const touch = e.touches[0];
    if (startX === null || !touch) {
      return;
    }
    const deltaX = touch.clientX - startX;
    if (deltaX > 10 && deltaX < 75) {
      setSwipeOffset(deltaX);
    }
  };

  const handleTouchEnd = (): void => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (swipeOffset > 45 && onReply) {
      onReply(message);
    }
    setSwipeOffset(0);
    touchStartXRef.current = null;
  };

  const fontSizeClass =
    fontSize === 'small'
      ? 'text-xs'
      : fontSize === 'large'
      ? 'text-base'
      : 'text-sm';

  // 1. Message système centré (événement de statut de commande)
  if (message.type === 'status_event' || message.sender === 'system') {
    const evt = message.statusEvent;
    const statusLabel = evt ? statusDict[evt.status] : '';
    const noteText = evt ? evt.note[locale] : message.text?.[locale] ?? '';

    return (
      <div
        id={`chat-msg-${message.id}`}
        className="my-3 flex justify-center px-2"
      >
        <div className="inline-flex max-w-md flex-col items-center gap-1 rounded-2xl border border-brand-green/20 bg-white/95 px-4 py-2.5 text-center text-xs shadow-sm">
          <span className="inline-flex items-center gap-1.5 font-extrabold text-brand-green">
            <span aria-hidden="true">📦</span>
            <span>
              {chatDict.messages.systemEventPrefix} · {statusLabel}
            </span>
          </span>
          <p className="text-brand-ink-muted">
            {renderSafeRichText(noteText, searchQuery)}
          </p>
          <span className="text-[10px] text-brand-ink-muted/80">{timeText}</span>
        </div>
      </div>
    );
  }

  const isCustomer = message.sender === 'customer';
  const bubbleBgClass = isCustomer
    ? themeMode === 'dark'
      ? 'bg-[#005C4B] text-white'
      : 'bg-[#D9FDD3] text-brand-ink'
    : themeMode === 'dark'
    ? 'bg-[#202C33] text-white'
    : 'bg-white text-brand-ink';

  const imageItems: ImageAttachmentItem[] =
    message.images && message.images.length > 0
      ? message.images
      : message.imageUrl
      ? [
          {
            id: `${message.id}-img-0`,
            url: message.imageUrl,
            thumbnailUrl: message.imageUrl,
          },
        ]
      : [];

  return (
    <div
      id={`chat-msg-${message.id}`}
      onContextMenu={(e) => {
        if (onOpenContextMenu) {
          e.preventDefault();
          onOpenContextMenu(message);
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={
        swipeOffset > 0
          ? { transform: `translateX(${swipeOffset}px)` }
          : undefined
      }
      className={`group relative flex items-start gap-2 transition-all duration-200 ${
        isCustomer ? 'justify-end' : 'justify-start'
      } ${
        isHighlighted
          ? 'rounded-3xl bg-brand-gold/30 p-1.5 ring-2 ring-brand-gold'
          : ''
      }`}
    >
      {/* Avatar Vendeur à gauche */}
      {!isCustomer && (
        <div className="relative mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-full border border-brand-gold bg-brand-green shadow-xs sm:h-9 sm:w-9">
          <Image
            src={vendorAvatarUrl}
            alt={vendorName}
            fill
            sizes="36px"
            className="object-cover"
          />
        </div>
      )}

      <div
        className={`relative flex max-w-[85%] flex-col sm:max-w-[72%] ${
          isCustomer ? 'items-end' : 'items-start'
        }`}
      >
        {/* Petite queue de bulle SVG style WhatsApp */}
        {message.type !== 'product_card' && message.type !== 'order_card' && (
          <svg
            viewBox="0 0 8 13"
            width="8"
            height="13"
            aria-hidden="true"
            className={`pointer-events-none absolute top-0 h-3 w-2 ${
              isCustomer
                ? `-right-1.5 ${
                    themeMode === 'dark' ? 'text-[#005C4B]' : 'text-[#D9FDD3]'
                  }`
                : `-left-1.5 ${
                    themeMode === 'dark' ? 'text-[#202C33]' : 'text-white'
                  }`
            }`}
          >
            {isCustomer ? (
              <path
                fill="currentColor"
                d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"
              />
            ) : (
              <path
                fill="currentColor"
                d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"
              />
            )}
          </svg>
        )}

        {/* Bouton d'ouverture rapide du menu d'actions (survol ou focus) */}
        {onOpenContextMenu && !message.deletedForEveryone && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenContextMenu(message);
            }}
            aria-label={chatDict.messages.moreActionsAria}
            className={`absolute top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/10 text-[11px] font-bold opacity-80 transition-opacity hover:bg-black/20 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 ${
              isCustomer ? 'left-1.5' : 'right-1.5'
            }`}
          >
            ▾
          </button>
        )}

        {/* A. Bulle Texte / Vocal / Document / Position / Contact */}
        {(message.type === 'text' ||
          message.type === 'voice' ||
          message.type === 'document' ||
          message.type === 'location' ||
          message.type === 'contact') && (
          <div
            className={`relative rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-xs ${fontSizeClass} ${
              isCustomer ? 'rounded-tr-none' : 'rounded-tl-none'
            } ${bubbleBgClass}`}
          >
            {/* Badge "↪ Transféré" */}
            {message.forwarded && (
              <p className="mb-1 text-[11px] italic opacity-75">
                {chatDict.messages.forwardedBadge}
              </p>
            )}

            {/* Citation cliquable (ReplyTo) */}
            {message.replyTo && !message.deletedForEveryone && (
              <button
                type="button"
                onClick={() =>
                  onJumpToMessage && onJumpToMessage(message.replyTo!.messageId)
                }
                className="mb-2 flex w-full items-center gap-2 rounded-xl border-l-4 border-brand-green bg-black/8 px-3 py-1.5 text-left text-xs transition-colors hover:bg-black/12"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-brand-green">
                    {message.replyTo.sender === 'customer'
                      ? chatDict.conversationList.youPrefix
                      : vendorName}
                  </p>
                  <p className="truncate opacity-85">
                    {message.replyTo.previewText[locale]}
                  </p>
                </div>
                {message.replyTo.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={message.replyTo.thumbnailUrl}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-lg object-cover"
                  />
                )}
              </button>
            )}

            {/* Lecteur de message vocal avec forme d'onde & vitesse 1x/1.5x/2x */}
            {message.type === 'voice' &&
              message.voice &&
              !message.deletedForEveryone && (
                <div className="flex items-center gap-2.5 py-1 min-w-[210px] sm:min-w-[250px]">
                  <button
                    type="button"
                    onClick={() => setIsPlayingVoice((p) => !p)}
                    aria-label={
                      isPlayingVoice
                        ? chatDict.messages.voicePauseAria
                        : chatDict.messages.voicePlayAria
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green text-xs font-extrabold text-white shadow-xs hover:bg-brand-green-dark"
                  >
                    {isPlayingVoice ? '⏸' : '▶'}
                  </button>

                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex h-6 items-end gap-0.5">
                      {message.voice.waveform.slice(0, 24).map((val, idx) => {
                        const pct = (idx / 24) * 100;
                        const isPlayed = pct <= voiceProgress;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setVoiceProgress(pct)}
                            style={{ height: `${Math.max(22, val)}%` }}
                            className={`w-1.5 rounded-full transition-colors ${
                              isPlayed
                                ? 'bg-brand-green'
                                : 'bg-brand-green/35 hover:bg-brand-green/60'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-[10px] opacity-75">
                      <span className="font-mono font-bold">
                        0:
                        {String(
                          isPlayingVoice
                            ? Math.floor(
                                (voiceProgress / 100) *
                                  message.voice.durationSec
                              )
                            : message.voice.durationSec
                        ).padStart(2, '0')}
                      </span>
                      <button
                        type="button"
                        onClick={toggleCycleSpeed}
                        className="rounded-full bg-black/10 px-2 py-0.2 font-extrabold hover:bg-black/20"
                      >
                        {playbackRate}x
                      </button>
                    </div>
                  </div>
                </div>
              )}

            {/* Pièce jointe Document (PDF) */}
            {message.type === 'document' &&
              message.document &&
              !message.deletedForEveryone && (
                <div className="mb-1.5 flex items-center gap-3 rounded-xl border border-black/10 bg-black/5 p-2.5 text-xs">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-xs font-extrabold text-white">
                    PDF
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold">
                      {renderSafeRichText(
                        message.document.fileName,
                        searchQuery
                      )}
                    </p>
                    <p className="text-[10px] opacity-75">
                      {Math.round(message.document.fileSizeBytes / 1024)} KB
                      {message.document.pageCount
                        ? ` · ${message.document.pageCount} p.`
                        : ''}
                    </p>
                  </div>
                </div>
              )}

            {/* Pièce jointe Position géographique (Carte simple mockée) */}
            {message.type === 'location' &&
              message.location &&
              !message.deletedForEveryone && (
                <div className="mb-1 overflow-hidden rounded-xl border border-brand-green/25 bg-brand-green-soft/40">
                  <div className="relative flex h-24 w-full items-center justify-center bg-gradient-to-br from-emerald-100 via-teal-50 to-amber-50 text-brand-green">
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 opacity-25 [background-image:radial-gradient(#0F4C3A_1px,transparent_1px)] [background-size:12px_12px]"
                    />
                    <div className="relative flex flex-col items-center">
                      <span className="text-2xl drop-shadow">📍</span>
                      <span className="rounded-full bg-white/90 px-2 py-0.5 font-mono text-[10px] font-bold text-brand-ink shadow-xs">
                        {message.location.latitude.toFixed(4)},{' '}
                        {message.location.longitude.toFixed(4)}
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5 text-xs">
                    <p className="font-extrabold text-brand-green">
                      {renderSafeRichText(
                        message.location.title[locale],
                        searchQuery
                      )}
                    </p>
                    <p className="mt-0.5 text-[11px] opacity-80">
                      {message.location.address[locale]}
                    </p>
                  </div>
                </div>
              )}

            {/* Pièce jointe Contact */}
            {message.type === 'contact' &&
              message.contact &&
              !message.deletedForEveryone && (
                <div className="mb-1 rounded-xl border border-black/10 bg-black/5 p-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green text-sm font-extrabold text-white">
                      👤
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-extrabold">
                        {message.contact.name}
                      </p>
                      <p className="truncate text-[11px] font-semibold text-brand-green">
                        {message.contact.role[locale]}
                      </p>
                      <p className="font-mono text-[11px] opacity-80">
                        {message.contact.phone}
                      </p>
                    </div>
                  </div>
                  {onQuickReplyText && (
                    <button
                      type="button"
                      onClick={() =>
                        onQuickReplyText(
                          `${message.contact!.name} (${message.contact!.phone})`
                        )
                      }
                      className="mt-2 w-full rounded-lg bg-brand-green/15 py-1 text-center text-[11px] font-extrabold text-brand-green hover:bg-brand-green hover:text-white"
                    >
                      💬 {chatDict.messages.messageContactButton}
                    </button>
                  )}
                </div>
              )}

            {/* Contenu texte principal */}
            {message.text && (
              <p
                className={`whitespace-pre-wrap break-words ${
                  message.deletedForEveryone ? 'italic opacity-70' : ''
                }`}
              >
                {renderSafeRichText(message.text[locale], searchQuery)}
              </p>
            )}

            {/* Pied de bulle : étoile + heure + accusé de réception */}
            <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-75">
              {message.starred && (
                <span
                  aria-label={chatDict.messages.starredAria}
                  className="text-amber-500"
                >
                  ★
                </span>
              )}
              <span>{timeText}</span>
              {isCustomer && (
                <DeliveryStatusIndicator
                  status={message.deliveryStatus}
                  dict={chatDict.messages}
                />
              )}
            </div>
          </div>
        )}

        {/* B. Bulle Image (Photo unique ou Grille multi-images avec Visionneuse) */}
        {message.type === 'image' && imageItems.length > 0 && (
          <div
            className={`overflow-hidden rounded-2xl p-2 shadow-xs ${
              isCustomer ? 'rounded-tr-none' : 'rounded-tl-none'
            } ${bubbleBgClass}`}
          >
            {imageItems.length === 1 ? (
              <button
                type="button"
                onClick={() =>
                  onOpenImageViewer &&
                  onOpenImageViewer(
                    imageItems,
                    0,
                    message.imageCaption?.[locale]
                  )
                }
                className="relative block aspect-[4/3] w-60 overflow-hidden rounded-xl bg-brand-cream-subtle sm:w-72"
              >
                {imageItems[0].url.startsWith('data:') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageItems[0].url}
                    alt={
                      message.imageCaption?.[locale] ??
                      chatDict.messages.imageSentAlt
                    }
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                ) : (
                  <Image
                    src={imageItems[0].url}
                    alt={
                      message.imageCaption?.[locale] ??
                      chatDict.messages.imageSentAlt
                    }
                    fill
                    sizes="288px"
                    className="object-cover transition-transform hover:scale-105"
                  />
                )}
              </button>
            ) : (
              <div className="grid w-64 grid-cols-2 gap-1.5 sm:w-72">
                {imageItems.slice(0, 4).map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      onOpenImageViewer &&
                      onOpenImageViewer(
                        imageItems,
                        idx,
                        message.imageCaption?.[locale]
                      )
                    }
                    className="relative aspect-square overflow-hidden rounded-xl bg-brand-cream-subtle"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnailUrl ?? item.url}
                      alt=""
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                    {idx === 3 && imageItems.length > 4 && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-extrabold text-white">
                        +{imageItems.length - 4}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {message.imageCaption && (
              <p className="mt-2 max-w-[270px] px-1 text-xs font-medium">
                {renderSafeRichText(message.imageCaption[locale], searchQuery)}
              </p>
            )}
            <div className="mt-1 flex items-center justify-end gap-1 px-1 text-[10px] opacity-75">
              {message.starred && <span className="text-amber-500">★</span>}
              <span>{timeText}</span>
              {isCustomer && (
                <DeliveryStatusIndicator
                  status={message.deliveryStatus}
                  dict={chatDict.messages}
                />
              )}
            </div>
          </div>
        )}

        {/* C. Bulle Carte Produit */}
        {message.type === 'product_card' && product && (
          <div className="space-y-1.5">
            {message.text && (
              <div
                className={`rounded-2xl rounded-tl-none px-4 py-2.5 shadow-xs ${fontSizeClass} ${bubbleBgClass}`}
              >
                <p>{renderSafeRichText(message.text[locale], searchQuery)}</p>
              </div>
            )}
            <ChatProductCard
              product={product}
              locale={locale}
              dict={chatDict.productCard}
              isBusy={isBusy}
              onAddToOrder={onAddToOrder}
            />
            <span className="block px-1 text-[10px] text-brand-ink-muted">
              {timeText}
            </span>
          </div>
        )}

        {/* D. Bulle Carte Commande */}
        {message.type === 'order_card' && order && (
          <div className="w-full space-y-1">
            <ChatOrderCard
              order={order}
              locale={locale}
              dict={chatDict.orderCard}
              statusDict={statusDict}
              isBusy={isBusy}
              onConfirmOrder={onConfirmOrder}
              onAdvanceStep={onAdvanceStep}
            />
            <span className="block px-1 text-[10px] text-brand-ink-muted">
              {timeText}
            </span>
          </div>
        )}

        {/* Bouton "Renvoyer" si le message est en échec (failed) */}
        {message.deliveryStatus === 'failed' && onRetryMessage && (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[11px] font-bold text-red-600">
              {chatDict.messages.failedStatus}
            </span>
            <button
              type="button"
              onClick={() => onRetryMessage(message.id)}
              className="rounded-full bg-red-600 px-3 py-0.5 text-[11px] font-extrabold text-white shadow-xs hover:bg-red-700"
            >
              ↻ {chatDict.messages.retryButton}
            </button>
          </div>
        )}

        {/* Pastille des réactions par emoji sous la bulle */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="-mt-1.5 z-10 flex items-center gap-1 rounded-full border border-brand-ink/15 bg-white px-2 py-0.5 text-xs shadow-xs">
            {message.reactions.map((r, i) => (
              <button
                key={`${r.emoji}-${i}`}
                type="button"
                onClick={() =>
                  onToggleReaction && onToggleReaction(message.id, r.emoji)
                }
                className="transition-transform hover:scale-125"
              >
                {r.emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
