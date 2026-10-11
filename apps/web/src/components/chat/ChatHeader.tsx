'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { CallType, ChatRealtimeEvent } from '@/services';
import type { Conversation, Locale, Message } from '@attieke-chat/shared';
import type { ChatDictionary } from '@/lib/i18n';
import { usePresence } from '@/hooks/usePresence';

export interface ChatHeaderProps {
  locale: Locale;
  conversation: Conversation | null;
  selectedMessage?: Message | null;
  totalUnreadCount: number;
  isOnlineNetwork: boolean;
  isSearchOpen: boolean;
  dict: ChatDictionary;
  onShowMobileConversationList: () => void;
  onToggleSearch: () => void;
  onStartCall: (type: CallType) => void;
  onOpenSettings: () => void;
  onToggleOfflineMode: () => void;
  onToggleCatalogDrawer: () => void;
  onRestoreDemo: () => void;
  onClearSelectedMessage?: () => void;
  onReplySelectedMessage?: (message: Message) => void;
  onStarSelectedMessage?: (messageId: string) => void;
  onDeleteSelectedMessage?: (message: Message) => void;
  onForwardSelectedMessage?: (message: Message) => void;
  onInfoSelectedMessage?: (message: Message) => void;
  onCopySelectedMessage?: (message: Message) => void;
  onPinSelectedMessage?: (message: Message) => void;
  onVerifySecurityCode?: () => void;
  _unusedEvent?: ChatRealtimeEvent;
}

