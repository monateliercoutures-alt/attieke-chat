'use client';

import React from 'react';
import Image from 'next/image';
import type { Conversation, Locale, Message } from '@attieke-chat/shared';
import { formatDateTime, type ChatDictionary } from '@/lib/i18n';

export interface ContextMenuProps {
  message: Message | null;
  forwardingMessage: Message | null;
  infoModalMessage: Message | null;
  deletingMessage?: Message | null;
  securityCodeModalOpen?: boolean;
  vendorName?: string;
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
  onCloseDeleteModal?: () => void;
  onCloseSecurityCodeModal?: () => void;
  onDeleteForMe: (messageId: string) => void;
  onDeleteForEveryone: (messageId: string) => void;
}

const SECURITY_CODE_BLOCKS: readonly string[] = [
  '48291', '03948', '71625', '90412',
  '58301', '29471', '66019', '83742',
  '19283', '74650', '30192', '84756',
] as const;

export function ContextMenu({
  forwardingMessage,
  infoModalMessage,
  deletingMessage,
  securityCodeModalOpen,
  vendorName,
  conversations,
  locale,
  dict,
  onCloseForward,
  onConfirmForward,
  onCloseInfo,
  onCloseDeleteModal,
  onCloseSecurityCodeModal,
  onDeleteForMe,
  onDeleteForEveryone,
}: ContextMenuProps): React.JSX.Element | null {
  const menuDict = dict.contextMenu;

  // 1. Modale "Vérifier le code de sécurité" (depuis le menu ⋮ de image-3.png)
  if (securityCodeModalOpen) {
    const title =
      locale === 'zh'
        ? '验证安全码'
        : locale === 'en'
        ? 'Verify security code'
        : 'Vérifier le code de sécurité';
    const subtitle =
      locale === 'zh'
        ? `您与 ${vendorName ?? '阿比让木薯工坊'} 之间的消息和通话均受端到端加密保护。`
        : locale === 'en'
        ? `Messages and calls with ${vendorName ?? 'Saveur Attiéké'} are end-to-end encrypted.`
        : `Vos messages et appels avec ${vendorName ?? 'Saveur Attiéké'} sont chiffrés de bout en bout. Comparez ces 60 chiffres :`;

    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
        onClick={onCloseSecurityCodeModal}
      >
        <div
          className="w-full max-w-sm overflow-hidden rounded-3xl border border-wa-border bg-wa-panel p-5 text-wa-text-primary shadow-wa-panel"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-wa-border pb-3">
            <h3 className="text-wa-contact font-semibold text-wa-text-primary">
              🔒 {title}
            </h3>
            <button
              type="button"
              onClick={onCloseSecurityCodeModal}
              className="flex h-8 w-8 items-center justify-center rounded-full text-wa-text-secondary hover:text-wa-text-primary"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-wa-accent/15 text-3xl text-wa-accent">
              🛡️
            </div>
            <p className="mt-3 text-center text-wa-preview text-wa-text-secondary">
              {subtitle}
            </p>

            {/* Grille des 60 chiffres de vérification E2E */}
            <div className="mt-4 grid w-full grid-cols-4 gap-2 rounded-2xl border border-wa-border bg-wa-composer p-3.5 text-center font-mono text-wa-preview font-semibold tracking-wider text-wa-text-primary">
              {SECURITY_CODE_BLOCKS.map((block, idx) => (
                <span key={idx}>{block}</span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseSecurityCodeModal}
            className="mt-4 min-h-[42px] w-full rounded-full bg-wa-accent py-2 text-wa-preview font-semibold text-wa-commerce-text"
          >
            ✓ OK
          </button>
        </div>
      </div>
    );
  }

  // 2. Modale de confirmation de suppression (depuis l'icône Corbeille 🗑️ de la barre de sélection)
  if (deletingMessage) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
        onClick={onCloseDeleteModal}
      >
        <div
          className="w-full max-w-xs overflow-hidden rounded-3xl border border-wa-border bg-wa-panel p-5 text-wa-text-primary shadow-wa-panel"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-wa-contact font-medium text-wa-text-secondary">
            {locale === 'zh'
              ? '要删除这条消息吗？'
              : locale === 'en'
              ? 'Delete message?'
              : 'Supprimer le message ?'}
          </p>

          <div className="mt-4 flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => {
                onDeleteForEveryone(deletingMessage.id);
                onCloseDeleteModal?.();
              }}
              className="rounded-full px-3 py-1.5 text-wa-preview font-semibold text-wa-accent hover:bg-wa-composer"
            >
              {menuDict.deleteForEveryone}
            </button>
            <button
              type="button"
              onClick={() => {
                onDeleteForMe(deletingMessage.id);
                onCloseDeleteModal?.();
              }}
              className="rounded-full px-3 py-1.5 text-wa-preview font-semibold text-wa-accent hover:bg-wa-composer"
            >
              {menuDict.deleteForMe}
            </button>
            <button
              type="button"
              onClick={onCloseDeleteModal}
              className="rounded-full px-3 py-1.5 text-wa-preview font-semibold text-wa-text-secondary hover:bg-wa-composer"
            >
              {menuDict.closeMenu}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Modale Transférer vers une conversation
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
          className="w-full max-w-sm overflow-hidden rounded-2xl border border-wa-border bg-wa-panel p-5 text-wa-text-primary shadow-wa-panel"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-wa-border pb-3">
            <h3 className="text-wa-contact font-medium text-wa-text-primary">
              ↪ {menuDict.forwardModalTitle}
            </h3>
            <button
              type="button"
              onClick={onCloseForward}
              className="flex h-8 w-8 items-center justify-center rounded-full text-wa-text-secondary hover:text-wa-text-primary"
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
                className="flex w-full items-center gap-3 rounded-wa-bubble border border-wa-border bg-wa-composer p-3 text-left transition-colors duration-fast hover:border-wa-accent"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-wa-border">
                  <Image
                    src={conv.vendorAvatarUrl}
                    alt={conv.vendorName}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-wa-preview font-medium text-wa-text-primary">
                    {conv.vendorName}
                  </p>
                  {conv.vendorRole && (
                    <p className="truncate text-wa-meta text-wa-text-secondary">
                      {conv.vendorRole[locale]}
                    </p>
                  )}
                </div>
                <span className="text-wa-preview font-semibold text-wa-accent">
                  ➤
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 4. Modale Infos du message (Envoyé / Remis ✓✓ / Lu ✓✓ bleu #53BDEB)
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
          className="w-full max-w-sm overflow-hidden rounded-2xl border border-wa-border bg-wa-panel p-5 text-wa-text-primary shadow-wa-panel"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-wa-border pb-3">
            <h3 className="text-wa-contact font-medium text-wa-text-primary">
              ℹ️ {menuDict.infoModalTitle}
            </h3>
            <button
              type="button"
              onClick={onCloseInfo}
              className="flex h-8 w-8 items-center justify-center rounded-full text-wa-text-secondary hover:text-wa-text-primary"
            >
              ✕
            </button>
          </div>

          {/* Aperçu de la bulle */}
          <div className="mt-3 rounded-wa-bubble bg-wa-bubble-out p-3 text-wa-msg text-wa-text-primary shadow-wa-bubble">
            <p className="line-clamp-3">
              {infoModalMessage.text?.[locale] ??
                infoModalMessage.imageCaption?.[locale] ??
                infoModalMessage.document?.fileName ??
                'Message'}
            </p>
          </div>

          <dl className="mt-4 space-y-2.5 text-wa-preview">
            <div className="flex items-center justify-between rounded-wa-bubble bg-wa-composer px-3.5 py-2.5">
              <dt className="flex items-center gap-2 font-semibold text-wa-read-tick">
                <span>✓✓</span>
                <span className="text-wa-text-primary">{menuDict.infoReadAt}</span>
              </dt>
              <dd className="text-wa-meta text-wa-text-secondary">{readStr}</dd>
            </div>

            <div className="flex items-center justify-between rounded-wa-bubble bg-wa-composer px-3.5 py-2.5">
              <dt className="flex items-center gap-2 font-semibold text-wa-text-secondary">
                <span>✓✓</span>
                <span className="text-wa-text-primary">
                  {menuDict.infoDeliveredAt}
                </span>
              </dt>
              <dd className="text-wa-meta text-wa-text-secondary">
                {deliveredStr}
              </dd>
            </div>

            <div className="flex items-center justify-between rounded-wa-bubble bg-wa-composer px-3.5 py-2.5">
              <dt className="flex items-center gap-2 font-semibold text-wa-text-secondary">
                <span>✓</span>
                <span className="text-wa-text-primary">{menuDict.infoSentAt}</span>
              </dt>
              <dd className="text-wa-meta text-wa-text-secondary">{sentStr}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={onCloseInfo}
            className="mt-4 min-h-[42px] w-full rounded-full bg-wa-header py-2 text-wa-preview font-semibold text-white"
          >
            {menuDict.closeMenu}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
