'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type {
  CallType,
  ChatRealtimeEvent,
} from '@/services';
import type { Conversation, Locale } from '@attieke-chat/shared';
import type { ChatDictionary } from '@/lib/i18n';
import { usePresence } from '@/hooks/usePresence';

export interface ChatHeaderProps {
  locale: Locale;
  conversation: Conversation | null;
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
  _unusedEvent?: ChatRealtimeEvent;
}

export function ChatHeader({
  locale,
  conversation,
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
}: ChatHeaderProps): React.JSX.Element {
  const { isOnline, isTyping, isRecordingVoice, statusLabel } = usePresence(
    conversation,
    locale,
    dict.presence
  );

  return (
    <header className="flex items-center justify-between bg-brand-green px-3 py-2.5 text-white shadow-sm sm:px-4">
      {/* Gauche : Retour mobile (liste conversations) / Retour accueil + Avatar + Nom + Présence */}
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          type="button"
          onClick={onShowMobileConversationList}
          aria-label={dict.conversationList.backToConversationsAria}
          className="relative inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-full bg-white/15 px-2.5 text-xs font-extrabold text-white transition-colors hover:bg-white/25 md:hidden"
        >
          <span>←</span>
          {totalUnreadCount > 0 && (
            <span className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-extrabold text-brand-ink">
              {totalUnreadCount}
            </span>
          )}
        </button>

        <Link
          href={`/${locale}`}
          aria-label={dict.header.backToHomeAria}
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:inline-flex"
        >
          ←
        </Link>

        <div className="relative h-10 w-10 shrink-0">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-brand-gold bg-brand-green-dark">
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
              className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-brand-green bg-[#25D366]"
            />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="truncate text-sm font-extrabold leading-tight sm:text-base">
              {conversation?.vendorName ?? dict.header.vendorName}
            </h2>
            {conversation?.muted && (
              <span
                aria-label={dict.conversationList.mutedBadge}
                className="text-xs text-white/70"
              >
                🔇
              </span>
            )}
          </div>
          <p
            aria-live="polite"
            className={`truncate text-xs ${
              isTyping || isRecordingVoice
                ? 'font-extrabold text-brand-gold'
                : isOnline
                ? 'text-emerald-300'
                : 'text-white/75'
            }`}
          >
            {statusLabel}
          </p>
        </div>
      </div>

      {/* Droite : Actions WhatsApp (Appel vocal, Appel vidéo, Recherche, Catalogue, Thème, Hors-ligne, Démo) */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
        {/* Appel vocal simulé */}
        <button
          type="button"
          onClick={() => onStartCall('audio')}
          aria-label={dict.header.audioCallAria}
          title={dict.header.audioCallAria}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </button>

        {/* Appel vidéo simulé */}
        <button
          type="button"
          onClick={() => onStartCall('video')}
          aria-label={dict.header.videoCallAria}
          title={dict.header.videoCallAria}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>

        {/* Recherche dans la conversation */}
        <button
          type="button"
          onClick={onToggleSearch}
          aria-pressed={isSearchOpen}
          aria-label={dict.header.searchInChatAria}
          title={dict.header.searchInChatAria}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${
            isSearchOpen
              ? 'bg-brand-gold text-brand-ink'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Interrupteur Mode Hors-Ligne / En Ligne */}
        <button
          type="button"
          onClick={onToggleOfflineMode}
          aria-pressed={!isOnlineNetwork}
          title={
            isOnlineNetwork
              ? dict.header.offlineToggleLabel
              : dict.header.onlineToggleLabel
          }
          className={`hidden sm:inline-flex h-9 items-center gap-1 rounded-full px-2.5 text-[11px] font-extrabold transition-colors ${
            isOnlineNetwork
              ? 'bg-white/10 text-emerald-300 hover:bg-white/20'
              : 'bg-amber-400 text-brand-ink shadow-xs'
          }`}
        >
          <span aria-hidden="true">{isOnlineNetwork ? '📶' : '✈️'}</span>
          <span className="hidden lg:inline">
            {isOnlineNetwork
              ? dict.header.onlineToggleLabel
              : dict.header.offlineToggleLabel}
          </span>
        </button>

        {/* Personnalisation Thème / Fond / Police / Notifications */}
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label={dict.header.appearanceAria}
          title={dict.header.appearanceAria}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
        >
          <span aria-hidden="true" className="text-sm">
            🎨
          </span>
        </button>

        {/* Tiroir Catalogue rapide */}
        <button
          type="button"
          onClick={onToggleCatalogDrawer}
          className="inline-flex min-h-[36px] items-center gap-1 rounded-full border border-brand-ink bg-brand-gold px-2.5 py-1 text-xs font-extrabold text-brand-ink transition-colors hover:bg-brand-gold-hover sm:px-3"
        >
          <span aria-hidden="true">🍲</span>
          <span className="hidden xl:inline">
            {dict.header.catalogDrawerButton}
          </span>
        </button>

        {/* Restaurer la démo */}
        <button
          type="button"
          onClick={onRestoreDemo}
          title={dict.header.resetDemoButton}
          aria-label={dict.header.resetDemoButton}
          className="inline-flex h-9 items-center rounded-full bg-white/15 px-2.5 text-xs font-bold text-white hover:bg-white/25"
        >
          ↺
        </button>
      </div>
    </header>
  );
}
