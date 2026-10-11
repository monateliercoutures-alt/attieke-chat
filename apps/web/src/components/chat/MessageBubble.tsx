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
import { ReactionBar } from './ReactionBar';

export interface MessageBubbleProps {
  message: Message;
  isFirstInSeries?: boolean;
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
        className="rounded bg-wa-commerce/60 px-0.5 font-semibold text-wa-text-primary"
      >
        {part}
      </mark>
    ) : (
      <React.Fragment key={`${keyPrefix}-txt-${idx}`}>{part}</React.Fragment>
    )
  );
}

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
          className="font-medium text-wa-dark-green dark:text-wa-read-tick underline break-all"
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
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-label={dict.sendingStatus}
        className="h-3.5 w-3.5 text-wa-text-secondary"
      >
        <circle cx="8" cy="8" r="6" />
        <path strokeLinecap="round" d="M8 4.5V8l2.5 1.5" />
      </svg>
    );
  }
  if (status === 'failed') {
    return (
      <span
        aria-label={dict.failedStatus}
        title={dict.failedStatus}
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-wa-meta font-bold text-white"
      >
        !
      </span>
    );
  }
  if (status === 'sent') {
    return (
      <svg
        viewBox="0 0 16 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-label={dict.sentStatus}
        className="h-3.5 w-3.5 text-wa-text-secondary"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.5 8l3.5 3.5 7.5-7.5"
        />
      </svg>
    );
  }
  const tickColor =
    status === 'read' ? 'text-wa-read-tick' : 'text-wa-text-secondary';
  return (
    <svg
      viewBox="0 0 18 15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-label={status === 'read' ? dict.readStatus : dict.deliveredStatus}
      className={`h-3.5 w-4 ${tickColor}`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M1.5 8l3.2 3.2L11.5 4"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.5 8l3.2 3.2L16.5 4"
      />
    </svg>
  );
}

