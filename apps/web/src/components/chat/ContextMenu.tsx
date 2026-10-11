'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type {
  Conversation,
  Locale,
  Message,
} from '@attieke-chat/shared';
import { formatDateTime, type ChatDictionary } from '@/lib/i18n';
import { ReactionBar } from './ReactionBar';
import { EmojiPicker } from './EmojiPicker';

export interface ContextMenuProps {
  message: Message | null;
  forwardingMessage: Message | null;
  infoModalMessage: Message | null;
  conversations: Conversation[];
  locale: Locale;
  dict: ChatDictionary;
  onCloseContextMenu: () => void;
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  onCopy: (message: Message) => void;
  onOpenForward: (message: Message) => void;
  onCloseForward: () => void;
  onConfirmForward: (targetConversationId: string) => void;
  onToggleStar: (messageId: string) => void;
  onOpenInfo: (message: Message) => void;
  onCloseInfo: () => void;
  onDeleteForMe: (messageId: string) => void;
  onDeleteForEveryone: (messageId: string) => void;
}

export function ContextMenu({
  message,
  forwardingMessage,
  infoModalMessage,
  conversations,
  locale,
  dict,
  onCloseContextMenu,
  onReply,
  onReact,
  onCopy,
  onOpenForward,
  onCloseForward,
  onConfirmForward,
  onToggleStar,
  onOpenInfo,
  onCloseInfo,
  onDeleteForMe,
  onDeleteForEveryone,
}: ContextMenuProps): React.JSX.Element | null {
  const [showFullEmojiPicker, setShowFullEmojiPicker] =
    useState<boolean>(false);
  const menuDict = dict.contextMenu;

  // 1. Modale Transférer vers une conversation
  if (forwardingMessage) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={menuDict.forwardModalTitle}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        onClick={onCloseForward}
      >
        <div
          className="w-full max-w-sm overflow-hidden rounded-3xl border border-brand-ink/15 bg-white p-5 shadow-card"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-brand-ink/10 pb-3">
            <h3 className="text-sm font-extrabold text-brand-ink">
              ↪ {menuDict.forwardModalTitle}
            </h3>
            <button
              type="button"
              onClick={onCloseForward}
              className="rounded-full p-1 text-xs font-bold text-brand-ink-muted hover:text-brand-ink"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => onConfirmForward(conv.id)}
                className="flex w-full items-center gap-3 rounded-2xl border border-brand-ink/10 bg-brand-cream/60 p-3 text-left transition-colors hover:bg-brand-green-soft"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-brand-ink/15">
                  <Image
                    src={conv.vendorAvatarUrl}
                    alt={conv.vendorName}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-extrabold text-brand-ink">
                    {conv.vendorName}
                  </p>
                  {conv.vendorRole && (
                    <p className="truncate text-[11px] text-brand-ink-muted">
                      {conv.vendorRole[locale]}
                    </p>
                  )}
                </div>
                <span className="text-xs font-extrabold text-brand-green">
                  ➤
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. Modale Infos du message (Envoyé / Remis ✓✓ / Lu ✓✓ bleu)
  if (infoModalMessage) {
    const sentStr = formatDateTime(
      infoModalMessage.sentAt ?? infoModalMessage.createdAt,
      locale
    );
    const deliveredStr = infoModalMessage.deliveredAt
      ? formatDateTime(infoModalMessage.deliveredAt, locale)
      : infoModalMessage.deliveryStatus === 'delivered' ||
        infoModalMessage.deliveryStatus === 'read'
      ? sentStr
      : menuDict.infoPending;
    const readStr = infoModalMessage.readAt
      ? formatDateTime(infoModalMessage.readAt, locale)
      : infoModalMessage.deliveryStatus === 'read'
      ? sentStr
      : menuDict.infoPending;

    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={menuDict.infoModalTitle}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        onClick={onCloseInfo}
      >
        <div
          className="w-full max-w-sm overflow-hidden rounded-3xl border border-brand-ink/15 bg-white p-5 shadow-card"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-brand-ink/10 pb-3">
            <h3 className="text-sm font-extrabold text-brand-ink">
              ℹ️ {menuDict.infoModalTitle}
            </h3>
            <button
              type="button"
              onClick={onCloseInfo}
              className="rounded-full p-1 text-xs font-bold text-brand-ink-muted hover:text-brand-ink"
            >
              ✕
            </button>
          </div>

          {/* Aperçu de la bulle */}
          <div className="mt-3 rounded-2xl bg-[#D9FDD3] p-3 text-xs text-brand-ink shadow-xs">
            <p className="line-clamp-3 font-medium">
              {infoModalMessage.text?.[locale] ??
                infoModalMessage.imageCaption?.[locale] ??
                infoModalMessage.document?.fileName ??
                'Message'}
            </p>
          </div>

          <dl className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-2xl bg-brand-cream px-3.5 py-2.5">
              <dt className="flex items-center gap-2 font-extrabold text-sky-600">
                <span>✓✓</span>
                <span className="text-brand-ink">{menuDict.infoReadAt}</span>
              </dt>
              <dd className="font-semibold text-brand-ink-muted">{readStr}</dd>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-brand-cream px-3.5 py-2.5">
              <dt className="flex items-center gap-2 font-extrabold text-brand-ink-muted">
                <span>✓✓</span>
                <span className="text-brand-ink">
                  {menuDict.infoDeliveredAt}
                </span>
              </dt>
              <dd className="font-semibold text-brand-ink-muted">
                {deliveredStr}
              </dd>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-brand-cream px-3.5 py-2.5">
              <dt className="flex items-center gap-2 font-extrabold text-brand-ink-muted">
                <span>✓</span>
                <span className="text-brand-ink">{menuDict.infoSentAt}</span>
              </dt>
              <dd className="font-semibold text-brand-ink-muted">{sentStr}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={onCloseInfo}
            className="mt-4 w-full rounded-full bg-brand-green py-2 text-xs font-extrabold text-white"
          >
            {menuDict.closeMenu}
          </button>
        </div>
      </div>
    );
  }

  // 3. Menu contextuel principal du message
  if (!message) {
    return null;
  }

  const currentReaction = message.reactions?.find(
    (r) => r.sender === 'customer'
  )?.emoji;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs"
      onClick={() => {
        setShowFullEmojiPicker(false);
        onCloseContextMenu();
      }}
    >
      <div
        className="flex flex-col items-center gap-2.5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barre des 6 réactions rapides ou Sélecteur complet */}
        {showFullEmojiPicker ? (
          <EmojiPicker
            dict={dict.emojiPicker}
            onSelectEmoji={(emoji) => {
              setShowFullEmojiPicker(false);
              onReact(message.id, emoji);
            }}
            onClose={() => setShowFullEmojiPicker(false)}
          />
        ) : (
          <ReactionBar
            selectedEmoji={currentReaction}
            onSelectEmoji={(emoji) => onReact(message.id, emoji)}
            onOpenFullPicker={() => setShowFullEmojiPicker(true)}
          />
        )}

        {/* Liste des actions sur le message */}
        <div className="w-64 overflow-hidden rounded-3xl border border-brand-ink/15 bg-white py-1.5 shadow-card">
          <button
            type="button"
            onClick={() => onReply(message)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-bold text-brand-ink hover:bg-brand-cream"
          >
            <span>{menuDict.reply}</span>
            <span aria-hidden="true">↩️</span>
          </button>

          <button
            type="button"
            onClick={() => onCopy(message)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-bold text-brand-ink hover:bg-brand-cream"
          >
            <span>{menuDict.copy}</span>
            <span aria-hidden="true">📋</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenForward(message)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-bold text-brand-ink hover:bg-brand-cream"
          >
            <span>{menuDict.forward}</span>
            <span aria-hidden="true">↪️</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleStar(message.id)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-bold text-brand-ink hover:bg-brand-cream"
          >
            <span>{message.starred ? menuDict.unstar : menuDict.star}</span>
            <span aria-hidden="true" className="text-brand-gold">
              ★
            </span>
          </button>

          <button
            type="button"
            onClick={() => onOpenInfo(message)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-bold text-brand-ink hover:bg-brand-cream"
          >
            <span>{menuDict.info}</span>
            <span aria-hidden="true">ℹ️</span>
          </button>

          <div className="my-1 border-t border-brand-ink/10" />

          <button
            type="button"
            onClick={() => onDeleteForMe(message.id)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50"
          >
            <span>{menuDict.deleteForMe}</span>
            <span aria-hidden="true">🗑️</span>
          </button>

          <button
            type="button"
            onClick={() => onDeleteForEveryone(message.id)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-extrabold text-red-700 hover:bg-red-50"
          >
            <span>{menuDict.deleteForEveryone}</span>
            <span aria-hidden="true">🚫</span>
          </button>
        </div>
      </div>
    </div>
  );
}
