'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type {
  ChatPreferences,
  Conversation,
  ImageAttachmentItem,
  Locale,
  Message,
  Order,
  Product,
} from '@attieke-chat/shared';
import {
  formatDateSeparator,
  type ChatDictionary,
  type CommonDictionary,
} from '@/lib/i18n';
import { MessageBubble } from './MessageBubble';

export interface MessageListProps {
  messages: Message[];
  conversation: Conversation | null;
  locale: Locale;
  productsMap: Map<string, Product>;
  ordersMap: Map<string, Order>;
  chatDict: ChatDictionary;
  statusDict: CommonDictionary['orderStatus'];
  preferences: ChatPreferences;
  isBusy: boolean;
  isVendorTyping: boolean;
  isVendorRecordingVoice: boolean;
  hasMoreOlderMessages: boolean;
  highlightedMessageId: string | null;
  searchQuery: string;
  onLoadOlderMessages: () => void;
  onAddToOrder: (productId: string, quantity: number) => Promise<void>;
  onConfirmOrder: (orderId: string) => Promise<void>;
  onAdvanceStep: (orderId: string) => Promise<void>;
  onOpenContextMenu: (message: Message) => void;
  onReply: (message: Message) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onJumpToMessage: (messageId: string) => void;
  onRetryMessage: (messageId: string) => void;
  onOpenImageViewer: (
    images: ImageAttachmentItem[],
    index: number,
    caption?: string
  ) => void;
  onQuickReplyText: (text: string) => void;
}

function getWallpaperClasses(preferences: ChatPreferences): string {
  if (preferences.theme === 'dark') {
    return 'bg-[#0B141A] text-white [background-image:radial-gradient(#1F2C34_1px,transparent_1px)] [background-size:20px_20px]';
  }
  switch (preferences.wallpaper) {
    case 'emerald_mist':
      return 'bg-[#E6F4ED] [background-image:radial-gradient(#0F4C3A18_1px,transparent_1px)] [background-size:18px_18px]';
    case 'warm_sand':
      return 'bg-[#F6ECDC] [background-image:radial-gradient(#8A6A3218_1px,transparent_1px)] [background-size:18px_18px]';
    case 'night_forest':
      return 'bg-[#0D261E] text-white [background-image:radial-gradient(#ffffff14_1px,transparent_1px)] [background-size:18px_18px]';
    case 'plain_cream':
      return 'bg-[#FAF6EE]';
    case 'ivory_pattern':
    default:
      return 'bg-[#EFEAE2] [background-image:radial-gradient(#0F4C3A14_1px,transparent_1px)] [background-size:18px_18px]';
  }
}

