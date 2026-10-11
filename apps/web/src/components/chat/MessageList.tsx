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
import { ReactionBar } from './ReactionBar';

export interface MessageListProps {
  messages: Message[];
  conversation: Conversation | null;
  selectedMessage?: Message | null;
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

export function MessageList({
  messages,
  conversation,
  selectedMessage,
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

  // Calcul des séparateurs de date + détection du premier message d'une série (isFirstInSeries)
  const itemsWithDateGrouping = useMemo(() => {
    const result: Array<{
      message: Message;
      dateSeparatorLabel: string | null;
      isFirstUnread: boolean;
      isFirstInSeries: boolean;
    }> = [];

    let lastDateKey = '';
    let lastSender: Message['sender'] | null = null;
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
        lastSender = null;
      }

      const isFirstInSeries = lastSender !== msg.sender;
      lastSender = msg.sender;

      result.push({
        message: msg,
        dateSeparatorLabel,
        isFirstUnread: index === firstUnreadIndex && unreadCount > 0,
        isFirstInSeries,
      });
    });

    return result;
  }, [messages, locale, chatDict.dateLabels, conversation?.unreadCount]);

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        aria-label={chatDict.messages.listAriaLabel}
        aria-live="polite"
        className="wa-chat-wallpaper h-full space-y-1.5 overflow-y-auto px-3.5 py-3 sm:px-6"
      >
        {/* Pagination vers le haut : Charger les messages précédents */}
        {hasMoreOlderMessages && (
          <div className="flex justify-center pb-2">
            <button
              type="button"
              onClick={onLoadOlderMessages}
              className="min-h-[36px] rounded-full bg-wa-system-bg px-4 py-1 text-wa-meta font-semibold text-wa-system-text shadow-wa-bubble transition-opacity duration-fast hover:opacity-90"
            >
              {chatDict.messages.loadOlderButton}
            </button>
          </div>
        )}

        {/* Fil de messages avec séparateurs de date centrés dans une pastille arrondie */}
        {itemsWithDateGrouping.map(
          ({
            message,
            dateSeparatorLabel,
            isFirstUnread,
            isFirstInSeries,
          }) => {
            const isSelected = selectedMessage?.id === message.id;
            const currentReaction = message.reactions?.find(
              (r) => r.sender === 'customer'
            )?.emoji;

            return (
              <React.Fragment key={message.id}>
                {dateSeparatorLabel && (
                  <div className="my-2.5 flex justify-center">
                    <span className="rounded-wa-bubble bg-wa-system-bg px-3 py-1 text-wa-meta font-medium text-wa-system-text shadow-wa-bubble">
                      {dateSeparatorLabel}
                    </span>
                  </div>
                )}

                {isFirstUnread && (
                  <div className="my-2 flex items-center justify-center">
                    <span className="rounded-full bg-wa-panel/90 px-4 py-1 text-wa-meta font-semibold text-wa-text-primary shadow-wa-bubble">
                      {conversation?.unreadCount}{' '}
                      {chatDict.messages.unreadSeparatorSuffix}
                    </span>
                  </div>
                )}

                <div
                  className={`${isFirstInSeries ? 'pt-1.5' : 'pt-0'} ${
                    isSelected
                      ? '-mx-3.5 rounded-lg bg-wa-accent/20 px-3.5 py-1.5 transition-colors duration-fast sm:-mx-6 sm:px-6'
                      : ''
                  }`}
                >
                  {/* Barre de réactions flottante au-dessus du message sélectionné */}
                  {isSelected && (
                    <div
                      className={`mb-2 flex ${
                        message.sender === 'customer'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <ReactionBar
                        selectedEmoji={currentReaction}
                        onSelectEmoji={(emoji) =>
                          onToggleReaction(message.id, emoji)
                        }
                        onOpenFullPicker={() => onToggleReaction(message.id, '❤️')}
                      />
                    </div>
                  )}

                  <MessageBubble
                    message={message}
                    isFirstInSeries={isFirstInSeries}
                    locale={locale}
                    vendorAvatarUrl={
                      conversation?.vendorAvatarUrl ??
                      '/images/avatars/vendor.jpg'
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
                      message.orderId
                        ? ordersMap.get(message.orderId)
                        : undefined
                    }
                    chatDict={chatDict}
                    statusDict={statusDict}
                    isBusy={isBusy}
                    isHighlighted={highlightedMessageId === message.id}
                    searchQuery={searchQuery}
                    themeMode={preferences.theme}
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
                </div>
              </React.Fragment>
            );
          }
        )}

        {/* Indicateur "est en train d'écrire…" / "enregistre un message vocal…" */}
        {(isVendorTyping || isVendorRecordingVoice) && (
          <div className="flex items-center gap-2 pt-1.5">
            <div className="inline-flex items-center gap-2 rounded-wa-bubble rounded-tl-none bg-wa-bubble-in px-3.5 py-2 text-wa-preview text-wa-text-secondary shadow-wa-bubble">
              {isVendorRecordingVoice ? (
                <>
                  <span className="animate-pulse text-red-600">🎤</span>
                  <span>{chatDict.messages.vendorRecordingBubble}</span>
                </>
              ) : (
                <>
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-wa-text-secondary" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-wa-text-secondary [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-wa-text-secondary [animation-delay:300ms]" />
                  </span>
                  <span>{chatDict.messages.vendorTypingBubble}</span>
                </>
              )}
            </div>
          </div>
        )}

        <div ref={bottomEndRef} />
      </div>

      {/* Bouton flottant rond "Aller en bas" (⌄) en bas à droite de la conversation (comme sur image-1.png) */}
      <button
        type="button"
        onClick={scrollToBottom}
        aria-label={chatDict.messages.scrollToBottomAria}
        className={`absolute bottom-3 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-wa-border bg-wa-panel text-wa-text-secondary shadow-wa-panel transition-all duration-fast hover:scale-105 hover:text-wa-text-primary ${
          showScrollBottomButton ? 'opacity-100' : 'opacity-90'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m6 9 6 6 6-6"
          />
        </svg>
        {(conversation?.unreadCount ?? 0) > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-wa-accent px-1 text-wa-meta font-semibold text-white">
            {conversation?.unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