export function MessageBubble({
  message,
  isFirstInSeries = true,
  locale,
  vendorName,
  product,
  order,
  chatDict,
  statusDict,
  isBusy,
  isHighlighted = false,
  searchQuery,
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
  const [isExpandedText, setIsExpandedText] = useState<boolean>(false);
  const [showHoverReactions, setShowHoverReactions] = useState<boolean>(false);

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
      }, 500);
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
      ? 'text-wa-meta'
      : fontSize === 'large'
      ? 'text-wa-contact font-normal'
      : 'text-wa-msg';

  // 1. Bulle de message système (date / statut de commande) : #FFEECD avec texte #54656F
  if (message.type === 'status_event' || message.sender === 'system') {
    const evt = message.statusEvent;
    const statusLabel = evt ? statusDict[evt.status] : '';
    const noteText = evt ? evt.note[locale] : message.text?.[locale] ?? '';

    return (
      <div
        id={`chat-msg-${message.id}`}
        className="my-2 flex justify-center px-2"
      >
        <div className="inline-flex max-w-md flex-col items-center gap-0.5 rounded-wa-bubble bg-wa-system-bg px-3.5 py-2 text-center text-wa-meta text-wa-system-text shadow-wa-bubble">
          <span className="font-semibold">
            {chatDict.messages.systemEventPrefix} · {statusLabel}
          </span>
          <p className="text-wa-preview text-wa-system-text">
            {renderSafeRichText(noteText, searchQuery)}
          </p>
          <span className="text-wa-meta opacity-80">{timeText}</span>
        </div>
      </div>
    );
  }

  const isCustomer = message.sender === 'customer';
  const bubbleColorClass = isCustomer
    ? 'bg-wa-bubble-out text-wa-text-primary'
    : 'bg-wa-bubble-in text-wa-text-primary';

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
      className={`group relative flex transition-transform duration-fast ${
        isCustomer ? 'justify-end' : 'justify-start'
      } ${
        isHighlighted
          ? 'rounded-wa-bubble bg-wa-commerce/25 p-1 ring-2 ring-wa-commerce'
          : ''
      }`}
    >
      {/* Conteneur de bulle : largeur max 80% sur mobile, 65% sur desktop */}
      <div
        className={`relative flex max-w-[80%] flex-col md:max-w-[65%] ${
          isCustomer ? 'items-end' : 'items-start'
        }`}
      >
        {/* Petite queue SVG uniquement sur le premier message d'une série */}
        {isFirstInSeries &&
          message.type !== 'product_card' &&
          message.type !== 'order_card' && (
            <svg
              viewBox="0 0 8 13"
              width="8"
              height="13"
              aria-hidden="true"
              className={`pointer-events-none absolute top-0 h-3 w-2 ${
                isCustomer
                  ? '-right-1.5 text-wa-bubble-out'
                  : '-left-1.5 text-wa-bubble-in'
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

        {/* Bouton rond Réaction Smiley (😊) sur le côté de la bulle (exactement comme sur image-1.png Desktop) */}
        {onToggleReaction && !message.deletedForEveryone && (
          <div
            className={`absolute top-1/2 z-20 -translate-y-1/2 ${
              isCustomer ? '-left-9' : '-right-9'
            }`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowHoverReactions((v) => !v);
              }}
              aria-label="Réagir avec un emoji"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-wa-border bg-wa-panel text-wa-text-secondary opacity-0 shadow-wa-bubble transition-opacity duration-fast group-hover:opacity-100 focus:opacity-100 hover:text-wa-text-primary"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path
                  strokeLinecap="round"
                  d="M8.5 14.5s1.5 2 3.5 2 3.5-2 3.5-2"
                />
                <circle cx="9" cy="9.5" r="1" fill="currentColor" />
                <circle cx="15" cy="9.5" r="1" fill="currentColor" />
              </svg>
            </button>

            {showHoverReactions && (
              <div
                onClick={(e) => e.stopPropagation()}
                className={`absolute bottom-9 z-30 ${
                  isCustomer ? 'right-0' : 'left-0'
                }`}
              >
                <ReactionBar
                  selectedEmoji={
                    message.reactions?.find((r) => r.sender === 'customer')
                      ?.emoji
                  }
                  onSelectEmoji={(emoji) => {
                    setShowHoverReactions(false);
                    onToggleReaction(message.id, emoji);
                  }}
                  onOpenFullPicker={() => {
                    setShowHoverReactions(false);
                    onToggleReaction(message.id, '❤️');
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Bouton discret d'ouverture du menu d'actions (chevron ▾ en haut à droite de la bulle) */}
        {onOpenContextMenu && !message.deletedForEveryone && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenContextMenu(message);
            }}
            aria-label={chatDict.messages.moreActionsAria}
            className="absolute right-1.5 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-wa-panel/80 text-wa-meta text-wa-text-secondary opacity-85 transition-opacity duration-fast hover:text-wa-text-primary sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
          >
            ▾
          </button>
        )}

        {/* A. Bulle Texte / Vocal / Document / Position / Contact : coins 7,5px, ombre très légère */}
        {(message.type === 'text' ||
          message.type === 'voice' ||
          message.type === 'document' ||
          message.type === 'location' ||
          message.type === 'contact') && (
          <div
            onClick={() => {
              if (message.type === 'text' && onOpenContextMenu) {
                onOpenContextMenu(message);
              }
            }}
            className={`relative cursor-pointer rounded-wa-bubble px-2.5 pb-1.5 pt-1.5 shadow-wa-bubble ${fontSizeClass} ${
              isFirstInSeries
                ? isCustomer
                  ? 'rounded-tr-none'
                  : 'rounded-tl-none'
                : ''
            } ${bubbleColorClass}`}
          >
            {/* Badge "↪ Transféré" */}
            {message.forwarded && (
              <p className="mb-0.5 text-wa-meta italic text-wa-text-secondary">
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
                className="mb-1.5 flex w-full items-center gap-2 rounded-wa-bubble border-l-4 border-wa-accent bg-black/5 dark:bg-white/5 px-2.5 py-1 text-left text-wa-meta transition-colors duration-fast hover:bg-black/10"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-wa-dark-green dark:text-wa-accent">
                    {message.replyTo.sender === 'customer'
                      ? chatDict.conversationList.youPrefix
                      : vendorName}
                  </p>
                  <p className="truncate text-wa-text-secondary">
                    {message.replyTo.previewText[locale]}
                  </p>
                </div>
                {message.replyTo.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={message.replyTo.thumbnailUrl}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded object-cover"
                  />
                )}
              </button>
            )}

            {/* Lecteur de message vocal avec forme d'onde & vitesse 1x/1.5x/2x */}
            {message.type === 'voice' &&
              message.voice &&
              !message.deletedForEveryone && (
                <div className="flex min-w-[210px] items-center gap-2.5 py-1 sm:min-w-[240px]">
                  <button
                    type="button"
                    onClick={() => setIsPlayingVoice((p) => !p)}
                    aria-label={
                      isPlayingVoice
                        ? chatDict.messages.voicePauseAria
                        : chatDict.messages.voicePlayAria
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wa-accent text-wa-meta font-semibold text-white transition-transform duration-fast active:scale-95"
                  >
                    {isPlayingVoice ? '⏸' : '▶'}
                  </button>

                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex h-5 items-end gap-0.5">
                      {message.voice.waveform.slice(0, 24).map((val, idx) => {
                        const pct = (idx / 24) * 100;
                        const isPlayed = pct <= voiceProgress;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setVoiceProgress(pct)}
                            style={{ height: `${Math.max(22, val)}%` }}
                            className={`w-1.5 rounded-full transition-colors duration-fast ${
                              isPlayed
                                ? 'bg-wa-accent'
                                : 'bg-wa-text-secondary/35 hover:bg-wa-text-secondary/60'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-wa-meta text-wa-text-secondary">
                      <span className="font-mono">
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
                        className="rounded-full bg-black/10 dark:bg-white/10 px-2 py-0.2 font-semibold text-wa-text-primary"
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
                <div className="mb-1 flex items-center gap-2.5 rounded-wa-bubble border border-wa-border bg-black/5 dark:bg-white/5 p-2 text-wa-preview">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-wa-bubble bg-red-600 text-wa-meta font-semibold text-white">
                    PDF
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-wa-text-primary">
                      {renderSafeRichText(
                        message.document.fileName,
                        searchQuery
                      )}
                    </p>
                    <p className="text-wa-meta text-wa-text-secondary">
                      {Math.round(message.document.fileSizeBytes / 1024)} KB
                      {message.document.pageCount
                        ? ` · ${message.document.pageCount} p.`
                        : ''}
                    </p>
                  </div>
                </div>
              )}

            {/* Pièce jointe Position géographique */}
            {message.type === 'location' &&
              message.location &&
              !message.deletedForEveryone && (
                <div className="mb-1 overflow-hidden rounded-wa-bubble border border-wa-border bg-wa-composer">
                  <div className="relative flex h-24 w-full items-center justify-center bg-wa-chat-bg">
                    <div className="relative flex flex-col items-center">
                      <span className="text-xl">📍</span>
                      <span className="rounded-full bg-wa-panel px-2 py-0.5 font-mono text-wa-meta text-wa-text-primary shadow-wa-bubble">
                        {message.location.latitude.toFixed(4)},{' '}
                        {message.location.longitude.toFixed(4)}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 text-wa-preview">
                    <p className="font-medium text-wa-dark-green dark:text-wa-accent">
                      {renderSafeRichText(
                        message.location.title[locale],
                        searchQuery
                      )}
                    </p>
                    <p className="mt-0.5 text-wa-meta text-wa-text-secondary">
                      {message.location.address[locale]}
                    </p>
                  </div>
                </div>
              )}

            {/* Pièce jointe Contact */}
            {message.type === 'contact' &&
              message.contact &&
              !message.deletedForEveryone && (
                <div className="mb-1 rounded-wa-bubble border border-wa-border bg-black/5 dark:bg-white/5 p-2.5 text-wa-preview">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wa-header text-wa-meta text-white">
                      👤
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-wa-text-primary">
                        {message.contact.name}
                      </p>
                      <p className="truncate text-wa-meta text-wa-dark-green dark:text-wa-accent">
                        {message.contact.role[locale]}
                      </p>
                      <p className="font-mono text-wa-meta text-wa-text-secondary">
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
                      className="mt-2 w-full rounded-wa-bubble border-t border-wa-border pt-1.5 text-center text-wa-meta font-semibold text-wa-dark-green dark:text-wa-accent hover:underline"
                    >
                      {chatDict.messages.messageContactButton}
                    </button>
                  )}
                </div>
              )}

            {/* Contenu texte (14,2px / interligne 19px) avec bouton "Voir plus" en vert gras sur les longs messages (comme sur image-1.png) + Heure & coches alignées en bas à droite */}
            <div className="flex flex-wrap items-end justify-end gap-x-2">
              {message.text && (() => {
                const rawText = message.text[locale];
                const isLongText =
                  !message.deletedForEveryone && rawText.length > 220;
                const displayedText =
                  isLongText && !isExpandedText
                    ? `${rawText.slice(0, 220)}... `
                    : rawText;
                const readMoreLabel =
                  locale === 'zh'
                    ? '展开'
                    : locale === 'en'
                    ? 'Read more'
                    : 'Voir plus';
                const readLessLabel =
                  locale === 'zh'
                    ? '收起'
                    : locale === 'en'
                    ? 'Show less'
                    : 'Voir moins';

                return (
                  <p
                    className={`wa-text-message flex-1 whitespace-pre-wrap break-words text-left ${
                      message.deletedForEveryone
                        ? 'italic text-wa-text-secondary'
                        : ''
                    }`}
                  >
                    {renderSafeRichText(displayedText, searchQuery)}
                    {isLongText && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsExpandedText((prev) => !prev);
                        }}
                        className="inline font-semibold text-wa-dark-green hover:underline dark:text-wa-accent"
                      >
                        {isExpandedText ? ` ${readLessLabel}` : readMoreLabel}
                      </button>
                    )}
                  </p>
                );
              })()}

              <span className="ml-auto inline-flex shrink-0 items-center gap-1 select-none text-wa-meta text-wa-text-secondary">
                {message.starred && (
                  <span
                    aria-label={chatDict.messages.starredAria}
                    className="text-wa-text-secondary"
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
              </span>
            </div>
          </div>
        )}

        {/* B. Bulle Image (Photo unique ou Grille multi-images avec Visionneuse) */}
        {message.type === 'image' && imageItems.length > 0 && (
          <div
            className={`overflow-hidden rounded-wa-bubble p-1.5 shadow-wa-bubble ${
              isFirstInSeries
                ? isCustomer
                  ? 'rounded-tr-none'
                  : 'rounded-tl-none'
                : ''
            } ${bubbleColorClass}`}
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
                className="relative block aspect-[4/3] w-60 overflow-hidden rounded-wa-bubble bg-wa-composer sm:w-72"
              >
                {imageItems[0].url.startsWith('data:') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageItems[0].url}
                    alt={
                      message.imageCaption?.[locale] ??
                      chatDict.messages.imageSentAlt
                    }
                    className="h-full w-full object-cover transition-transform duration-normal hover:scale-105"
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
                    className="object-cover transition-transform duration-normal hover:scale-105"
                  />
                )}
              </button>
            ) : (
              <div className="grid w-64 grid-cols-2 gap-1 sm:w-72">
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
                    className="relative aspect-square overflow-hidden rounded-wa-bubble bg-wa-composer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnailUrl ?? item.url}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-normal hover:scale-105"
                    />
                    {idx === 3 && imageItems.length > 4 && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-wa-contact text-white">
                        +{imageItems.length - 4}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-1 flex flex-wrap items-end justify-end gap-x-2 px-1">
              {message.imageCaption && (
                <p className="wa-text-message max-w-[260px] flex-1 text-left">
                  {renderSafeRichText(
                    message.imageCaption[locale],
                    searchQuery
                  )}
                </p>
              )}
              <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-wa-meta text-wa-text-secondary">
                {message.starred && <span>★</span>}
                <span>{timeText}</span>
                {isCustomer && (
                  <DeliveryStatusIndicator
                    status={message.deliveryStatus}
                    dict={chatDict.messages}
                  />
                )}
              </span>
            </div>
          </div>
        )}

        {/* C. Bulle Carte Produit */}
        {message.type === 'product_card' && product && (
          <div className="space-y-1.5">
            {message.text && (
              <div
                className={`rounded-wa-bubble rounded-tl-none px-3 py-2 shadow-wa-bubble ${fontSizeClass} ${bubbleColorClass}`}
              >
                <p className="wa-text-message">
                  {renderSafeRichText(message.text[locale], searchQuery)}
                </p>
              </div>
            )}
            <ChatProductCard
              product={product}
              locale={locale}
              dict={chatDict.productCard}
              isBusy={isBusy}
              onAddToOrder={onAddToOrder}
            />
            <span className="block px-1 text-wa-meta text-wa-text-secondary">
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
            <span className="block px-1 text-wa-meta text-wa-text-secondary">
              {timeText}
            </span>
          </div>
        )}

        {/* Bouton "Renvoyer" si le message est en échec (failed) */}
        {message.deliveryStatus === 'failed' && onRetryMessage && (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-wa-meta font-medium text-red-600">
              {chatDict.messages.failedStatus}
            </span>
            <button
              type="button"
              onClick={() => onRetryMessage(message.id)}
              className="rounded-full bg-red-600 px-3 py-0.5 text-wa-meta font-semibold text-white shadow-wa-bubble hover:bg-red-700"
            >
              ↻ {chatDict.messages.retryButton}
            </button>
          </div>
        )}

        {/* Pastille des réactions par emoji sous la bulle */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="-mt-1.5 z-10 flex items-center gap-1 rounded-full border border-wa-border bg-wa-panel px-2 py-0.5 text-wa-meta shadow-wa-bubble">
            {message.reactions.map((r, i) => (
              <button
                key={`${r.emoji}-${i}`}
                type="button"
                onClick={() =>
                  onToggleReaction && onToggleReaction(message.id, r.emoji)
                }
                className="transition-transform duration-fast hover:scale-125"
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