export function MessageList({
  messages,
  conversation,
  locale,
  productsMap,
  ordersMap,
  chatDict,
  statusDict,
  preferences,
  isBusy,
  isVendorTyping,
  isVendorRecordingVoice,
  hasMoreOlderMessages,
  highlightedMessageId,
  searchQuery,
  onLoadOlderMessages,
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
}: MessageListProps): React.JSX.Element {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomEndRef = useRef<HTMLDivElement | null>(null);
  const [showScrollBottomButton, setShowScrollBottomButton] =
    useState<boolean>(false);
  const prevMsgCountRef = useRef<number>(messages.length);

  useEffect(() => {
    const increased = messages.length > prevMsgCountRef.current;
    prevMsgCountRef.current = messages.length;
    if (increased && !showScrollBottomButton) {
      bottomEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isVendorTyping, showScrollBottomButton]);

  const handleScroll = (): void => {
    const el = scrollContainerRef.current;
    if (!el) {
      return;
    }
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBottomButton(distanceFromBottom > 240);
  };

  const scrollToBottom = (): void => {
    bottomEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBottomButton(false);
  };

  const itemsWithDateGrouping = useMemo(() => {
    const result: Array<{
      message: Message;
      dateSeparatorLabel: string | null;
      isFirstUnread: boolean;
    }> = [];

    let lastDateKey = '';
    const unreadCount = conversation?.unreadCount ?? 0;
    const firstUnreadIndex =
      unreadCount > 0 ? Math.max(0, messages.length - unreadCount) : -1;

    messages.forEach((msg, index) => {
      const d = new Date(msg.createdAt);
      const dayKey = Number.isNaN(d.getTime())
        ? ''
        : `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

      let dateSeparatorLabel: string | null = null;
      if (dayKey && dayKey !== lastDateKey) {
        dateSeparatorLabel = formatDateSeparator(
          msg.createdAt,
          locale,
          chatDict.dateLabels
        );
        lastDateKey = dayKey;
      }

      result.push({
        message: msg,
        dateSeparatorLabel,
        isFirstUnread: index === firstUnreadIndex && unreadCount > 0,
      });
    });

    return result;
  }, [
    messages,
    locale,
    chatDict.dateLabels,
    conversation?.unreadCount,
  ]);

  const wallpaperClass = getWallpaperClasses(preferences);
  const effectiveTheme =
    preferences.wallpaper === 'night_forest' ? 'dark' : preferences.theme;

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        aria-label={chatDict.messages.listAriaLabel}
        aria-live="polite"
        className={`h-full space-y-3.5 overflow-y-auto px-3.5 py-4 sm:px-6 ${wallpaperClass}`}
      >
        {/* Pagination vers le haut : Charger les messages précédents */}
        {hasMoreOlderMessages && (
          <div className="flex justify-center pb-1">
            <button
              type="button"
              onClick={onLoadOlderMessages}
              className="rounded-full border border-brand-green/25 bg-white/95 px-4 py-1.5 text-xs font-extrabold text-brand-green shadow-xs transition-colors hover:bg-brand-green hover:text-white"
            >
              {chatDict.messages.loadOlderButton}
            </button>
          </div>
        )}

        {/* Fil de messages avec séparateurs de date et séparateur non-lus */}
        {itemsWithDateGrouping.map(
          ({ message, dateSeparatorLabel, isFirstUnread }) => (
            <React.Fragment key={message.id}>
              {dateSeparatorLabel && (
                <div className="my-2 flex justify-center">
                  <span className="rounded-full border border-black/10 bg-white/90 px-3.5 py-1 text-[11px] font-extrabold text-brand-ink shadow-2xs">
                    {dateSeparatorLabel}
                  </span>
                </div>
              )}

              {isFirstUnread && (
                <div className="my-2.5 flex items-center justify-center">
                  <span className="rounded-full border border-brand-gold bg-brand-gold/25 px-4 py-1 text-xs font-extrabold text-brand-ink shadow-2xs">
                    {conversation?.unreadCount}{' '}
                    {chatDict.messages.unreadSeparatorSuffix}
                  </span>
                </div>
              )}

              <MessageBubble
                message={message}
                locale={locale}
                vendorAvatarUrl={
                  conversation?.vendorAvatarUrl ?? '/images/avatars/vendor.jpg'
                }
                vendorName={
                  conversation?.vendorName ?? chatDict.header.vendorName
                }
                product={
                  message.productId
                    ? productsMap.get(message.productId)
                    : undefined
                }
                order={
                  message.orderId ? ordersMap.get(message.orderId) : undefined
                }
                chatDict={chatDict}
                statusDict={statusDict}
                isBusy={isBusy}
                isHighlighted={highlightedMessageId === message.id}
                searchQuery={searchQuery}
                themeMode={effectiveTheme}
                fontSize={preferences.fontSize}
                onAddToOrder={onAddToOrder}
                onConfirmOrder={onConfirmOrder}
                onAdvanceStep={onAdvanceStep}
                onOpenContextMenu={onOpenContextMenu}
                onReply={onReply}
                onToggleReaction={onToggleReaction}
                onJumpToMessage={onJumpToMessage}
                onRetryMessage={onRetryMessage}
                onOpenImageViewer={onOpenImageViewer}
                onQuickReplyText={onQuickReplyText}
              />
            </React.Fragment>
          )
        )}

        {/* Indicateur "est en train d'écrire…" / "enregistre un message vocal…" */}
        {(isVendorTyping || isVendorRecordingVoice) && (
          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-2xl rounded-tl-none border border-brand-ink/10 bg-white px-4 py-2.5 text-xs font-bold text-brand-ink-muted shadow-xs">
              {isVendorRecordingVoice ? (
                <>
                  <span className="animate-pulse text-red-600">🎤</span>
                  <span>{chatDict.messages.vendorRecordingBubble}</span>
                </>
              ) : (
                <>
                  <span className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-brand-green" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-brand-green [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-brand-green [animation-delay:300ms]" />
                  </span>
                  <span>{chatDict.messages.vendorTypingBubble}</span>
                </>
              )}
            </div>
          </div>
        )}

        <div ref={bottomEndRef} />
      </div>

      {/* Bouton flottant "Aller en bas" (↓) avec badge */}
      {showScrollBottomButton && (
        <button
          type="button"
          onClick={scrollToBottom}
          aria-label={chatDict.messages.scrollToBottomAria}
          className="absolute bottom-4 right-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-brand-ink/15 bg-white text-base font-extrabold text-brand-green shadow-card transition-transform hover:scale-105"
        >
          <span>↓</span>
          {(conversation?.unreadCount ?? 0) > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#25D366] px-1 text-[10px] font-extrabold text-brand-ink">
              {conversation?.unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
