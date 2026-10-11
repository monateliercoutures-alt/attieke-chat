'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type {
  Conversation,
  Locale,
  MessageDeliveryStatus,
  Presence,
} from '@attieke-chat/shared';
import { formatTimeShort, type ChatDictionary } from '@/lib/i18n';
import type { ConversationListFilter } from '@/store/useChatStore';

export interface ConversationListProps {
  locale: Locale;
  conversations: Conversation[];
  activeConversationId: string;
  totalUnreadCount: number;
  searchQuery: string;
  filter: ConversationListFilter;
  presenceByConversation: Record<string, Presence>;
  draftsByConversation: Record<string, string>;
  dict: ChatDictionary;
  onSelectConversation: (conversationId: string) => void;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: ConversationListFilter) => void;
  onTogglePin: (conversationId: string) => void;
  onToggleMute: (conversationId: string) => void;
  onMarkRead: (conversationId: string) => void;
  onOpenCatalogDrawer?: () => void;
}

function renderDeliveryStatusIcon(
  status?: MessageDeliveryStatus
): React.ReactNode {
  if (!status) {
    return null;
  }
  if (status === 'sending') {
    return (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
        className="h-3.5 w-3.5 shrink-0 text-wa-text-secondary"
      >
        <circle cx="8" cy="8" r="6" />
        <path strokeLinecap="round" d="M8 4.5V8l2.5 1.5" />
      </svg>
    );
  }
  if (status === 'failed') {
    return (
      <span
        aria-hidden="true"
        className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-red-600 text-wa-meta font-bold text-white"
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
        strokeWidth="1.6"
        aria-hidden="true"
        className="h-3.5 w-3.5 shrink-0 text-wa-text-secondary"
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
      strokeWidth="1.7"
      aria-hidden="true"
      className={`h-3.5 w-4 shrink-0 ${tickColor}`}
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

export function ConversationList({
  locale,
  conversations,
  activeConversationId,
  totalUnreadCount,
  searchQuery,
  filter,
  presenceByConversation,
  draftsByConversation,
  dict,
  onSelectConversation,
  onSearchChange,
  onFilterChange,
  onTogglePin,
  onToggleMute,
  onMarkRead,
  onOpenCatalogDrawer,
}: ConversationListProps): React.JSX.Element {
  const [openMenuConvId, setOpenMenuConvId] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);
  const [onlineOnly, setOnlineOnly] = useState<boolean>(false);
  const [showLockedBanner, setShowLockedBanner] = useState<boolean>(false);
  const [showTopOverflowMenu, setShowTopOverflowMenu] =
    useState<boolean>(false);
  const listDict = dict.conversationList;

  const favoritesLabel =
    locale === 'zh' ? '收藏' : locale === 'en' ? 'Favorites' : 'Favoris';
  const onlineFilterLabel =
    locale === 'zh' ? '在线' : locale === 'en' ? 'Online' : 'En ligne';
  const lockedChatsLabel =
    locale === 'zh'
      ? '锁定的聊天'
      : locale === 'en'
      ? 'Locked chats'
      : 'Discussions verrouillées';
  const desktopBannerLabel =
    locale === 'zh'
      ? '获取阿比让木薯桌面快捷点单体验'
      : locale === 'en'
      ? 'Get Saveur Attiéké Desktop Quick Order'
      : 'Commande rapide Saveur Attiéké sur ordinateur';

  const visibleConversations = conversations.filter((c) => {
    if (favoritesOnly && !c.pinned) {
      return false;
    }
    if (onlineOnly && presenceByConversation[c.id]?.status !== 'online') {
      return false;
    }
    return true;
  });

  return (
    <aside
      aria-label={listDict.title}
      className="relative flex h-full w-full flex-col border-r border-wa-border bg-wa-panel select-none"
    >
      {/* En-tête Desktop de la colonne Discussions (Titre vert à gauche + Menu ⋮ + Bouton rond vert 💬+ à droite, exactement comme sur image-1.png) */}
      <div className="hidden items-center justify-between px-4 pt-3 pb-1 md:flex">
        <h1 className="text-[22px] font-bold tracking-tight text-wa-dark-green dark:text-wa-accent">
          {dict.header.vendorName}
        </h1>

        <div className="relative flex items-center gap-1.5">
          {/* Menu 3 points verticaux ⋮ */}
          <button
            type="button"
            onClick={() => setShowTopOverflowMenu((v) => !v)}
            aria-label="Menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-wa-text-secondary transition-colors duration-fast hover:bg-wa-composer hover:text-wa-text-primary"
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

          {/* Bouton rond vert "Nouvelle discussion / Catalogue" (💬+) comme en haut à droite de la colonne gauche sur image-1.png */}
          <button
            type="button"
            onClick={() => {
              if (onOpenCatalogDrawer) {
                onOpenCatalogDrawer();
              } else if (conversations[0]) {
                onSelectConversation(conversations[0].id);
              }
            }}
            aria-label={dict.header.catalogDrawerButton}
            title={dict.header.catalogDrawerButton}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-wa-accent text-white shadow-wa-bubble transition-transform duration-fast hover:opacity-95 active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 9h-4v4h-2v-4H7V9h4V5h2v4h4v2z" />
            </svg>
          </button>

          {/* Menu déroulant du bouton ⋮ de la colonne gauche */}
          {showTopOverflowMenu && (
            <div className="absolute right-0 top-11 z-40 w-56 overflow-hidden rounded-2xl border border-wa-border bg-wa-panel py-1.5 shadow-wa-panel">
              <button
                type="button"
                onClick={() => {
                  setShowTopOverflowMenu(false);
                  onOpenCatalogDrawer?.();
                }}
                className="flex w-full items-center px-4 py-2.5 text-left text-wa-preview text-wa-text-primary hover:bg-wa-composer"
              >
                {dict.header.catalogDrawerButton}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTopOverflowMenu(false);
                  setFavoritesOnly((v) => !v);
                }}
                className="flex w-full items-center px-4 py-2.5 text-left text-wa-preview text-wa-text-primary hover:bg-wa-composer"
              >
                {favoritesLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTopOverflowMenu(false);
                  setShowLockedBanner((v) => !v);
                }}
                className="flex w-full items-center px-4 py-2.5 text-left text-wa-preview text-wa-text-primary hover:bg-wa-composer"
              >
                {lockedChatsLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTopOverflowMenu(false);
                  conversations.forEach((c) => {
                    if (c.unreadCount > 0) {
                      onMarkRead(c.id);
                    }
                  });
                }}
                className="flex w-full items-center px-4 py-2.5 text-left text-wa-preview text-wa-text-primary hover:bg-wa-composer"
              >
                {listDict.markReadAction}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Barre de recherche pilule + Filtres (Toutes | Non lues | Favoris | ▾) comme sur image-1.png */}
      <div className="px-3.5 pt-2.5 pb-2">
        <div className="relative flex items-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
            className="pointer-events-none absolute left-4 h-4 w-4 text-wa-text-secondary"
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              locale === 'fr'
                ? 'Rechercher ou démarrer une discussion'
                : listDict.searchPlaceholder
            }
            aria-label={listDict.searchPlaceholder}
            className="min-h-[40px] w-full rounded-full bg-wa-composer pl-11 pr-4 py-1.5 text-wa-preview text-wa-text-primary placeholder:text-wa-text-secondary focus:outline-none focus:ring-2 focus:ring-wa-accent"
          />
        </div>

        {/* Pastilles de filtre : Toutes | Non lues {n} | Favoris | ▾ (exactement comme sur image-1.png) */}
        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto">
          {/* 1. Toutes */}
          <button
            type="button"
            onClick={() => {
              setFavoritesOnly(false);
              setOnlineOnly(false);
              onFilterChange('all');
            }}
            aria-pressed={filter === 'all' && !favoritesOnly && !onlineOnly}
            className={`min-h-[32px] shrink-0 rounded-full border px-3.5 py-1 text-wa-meta font-semibold transition-colors duration-fast ${
              filter === 'all' && !favoritesOnly && !onlineOnly
                ? 'border-wa-nav-pill bg-wa-nav-pill text-wa-dark-green dark:text-wa-accent'
                : 'border-wa-border bg-transparent text-wa-text-secondary hover:bg-wa-composer hover:text-wa-text-primary'
            }`}
          >
            {listDict.filterAll}
          </button>

          {/* 2. Non lues {count} */}
          <button
            type="button"
            onClick={() => {
              setFavoritesOnly(false);
              setOnlineOnly(false);
              onFilterChange('unread');
            }}
            aria-pressed={filter === 'unread' && !favoritesOnly && !onlineOnly}
            className={`inline-flex min-h-[32px] shrink-0 items-center gap-1 rounded-full border px-3.5 py-1 text-wa-meta font-semibold transition-colors duration-fast ${
              filter === 'unread' && !favoritesOnly && !onlineOnly
                ? 'border-wa-nav-pill bg-wa-nav-pill text-wa-dark-green dark:text-wa-accent'
                : 'border-wa-border bg-transparent text-wa-text-secondary hover:bg-wa-composer hover:text-wa-text-primary'
            }`}
          >
            <span>{listDict.filterUnread}</span>
            {totalUnreadCount > 0 && (
              <span className="font-semibold text-wa-text-secondary">
                {totalUnreadCount}
              </span>
            )}
          </button>

          {/* 3. Favoris */}
          <button
            type="button"
            onClick={() => {
              setFavoritesOnly((prev) => !prev);
              setOnlineOnly(false);
              onFilterChange('all');
            }}
            aria-pressed={favoritesOnly}
            className={`min-h-[32px] shrink-0 rounded-full border px-3.5 py-1 text-wa-meta font-semibold transition-colors duration-fast ${
              favoritesOnly
                ? 'border-wa-nav-pill bg-wa-nav-pill text-wa-dark-green dark:text-wa-accent'
                : 'border-wa-border bg-transparent text-wa-text-secondary hover:bg-wa-composer hover:text-wa-text-primary'
            }`}
          >
            {favoritesLabel}
          </button>

          {/* 4. Bouton chevron ▾ (filtre En ligne) */}
          <button
            type="button"
            onClick={() => {
              setFavoritesOnly(false);
              setOnlineOnly((prev) => !prev);
              onFilterChange('all');
            }}
            aria-pressed={onlineOnly}
            title={onlineFilterLabel}
            aria-label={onlineFilterLabel}
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-wa-meta transition-colors duration-fast ${
              onlineOnly
                ? 'border-wa-nav-pill bg-wa-nav-pill text-wa-dark-green dark:text-wa-accent'
                : 'border-wa-border bg-transparent text-wa-text-secondary hover:bg-wa-composer hover:text-wa-text-primary'
            }`}
          >
            ▾
          </button>
        </div>
      </div>

      {/* Ligne "Discussions verrouillées" (exactement comme sur image-1.png) */}
      <button
        type="button"
        onClick={() => setShowLockedBanner((v) => !v)}
        className="flex w-full items-center gap-4 px-5 py-2.5 text-left transition-colors duration-fast hover:bg-wa-composer/60"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center text-wa-text-secondary">
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
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            />
            <rect x="9" y="9" width="6" height="5" rx="1" />
            <path strokeLinecap="round" d="M10.5 9V7.5a1.5 1.5 0 0 1 3 0V9" />
          </svg>
        </span>
        <span className="text-wa-contact font-normal text-wa-text-primary">
          {lockedChatsLabel}
        </span>
      </button>

      {showLockedBanner && (
        <div className="mx-3.5 mb-2 rounded-xl border border-wa-border bg-wa-composer px-3.5 py-2 text-wa-meta text-wa-text-secondary">
          🔒{' '}
          {locale === 'zh'
            ? '您的私密订单会话已受端到端密码保护。'
            : locale === 'en'
            ? 'Your private order threads are protected by security lock.'
            : 'Vos discussions privées sont protégées par code de sécurité.'}
        </div>
      )}

      {/* Liste déroulante des discussions */}
      <div className="flex-1 overflow-y-auto pb-20 md:pb-2">
        {visibleConversations.length === 0 ? (
          <div className="p-8 text-center text-wa-preview text-wa-text-secondary">
            {listDict.emptyFilteredTitle}
          </div>
        ) : (
          <ul className="space-y-0.5 px-1.5">
            {visibleConversations.map((conv) => {
              const isSelected = conv.id === activeConversationId;
              const presence = presenceByConversation[conv.id];
              const draftText = draftsByConversation[conv.id]?.trim() ?? '';
              const lastMsgText = conv.lastMessagePreview?.[locale] ?? '';
              const timeStr = formatTimeShort(conv.lastMessageAt, locale);
              const isOnline = presence?.status === 'online';
              const isTyping = presence?.status === 'typing';
              const isRecording = presence?.status === 'recording_voice';
              const hasUnread = conv.unreadCount > 0;

              return (
                <li key={conv.id} className="relative group">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onClick={() => {
                      setOpenMenuConvId(null);
                      onSelectConversation(conv.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectConversation(conv.id);
                      }
                    }}
                    className={`flex w-full cursor-pointer items-center gap-3.5 rounded-xl px-3 py-2.5 text-left transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-wa-accent ${
                      isSelected
                        ? 'bg-wa-composer'
                        : 'hover:bg-wa-composer/60 active:bg-wa-composer'
                    }`}
                  >
                    {/* Avatar rond 49px-52px avec anneau vert quand en ligne ou non lu */}
                    <div className="relative h-[50px] w-[50px] shrink-0">
                      <div
                        className={`relative h-full w-full overflow-hidden rounded-full ${
                          isOnline || hasUnread
                            ? 'ring-2 ring-wa-accent ring-offset-2 ring-offset-wa-panel'
                            : 'border border-wa-border'
                        }`}
                      >
                        <Image
                          src={conv.vendorAvatarUrl}
                          alt={conv.vendorName}
                          fill
                          sizes="50px"
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {/* Colonne Texte */}
                    <div className="min-w-0 flex-1">
                      {/* Ligne 1 : Nom (16px) + Heure à droite (verte si non-lu, grise sinon) */}
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="wa-text-contact truncate font-medium text-wa-text-primary">
                          {conv.vendorName}
                        </p>
                        <span
                          className={`shrink-0 text-wa-meta ${
                            hasUnread
                              ? 'font-semibold text-wa-accent'
                              : 'text-wa-text-secondary'
                          }`}
                        >
                          {timeStr}
                        </span>
                      </div>

                      {/* Ligne 2 : Aperçu du dernier message tronqué sur 1 ligne + Épingle punaise grise / Badge vert non-lus */}
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {isTyping ? (
                            <p className="truncate text-wa-preview font-medium text-wa-accent">
                              {dict.header.typingStatus}
                            </p>
                          ) : isRecording ? (
                            <p className="truncate text-wa-preview font-medium text-wa-accent">
                              🎤 {dict.presence.recordingVoice}
                            </p>
                          ) : draftText ? (
                            <p className="truncate text-wa-preview">
                              <span className="font-semibold text-red-500">
                                {listDict.draftPrefix}{' '}
                              </span>
                              <span className="text-wa-text-secondary">
                                {draftText}
                              </span>
                            </p>
                          ) : (
                            <p className="flex items-center gap-1 truncate text-wa-preview text-wa-text-secondary">
                              {conv.lastMessageSender === 'customer' && (
                                <>
                                  {renderDeliveryStatusIcon(
                                    conv.lastMessageStatus
                                  )}
                                </>
                              )}
                              <span className="truncate">{lastMsgText}</span>
                            </p>
                          )}
                        </div>

                        {/* Indicateurs droite : Punaise SVG grise (comme sur image-1.png) + Sourdine + Badge rond vert #25D366 */}
                        <div className="flex shrink-0 items-center gap-1.5">
                          {conv.pinned && (
                            <span
                              title={listDict.pinnedBadge}
                              aria-label={listDict.pinnedBadge}
                              className="text-wa-text-secondary"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="h-4 w-4 rotate-45"
                                aria-hidden="true"
                              >
                                <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                              </svg>
                            </span>
                          )}
                          {conv.muted && (
                            <span
                              title={listDict.mutedBadge}
                              aria-label={listDict.mutedBadge}
                              className="text-wa-meta text-wa-text-secondary"
                            >
                              🔕
                            </span>
                          )}
                          {hasUnread && (
                            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-wa-accent px-1.5 text-wa-meta font-bold text-white">
                              {conv.unreadCount}
                            </span>
                          )}

                          {/* Bouton menu rapide de la conversation */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuConvId((prev) =>
                                prev === conv.id ? null : conv.id
                              );
                            }}
                            aria-label="Options"
                            className="flex h-6 w-6 items-center justify-center rounded-full text-wa-meta text-wa-text-secondary opacity-0 transition-opacity duration-fast group-hover:opacity-100 focus:opacity-100 hover:bg-wa-panel"
                          >
                            ▾
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu déroulant contextuel (Épingler / Sourdine / Marquer lu) */}
                  {openMenuConvId === conv.id && (
                    <div className="absolute right-4 top-12 z-30 w-48 overflow-hidden rounded-xl border border-wa-border bg-wa-panel py-1 shadow-wa-panel">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePin(conv.id);
                          setOpenMenuConvId(null);
                        }}
                        className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-wa-preview text-wa-text-primary hover:bg-wa-composer"
                      >
                        <span>📌</span>
                        <span>
                          {conv.pinned
                            ? listDict.unpinAction
                            : listDict.pinAction}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleMute(conv.id);
                          setOpenMenuConvId(null);
                        }}
                        className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-wa-preview text-wa-text-primary hover:bg-wa-composer"
                      >
                        <span>🔕</span>
                        <span>
                          {conv.muted
                            ? listDict.unmuteAction
                            : listDict.muteAction}
                        </span>
                      </button>

                      {conv.unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkRead(conv.id);
                            setOpenMenuConvId(null);
                          }}
                          className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-wa-preview font-medium text-wa-accent hover:bg-wa-composer"
                        >
                          <span>✓✓</span>
                          <span>{listDict.markReadAction}</span>
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Bandeau inférieur sur Ordinateur (en bas de la colonne gauche, comme sur image-1.png) */}
      {onOpenCatalogDrawer && (
        <div className="hidden border-t border-wa-border bg-wa-panel px-4 py-2.5 md:block">
          <button
            type="button"
            onClick={onOpenCatalogDrawer}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors duration-fast hover:bg-wa-composer"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-wa-accent text-white shadow-xs">
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
                  d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"
                />
              </svg>
            </span>
            <span className="truncate text-wa-preview font-medium text-wa-dark-green dark:text-wa-accent">
              {desktopBannerLabel}
            </span>
          </button>
        </div>
      )}

      {/* Boutons d'action flottants en bas à droite de la liste sur Mobile (< 768 px) */}
      <div className="pointer-events-none absolute bottom-4 right-4 z-20 flex flex-col items-center gap-3 md:hidden">
        {onOpenCatalogDrawer && (
          <button
            type="button"
            onClick={onOpenCatalogDrawer}
            aria-label={dict.header.catalogDrawerButton}
            title={dict.header.catalogDrawerButton}
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-wa-border bg-wa-composer text-wa-text-primary shadow-wa-panel transition-transform duration-fast active:scale-95"
          >
            <span className="text-lg" aria-hidden="true">
              🍲
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            const firstConv = conversations[0];
            if (firstConv) {
              onSelectConversation(firstConv.id);
            }
          }}
          aria-label={listDict.title}
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-wa-accent text-wa-commerce-text shadow-wa-panel transition-transform duration-fast hover:opacity-95 active:scale-95"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 9h-4v4h-2v-4H7V9h4V5h2v4h4v2z" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