export function ChatHeader({
  locale,
  conversation,
  selectedMessage,
  totalUnreadCount,
  isOnlineNetwork,
  isSearchOpen,
  dict,
  onShowMobileConversationList,
  onToggleSearch,
  onStartCall,
  onOpenSettings,
  onToggleOfflineMode,
  onToggleCatalogDrawer,
  onRestoreDemo,
  onClearSelectedMessage,
  onReplySelectedMessage,
  onStarSelectedMessage,
  onDeleteSelectedMessage,
  onForwardSelectedMessage,
  onInfoSelectedMessage,
  onCopySelectedMessage,
  onPinSelectedMessage,
  onVerifySecurityCode,
}: ChatHeaderProps): React.JSX.Element {
  const [showOverflowMenu, setShowOverflowMenu] = useState<boolean>(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState<boolean>(false);

  const { isOnline, isTyping, isRecordingVoice, statusLabel } = usePresence(
    conversation,
    locale,
    dict.presence
  );

  const verifyLabel =
    locale === 'zh'
      ? '验证安全码'
      : locale === 'en'
      ? 'Verify security code'
      : 'Vérifier le code de sécurité';
  const pinLabel =
    locale === 'zh' ? '置顶' : locale === 'en' ? 'Pin' : 'Épingler';

  // Mode Sélection d'un message : Barre d'actions contextuelle en haut + menu ⋮ (comme sur image-3.png)
  if (selectedMessage) {
    return (
      <header className="relative z-30 flex min-h-[60px] items-center justify-between border-b border-wa-border bg-wa-panel px-2.5 py-2 text-wa-text-primary sm:px-4">
        {/* Gauche : Flèche retour ← + Compteur "1" */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setShowOverflowMenu(false);
              onClearSelectedMessage?.();
            }}
            aria-label={dict.contextMenu.closeMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-wa-text-primary hover:bg-wa-composer"
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
                d="M19 12H5m7-7-7 7 7 7"
              />
            </svg>
          </button>
          <span className="text-wa-header font-semibold text-wa-text-primary">
            1
          </span>
        </div>

        {/* Droite : Répondre (↩) + Étoile (☆) + Supprimer (🗑️) + Transférer (↪) + Menu (⋮) */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Répondre ↩ */}
          <button
            type="button"
            onClick={() => {
              setShowOverflowMenu(false);
              onReplySelectedMessage?.(selectedMessage);
            }}
            aria-label={dict.contextMenu.reply}
            title={dict.contextMenu.reply}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-wa-text-primary hover:bg-wa-composer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 17 4 12l5-5"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 18v-2a4 4 0 0 0-4-4H4"
              />
            </svg>
          </button>

          {/* Important ☆ / ★ */}
          <button
            type="button"
            onClick={() => {
              setShowOverflowMenu(false);
              onStarSelectedMessage?.(selectedMessage.id);
            }}
            aria-label={
              selectedMessage.starred
                ? dict.contextMenu.unstar
                : dict.contextMenu.star
            }
            title={
              selectedMessage.starred
                ? dict.contextMenu.unstar
                : dict.contextMenu.star
            }
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-wa-text-primary hover:bg-wa-composer"
          >
            <svg
              viewBox="0 0 24 24"
              fill={selectedMessage.starred ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>

          {/* Supprimer 🗑️ */}
          <button
            type="button"
            onClick={() => {
              setShowOverflowMenu(false);
              onDeleteSelectedMessage?.(selectedMessage);
            }}
            aria-label={dict.contextMenu.deleteForMe}
            title={dict.contextMenu.deleteForMe}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-wa-text-primary hover:bg-wa-composer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              />
            </svg>
          </button>

          {/* Transférer ↪ */}
          <button
            type="button"
            onClick={() => {
              setShowOverflowMenu(false);
              onForwardSelectedMessage?.(selectedMessage);
            }}
            aria-label={dict.contextMenu.forward}
            title={dict.contextMenu.forward}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-wa-text-primary hover:bg-wa-composer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15 17 5-5-5-5"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 18v-2a4 4 0 0 1 4-4h12"
              />
            </svg>
          </button>

          {/* Menu 3 points verticaux ⋮ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowOverflowMenu((v) => !v)}
              aria-label="Plus d'options"
              aria-expanded={showOverflowMenu}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-wa-text-primary hover:bg-wa-composer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="12" cy="5" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="12" cy="19" r="1.8" />
              </svg>
            </button>

            {showOverflowMenu && (
              <div
                role="menu"
                className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-2xl border border-wa-border bg-wa-composer py-1.5 shadow-wa-panel"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setShowOverflowMenu(false);
                    onVerifySecurityCode?.();
                  }}
                  className="flex w-full items-center px-4 py-3 text-left text-wa-contact font-normal text-wa-text-primary hover:bg-wa-panel"
                >
                  {verifyLabel}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setShowOverflowMenu(false);
                    onInfoSelectedMessage?.(selectedMessage);
                  }}
                  className="flex w-full items-center px-4 py-3 text-left text-wa-contact font-normal text-wa-text-primary hover:bg-wa-panel"
                >
                  {dict.contextMenu.info}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setShowOverflowMenu(false);
                    onCopySelectedMessage?.(selectedMessage);
                  }}
                  className="flex w-full items-center px-4 py-3 text-left text-wa-contact font-normal text-wa-text-primary hover:bg-wa-panel"
                >
                  {dict.contextMenu.copy}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setShowOverflowMenu(false);
                    onPinSelectedMessage?.(selectedMessage);
                  }}
                  className="flex w-full items-center px-4 py-3 text-left text-wa-contact font-normal text-wa-text-primary hover:bg-wa-panel"
                >
                  {pinLabel}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="relative z-20 flex min-h-[60px] items-center justify-between border-b border-wa-border bg-wa-header px-3 py-2 text-white md:bg-wa-panel md:text-wa-text-primary sm:px-4">
      {/* Gauche : Retour mobile + Avatar rond 40 px + Nom (16px/500) + Statut ("en ligne" / "écrit…") */}
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          type="button"
          onClick={onShowMobileConversationList}
          aria-label={dict.conversationList.backToConversationsAria}
          className="relative inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-white transition-colors duration-fast hover:bg-white/15 md:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 12H5m7-7-7 7 7 7"
            />
          </svg>
          {totalUnreadCount > 0 && (
            <span className="absolute right-0.5 top-1 inline-flex min-w-[16px] items-center justify-center rounded-full bg-wa-accent px-1 text-wa-meta font-semibold text-white">
              {totalUnreadCount}
            </span>
          )}
        </button>

        {/* Avatar rond 40 px exactement */}
        <div className="relative h-10 w-10 shrink-0">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-wa-dark-green">
            <Image
              src={
                conversation?.vendorAvatarUrl ?? '/images/avatars/vendor.jpg'
              }
              alt={conversation?.vendorName ?? dict.header.vendorName}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          {isOnline && (
            <span
              aria-hidden="true"
              className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-wa-header bg-wa-accent md:border-wa-panel"
            />
          )}
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-wa-contact font-medium text-white md:text-wa-text-primary">
            {conversation?.vendorName ?? dict.header.vendorName}
          </h2>
          <p
            aria-live="polite"
            className={`truncate text-wa-meta ${
              isTyping || isRecordingVoice
                ? 'font-medium text-wa-accent'
                : 'text-white/80 md:text-wa-text-secondary'
            }`}
          >
            {statusLabel}
          </p>
        </div>
      </div>

      {/* Droite : Appel vidéo, Appel vocal, Loupe Recherche (🔍) et Menu 3 points (⋮) exactement comme sur image-1.png */}
      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
        {/* Appel vidéo */}
        <button
          type="button"
          onClick={() => onStartCall('video')}
          aria-label={dict.header.videoCallAria}
          title={dict.header.videoCallAria}
          className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full text-white transition-colors duration-fast hover:bg-white/15 md:text-wa-text-secondary md:hover:bg-wa-composer md:hover:text-wa-text-primary"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <rect x="2" y="6" width="14" height="12" rx="2.5" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m22 8-6 4 6 4V8z"
            />
          </svg>
        </button>

        {/* Appel vocal */}
        <button
          type="button"
          onClick={() => onStartCall('audio')}
          aria-label={dict.header.audioCallAria}
          title={dict.header.audioCallAria}
          className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full text-white transition-colors duration-fast hover:bg-white/15 md:text-wa-text-secondary md:hover:bg-wa-composer md:hover:text-wa-text-primary"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0 1 22 16.92z"
            />
          </svg>
        </button>

        {/* Recherche dans la conversation (🔍) */}
        <button
          type="button"
          onClick={onToggleSearch}
          aria-pressed={isSearchOpen}
          aria-label={dict.header.searchInChatAria}
          title={dict.header.searchInChatAria}
          className={`inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full transition-colors duration-fast ${
            isSearchOpen
              ? 'bg-white/25 text-white md:bg-wa-composer md:text-wa-text-primary'
              : 'text-white hover:bg-white/15 md:text-wa-text-secondary md:hover:bg-wa-composer md:hover:text-wa-text-primary'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7.5" />
            <path strokeLinecap="round" d="m20 20-3.8-3.8" />
          </svg>
        </button>

        {/* Menu 3 points verticaux (⋮) en haut à droite (comme sur image-1.png) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowHeaderMenu((v) => !v)}
            aria-expanded={showHeaderMenu}
            aria-label="Menu"
            className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full text-white transition-colors duration-fast hover:bg-white/15 md:text-wa-text-secondary md:hover:bg-wa-composer md:hover:text-wa-text-primary"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle cx="12" cy="5" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="12" cy="19" r="1.8" />
            </svg>
          </button>

          {showHeaderMenu && (
            <div
              role="menu"
              className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-2xl border border-wa-border bg-wa-panel py-1.5 text-wa-text-primary shadow-wa-panel"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setShowHeaderMenu(false);
                  onToggleCatalogDrawer();
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-wa-preview text-wa-text-primary hover:bg-wa-composer"
              >
                <span>🍲</span>
                <span>{dict.header.catalogDrawerButton}</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setShowHeaderMenu(false);
                  onVerifySecurityCode?.();
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-wa-preview text-wa-text-primary hover:bg-wa-composer"
              >
                <span>🔒</span>
                <span>{verifyLabel}</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setShowHeaderMenu(false);
                  onOpenSettings();
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-wa-preview text-wa-text-primary hover:bg-wa-composer"
              >
                <span>🎨</span>
                <span>{dict.header.appearanceAria}</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setShowHeaderMenu(false);
                  onToggleOfflineMode();
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-wa-preview text-wa-text-primary hover:bg-wa-composer"
              >
                <span>{isOnlineNetwork ? '📡' : '📶'}</span>
                <span>
                  {isOnlineNetwork
                    ? dict.header.offlineToggleLabel
                    : dict.header.onlineToggleLabel}
                </span>
              </button>

              <div className="my-1 border-t border-wa-border" />

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setShowHeaderMenu(false);
                  onRestoreDemo();
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-wa-preview text-wa-text-primary hover:bg-wa-composer"
              >
                <span>🔄</span>
                <span>{dict.header.resetDemoButton}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
