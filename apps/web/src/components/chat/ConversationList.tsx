'use client';

import React from 'react';
import Image from 'next/image';
import type {
  Conversation,
  Locale,
  MessageDeliveryStatus,
  Presence,
} from '@attieke-chat/shared';
import {
  formatConversationTimestamp,
  type ChatDictionary,
} from '@/lib/i18n';
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
  onTogglePin: (conversationId: string) => void;
  onToggleMute: (conversationId: string) => void;
  onMarkRead: (conversationId: string) => void;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: ConversationListFilter) => void;
}

function DeliveryStatusIcon({
  status,
}: {
  status?: MessageDeliveryStatus;
}): React.JSX.Element | null {
  if (!status) {
    return null;
  }
  if (status === 'sending') {
    return (
      <span
        className="inline-block text-[11px] text-brand-ink-muted"
        aria-hidden="true"
      >
        🕒
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[9px] font-extrabold text-white"
        aria-hidden="true"
      >
        !
      </span>
    );
  }
  if (status === 'sent') {
    return (
      <span
        className="inline-block text-[11px] font-bold text-brand-ink-muted"
        aria-hidden="true"
      >
        ✓
      </span>
    );
  }
  if (status === 'delivered') {
    return (
      <span
        className="inline-block text-[11px] font-bold tracking-tighter text-brand-ink-muted"
        aria-hidden="true"
      >
        ✓✓
      </span>
    );
  }
  return (
    <span
      className="inline-block text-[11px] font-extrabold tracking-tighter text-sky-500"
      aria-hidden="true"
    >
      ✓✓
    </span>
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
  onTogglePin,
  onToggleMute,
  onMarkRead,
  onSearchChange,
  onFilterChange,
}: ConversationListProps): React.JSX.Element {
  const listDict = dict.conversationList;

  return (
    <aside
      aria-label={listDict.title}
      className="flex h-full w-full flex-col border-r border-brand-ink/10 bg-white select-none"
    >
      {/* En-tête vert profond style WhatsApp avec compteur global */}
      <div className="bg-brand-green px-4 py-3.5 text-white">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight sm:text-lg">
                {listDict.title}
              </h1>
              {totalUnreadCount > 0 && (
                <span
                  aria-label={`${totalUnreadCount} ${listDict.unreadBadgeAria}`}
                  className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-brand-gold px-2 py-0.5 text-[11px] font-extrabold text-brand-ink shadow-sm"
                >
                  {totalUnreadCount}
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/80">{listDict.subtitle}</p>
          </div>

          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-brand-gold"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </span>
        </div>

        {/* Barre de recherche de conversations */}
        <div className="relative mt-3">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={listDict.searchPlaceholder}
            aria-label={listDict.searchPlaceholder}
            className="min-h-[38px] w-full rounded-full border border-white/15 bg-white/12 pl-9 pr-8 py-1.5 text-xs text-white placeholder:text-white/65 focus:border-brand-gold focus:bg-white/20 focus:outline-none"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label={listDict.clearSearchAria}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/75 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtres Toutes / Non lues */}
        <div className="mt-2.5 flex items-center gap-2">
          <button
            type="button"
            aria-pressed={filter === 'all'}
            onClick={() => onFilterChange('all')}
            className={`rounded-full px-3.5 py-1 text-xs font-extrabold transition-colors ${
              filter === 'all'
                ? 'bg-brand-gold text-brand-ink shadow-sm'
                : 'bg-white/10 text-white/85 hover:bg-white/20'
            }`}
          >
            {listDict.filterAll}
          </button>

          <button
            type="button"
            aria-pressed={filter === 'unread'}
            onClick={() => onFilterChange('unread')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold transition-colors ${
              filter === 'unread'
                ? 'bg-brand-gold text-brand-ink shadow-sm'
                : 'bg-white/10 text-white/85 hover:bg-white/20'
            }`}
          >
            <span>{listDict.filterUnread}</span>
            {totalUnreadCount > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                  filter === 'unread'
                    ? 'bg-brand-ink text-brand-gold'
                    : 'bg-brand-gold text-brand-ink'
                }`}
              >
                {totalUnreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Liste des conversations */}
      <div className="flex-1 overflow-y-auto divide-y divide-brand-ink/8">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <p className="text-sm font-extrabold text-brand-ink">
              {listDict.emptyFilteredTitle}
            </p>
            <p className="mt-1 text-xs text-brand-ink-muted">
              {listDict.emptyFilteredSubtitle}
            </p>
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onFilterChange('all');
              }}
              className="mt-4 rounded-full border border-brand-ink bg-brand-gold px-4 py-2 text-xs font-extrabold text-brand-ink shadow-sm hover:bg-brand-gold-hover"
            >
              {listDict.showAllConversationsButton}
            </button>
          </div>
        ) : (
          conversations.map((conv) => {
            const isSelected = conv.id === activeConversationId;
            const presence = presenceByConversation[conv.id];
            const isOnline =
              presence?.status !== undefined
                ? presence.status !== 'offline'
                : conv.vendorOnline;
            const isTyping = presence?.status === 'typing';
            const isRecordingVoice = presence?.status === 'recording_voice';
            const draft =
              draftsByConversation[conv.id] ?? conv.draftText ?? '';
            const hasUnread = conv.unreadCount > 0;
            const timeLabel = formatConversationTimestamp(
              conv.lastMessageAt,
              locale,
              dict.dateLabels
            );

            return (
              <div
                key={conv.id}
                role="button"
                tabIndex={0}
                aria-current={isSelected ? 'true' : undefined}
                onClick={() => onSelectConversation(conv.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectConversation(conv.id);
                  }
                }}
                className={`group relative flex flex-col gap-1.5 px-3.5 py-3 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-green ${
                  isSelected
                    ? 'bg-brand-green-soft/65'
                    : hasUnread
                    ? 'bg-brand-cream/60 hover:bg-brand-cream'
                    : 'bg-white hover:bg-brand-cream/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar + Pastille En ligne */}
                  <div className="relative h-12 w-12 shrink-0">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full border border-brand-ink/15 bg-brand-cream">
                      <Image
                        src={conv.vendorAvatarUrl}
                        alt={conv.vendorName}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    {isOnline && (
                      <span
                        aria-label={dict.presence.online}
                        className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#25D366]"
                      />
                    )}
                  </div>

                  {/* Contenu central : Nom, Heure, Aperçu / Brouillon, Badges */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        {conv.pinned && (
                          <span
                            title={listDict.pinnedBadge}
                            aria-label={listDict.pinnedBadge}
                            className="shrink-0 text-xs text-brand-green"
                          >
                            📌
                          </span>
                        )}
                        <h2
                          className={`truncate text-sm ${
                            hasUnread
                              ? 'font-extrabold text-brand-ink'
                              : 'font-bold text-brand-ink'
                          }`}
                        >
                          {conv.vendorName}
                        </h2>
                        {conv.muted && (
                          <span
                            title={listDict.mutedBadge}
                            aria-label={listDict.mutedBadge}
                            className="shrink-0 text-xs text-brand-ink-muted"
                          >
                            🔇
                          </span>
                        )}
                      </div>

                      <time
                        dateTime={conv.lastMessageAt}
                        className={`shrink-0 text-[11px] ${
                          hasUnread
                            ? 'font-extrabold text-brand-green'
                            : 'font-medium text-brand-ink-muted'
                        }`}
                      >
                        {timeLabel}
                      </time>
                    </div>

                    {/* Rôle vendeur discret */}
                    {conv.vendorRole && (
                      <p className="truncate text-[11px] font-medium text-brand-green/85">
                        {conv.vendorRole[locale]}
                      </p>
                    )}

                    {/* Ligne d'aperçu : "écrit..." / Brouillon / Dernier message + Badge non-lus */}
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {isTyping ? (
                          <p className="truncate text-xs font-extrabold text-[#128C7E]">
                            ✍️ {dict.presence.typing}
                          </p>
                        ) : isRecordingVoice ? (
                          <p className="truncate text-xs font-extrabold text-[#128C7E]">
                            🎤 {dict.presence.recordingVoice}
                          </p>
                        ) : draft.trim().length > 0 ? (
                          <p className="truncate text-xs text-brand-ink">
                            <span className="font-extrabold text-amber-700">
                              {listDict.draftPrefix}
                            </span>{' '}
                            <span className="text-brand-ink-muted">{draft}</span>
                          </p>
                        ) : (
                          <p
                            className={`flex items-center gap-1 truncate text-xs ${
                              hasUnread
                                ? 'font-bold text-brand-ink'
                                : 'text-brand-ink-muted'
                            }`}
                          >
                            {conv.lastMessageSender === 'customer' && (
                              <>
                                <DeliveryStatusIcon
                                  status={conv.lastMessageStatus}
                                />
                                <span className="font-semibold text-brand-ink-muted">
                                  {listDict.youPrefix}
                                </span>
                              </>
                            )}
                            <span className="truncate">
                              {conv.lastMessagePreview?.[locale] ?? ''}
                            </span>
                          </p>
                        )}
                      </div>

                      {hasUnread && (
                        <span
                          aria-label={`${conv.unreadCount} ${listDict.unreadBadgeAria}`}
                          className={`inline-flex min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-extrabold ${
                            conv.muted
                              ? 'bg-brand-ink/20 text-brand-ink'
                              : 'bg-[#25D366] text-brand-ink shadow-xs'
                          }`}
                        >
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Barre d'actions rapides (Épingler, Sourdine, Marquer lu) */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex flex-wrap items-center justify-end gap-1.5 pt-1"
                >
                  <button
                    type="button"
                    onClick={() => onTogglePin(conv.id)}
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold transition-colors ${
                      conv.pinned
                        ? 'border-brand-green/30 bg-brand-green text-white'
                        : 'border-brand-ink/15 bg-white text-brand-ink-muted hover:text-brand-ink'
                    }`}
                  >
                    📌 {conv.pinned ? listDict.unpinAction : listDict.pinAction}
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleMute(conv.id)}
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold transition-colors ${
                      conv.muted
                        ? 'border-amber-400 bg-amber-50 text-amber-900'
                        : 'border-brand-ink/15 bg-white text-brand-ink-muted hover:text-brand-ink'
                    }`}
                  >
                    {conv.muted ? '🔔 ' : '🔇 '}
                    {conv.muted ? listDict.unmuteAction : listDict.muteAction}
                  </button>

                  {hasUnread && (
                    <button
                      type="button"
                      onClick={() => onMarkRead(conv.id)}
                      className="rounded-full border border-brand-green/30 bg-brand-green-soft px-2.5 py-0.5 text-[10px] font-extrabold text-brand-green hover:bg-brand-green hover:text-white"
                    >
                      ✓✓ {listDict.markReadAction}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
