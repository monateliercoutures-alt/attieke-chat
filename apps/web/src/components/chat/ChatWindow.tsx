'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { ImageAttachmentItem, Locale } from '@attieke-chat/shared';
import {
  formatPriceYuan,
  type ChatDictionary,
  type CommonDictionary,
} from '@/lib/i18n';
import { useChat } from '@/hooks/useChat';
import { useMessageActions } from '@/hooks/useMessageActions';
import { ConversationList } from './ConversationList';
import { ChatHeader } from './ChatHeader';
import { SearchBar } from './SearchBar';
import { MessageList } from './MessageList';
import { Composer } from './Composer';
import { ContextMenu } from './ContextMenu';
import { ImageViewer } from './ImageViewer';
import { CallScreen } from './CallScreen';
import { ChatSettingsModal } from './ChatSettingsModal';

export interface ChatWindowProps {
  locale: Locale;
  initialProductSlug?: string;
  chatDict: ChatDictionary;
  commonDict: CommonDictionary;
}

export function ChatWindow({
  locale,
  initialProductSlug,
  chatDict,
  commonDict,
}: ChatWindowProps): React.JSX.Element {
  const {
    conversations,
    filteredConversations,
    activeConversationId,
    activeConversation,
    totalUnreadCount,
    conversationSearchQuery,
    conversationFilter,
    presenceByConversation,
    draftsByConversation,
    activeDraftText,
    replyingTo,
    messages,
    hasMoreOlderMessages,
    productsMap,
    ordersMap,
    allProducts,
    isBusy,
    isVendorTyping,
    isVendorRecordingVoice,
    messageSearchQuery,
    searchMatchIds,
    currentSearchMatchIndex,
    isOnlineNetwork,
    offlineQueueCount,
    preferences,
    activeCall,
    selectConversation,
    setConversationSearchQuery,
    setConversationFilter,
    togglePinConversation,
    toggleMuteConversation,
    markConversationRead,
    updateDraft,
    sendText,
    sendImages,
    sendVoice,
    sendDocument,
    sendLocation,
    sendContact,
    sendProductInquiry,
    addToOrderFromChat,
    confirmOrderFromChat,
    advanceOrderStepFromChat,
    loadOlderMessages,
    setMessageSearchQuery,
    nextSearchMatch,
    prevSearchMatch,
    toggleOfflineMode,
    updatePreferences,
    startCall,
    acceptCall,
    endCall,
    toggleCallMute,
    toggleCallSpeaker,
    toggleCallCamera,
    resetDemo,
  } = useChat({ locale, initialProductSlug });

  const scrollToMessageElement = (messageId: string): void => {
    if (typeof document === 'undefined') {
      return;
    }
    const el = document.getElementById(`chat-msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const {
    activeContextMenuMessage,
    forwardingMessage,
    infoModalMessage,
    highlightedMessageId,
    actionToast,
    openContextMenu,
    closeContextMenu,
    startReplyTo,
    cancelReplyTo,
    toggleReaction,
    toggleStar,
    copyMessageText,
    openForwardModal,
    closeForwardModal,
    confirmForward,
    openInfoModal,
    closeInfoModal,
    deleteForMe,
    deleteForEveryone,
    retryFailedMessage,
    jumpToMessage,
  } = useMessageActions({
    locale,
    activeConversationId,
    onJumpToMessage: scrollToMessageElement,
  });

  const [showMobileConversationList, setShowMobileConversationList] =
    useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [showCatalogDrawer, setShowCatalogDrawer] = useState<boolean>(false);
  const [viewerState, setViewerState] = useState<{
    images: ImageAttachmentItem[];
    index: number;
    caption?: string;
  } | null>(null);

  const handleSendQuickOrderInquiry = async (): Promise<void> => {
    await sendText(
      locale === 'zh'
        ? '📦 您好！我想查看我当前的木薯订单状态与详情。'
        : locale === 'en'
        ? '📦 Hello! Could you show my current Attiéké order status and details?'
        : '📦 Bonjour ! Pouvez-vous afficher le détail de ma commande en cours ?'
    );
  };

  const handleSendQuickDeliveryTracking = async (): Promise<void> => {
    await sendText(
      locale === 'zh'
        ? '🚚 您好！请问我寄往北京朝阳区的顺丰冷链包裹到哪里了？'
        : locale === 'en'
        ? '🚚 Hello! Where is my SF Express Cold Chain parcel to Beijing Chaoyang right now?'
        : '🚚 Bonjour ! Où en est la livraison SF Express Cold Chain de mon colis vers Pékin Chaoyang ?'
    );
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-5rem)] max-w-7xl overflow-hidden rounded-3xl border border-brand-ink/10 bg-white shadow-card">
      {/* PANNEAU GAUCHE : Liste des conversations (Sous-phase A) */}
      <div
        className={`${
          showMobileConversationList ? 'flex w-full' : 'hidden'
        } md:flex md:w-[330px] lg:w-[360px] shrink-0 h-full`}
      >
        <ConversationList
          locale={locale}
          conversations={filteredConversations}
          activeConversationId={activeConversationId}
          totalUnreadCount={totalUnreadCount}
          searchQuery={conversationSearchQuery}
          filter={conversationFilter}
          presenceByConversation={presenceByConversation}
          draftsByConversation={draftsByConversation}
          dict={chatDict}
          onSelectConversation={(convId) => {
            void selectConversation(convId);
            setShowMobileConversationList(false);
          }}
          onSearchChange={setConversationSearchQuery}
          onFilterChange={setConversationFilter}
          onTogglePin={(convId) => void togglePinConversation(convId)}
          onToggleMute={(convId) => void toggleMuteConversation(convId)}
          onMarkRead={(convId) => void markConversationRead(convId)}
        />
      </div>

      {/* PANNEAU DROIT : Fil de conversation actif (Sous-phases B, C, D, E, F) */}
      <div
        className={`${
          showMobileConversationList ? 'hidden md:flex' : 'flex'
        } relative flex-1 flex-col h-full min-w-0 overflow-hidden`}
      >
        {/* 1. En-tête de la conversation active */}
        <ChatHeader
          locale={locale}
          conversation={activeConversation}
          totalUnreadCount={totalUnreadCount}
          isOnlineNetwork={isOnlineNetwork}
          isSearchOpen={isSearchOpen}
          dict={chatDict}
          onShowMobileConversationList={() =>
            setShowMobileConversationList(true)
          }
          onToggleSearch={() => {
            setIsSearchOpen((prev) => {
              if (prev) {
                setMessageSearchQuery('');
              }
              return !prev;
            });
          }}
          onStartCall={(type) => void startCall(type)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleOfflineMode={() => void toggleOfflineMode()}
          onToggleCatalogDrawer={() => setShowCatalogDrawer((v) => !v)}
          onRestoreDemo={() => void resetDemo()}
        />

        {/* 2. Bandeau Mode Hors-Ligne ("connexion en cours…") avec file d'attente */}
        {!isOnlineNetwork && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-2 bg-amber-400 px-4 py-2 text-xs font-extrabold text-brand-ink shadow-xs"
          >
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="animate-spin">
                ⏳
              </span>
              <span>
                {chatDict.offlineBanner.connectingTitle} — {offlineQueueCount}{' '}
                {chatDict.offlineBanner.queuedCountSuffix}
              </span>
            </div>
            <button
              type="button"
              onClick={() => void toggleOfflineMode()}
              className="rounded-full bg-brand-ink px-3 py-1 text-[11px] font-extrabold text-brand-gold hover:bg-brand-green"
            >
              📶 {chatDict.offlineBanner.reconnectNowButton}
            </button>
          </div>
        )}

        {/* 3. Barre de recherche dans la conversation */}
        {isSearchOpen && (
          <SearchBar
            query={messageSearchQuery}
            matchIds={searchMatchIds}
            currentMatchIndex={currentSearchMatchIndex}
            dict={chatDict.searchBar}
            onQueryChange={(q) => setMessageSearchQuery(q)}
            onPrevMatch={() => {
              const targetId = prevSearchMatch();
              if (targetId) {
                jumpToMessage(targetId);
              }
            }}
            onNextMatch={() => {
              const targetId = nextSearchMatch();
              if (targetId) {
                jumpToMessage(targetId);
              }
            }}
            onClose={() => {
              setIsSearchOpen(false);
              setMessageSearchQuery('');
            }}
          />
        )}

        {/* 4. Tiroir Catalogue Rapide pour mentionner un produit dans le chat */}
        {showCatalogDrawer && (
          <div className="border-b border-brand-ink/10 bg-brand-cream p-3.5 shadow-inner">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-brand-green">
                🍲 {chatDict.quickCatalog.title}
              </span>
              <button
                type="button"
                aria-label={chatDict.quickCatalog.closeAria}
                onClick={() => setShowCatalogDrawer(false)}
                className="text-xs font-bold text-brand-ink-muted hover:text-brand-ink"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {allProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="flex w-56 shrink-0 items-center gap-2.5 rounded-2xl border border-brand-ink/10 bg-white p-2.5 shadow-xs"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-brand-cream-subtle">
                    <Image
                      src={prod.imageSrc}
                      alt={prod.name[locale]}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-extrabold text-brand-ink">
                      {prod.name[locale]}
                    </p>
                    <p className="text-xs font-extrabold text-brand-green">
                      {formatPriceYuan(prod.priceYuan, locale)}
                    </p>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => {
                        void sendProductInquiry(prod.id);
                        setShowCatalogDrawer(false);
                      }}
                      className="mt-1 rounded-full bg-brand-green-soft px-2.5 py-0.5 text-[11px] font-bold text-brand-green hover:bg-brand-green hover:text-white"
                    >
                      {chatDict.quickCatalog.sendToChatButton}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Toast éphémère (Texte copié / Message transféré) */}
        {actionToast && (
          <div
            role="status"
            className="pointer-events-none absolute left-1/2 top-16 z-30 -translate-x-1/2 rounded-full bg-brand-ink/90 px-4 py-1.5 text-xs font-extrabold text-brand-gold shadow-lg"
          >
            ✓ {actionToast}
          </div>
        )}

        {/* 6. Liste des messages avec séparateurs de date, pagination haut et bouton flottant bas */}
        <MessageList
          messages={messages}
          conversation={activeConversation}
          locale={locale}
          productsMap={productsMap}
          ordersMap={ordersMap}
          chatDict={chatDict}
          statusDict={commonDict.orderStatus}
          preferences={preferences}
          isBusy={isBusy}
          isVendorTyping={isVendorTyping}
          isVendorRecordingVoice={isVendorRecordingVoice}
          hasMoreOlderMessages={hasMoreOlderMessages}
          highlightedMessageId={highlightedMessageId}
          searchQuery={messageSearchQuery}
          onLoadOlderMessages={() => void loadOlderMessages()}
          onAddToOrder={addToOrderFromChat}
          onConfirmOrder={confirmOrderFromChat}
          onAdvanceStep={advanceOrderStepFromChat}
          onOpenContextMenu={openContextMenu}
          onReply={startReplyTo}
          onToggleReaction={(messageId, emoji) =>
            void toggleReaction(messageId, emoji)
          }
          onJumpToMessage={jumpToMessage}
          onRetryMessage={(messageId) => void retryFailedMessage(messageId)}
          onOpenImageViewer={(images, index, caption) =>
            setViewerState({ images, index, caption })
          }
          onQuickReplyText={(txt) => void sendText(txt)}
        />

        {/* 7. Zone de saisie complète (Composer + Emojis + Vocaux + Pièces jointes + Raccourcis) */}
        <Composer
          locale={locale}
          vendorName={
            activeConversation?.vendorName ?? chatDict.header.vendorName
          }
          draftText={activeDraftText}
          replyingTo={replyingTo}
          isBusy={isBusy}
          dict={chatDict}
          onDraftChange={updateDraft}
          onCancelReply={cancelReplyTo}
          onSendText={sendText}
          onSendImages={sendImages}
          onSendVoice={sendVoice}
          onSendDocument={sendDocument}
          onSendLocation={sendLocation}
          onSendContact={sendContact}
          onOpenCatalogDrawer={() => setShowCatalogDrawer(true)}
          onSendQuickOrderInquiry={() => void handleSendQuickOrderInquiry()}
          onSendQuickDeliveryTracking={() =>
            void handleSendQuickDeliveryTracking()
          }
        />

        {/* 8. Menu contextuel sur un message + Modales Transférer & Infos */}
        <ContextMenu
          message={activeContextMenuMessage}
          forwardingMessage={forwardingMessage}
          infoModalMessage={infoModalMessage}
          conversations={conversations}
          locale={locale}
          dict={chatDict}
          onCloseContextMenu={closeContextMenu}
          onReply={(msg) => startReplyTo(msg)}
          onReact={(messageId, emoji) => void toggleReaction(messageId, emoji)}
          onCopy={(msg) =>
            void copyMessageText(msg, chatDict.contextMenu.copiedToast)
          }
          onOpenForward={openForwardModal}
          onCloseForward={closeForwardModal}
          onConfirmForward={(targetConvId) =>
            void confirmForward(
              targetConvId,
              chatDict.contextMenu.forwardedToast
            )
          }
          onToggleStar={(messageId) => void toggleStar(messageId)}
          onOpenInfo={openInfoModal}
          onCloseInfo={closeInfoModal}
          onDeleteForMe={(messageId) => void deleteForMe(messageId)}
          onDeleteForEveryone={(messageId) => void deleteForEveryone(messageId)}
        />

        {/* 9. Visionneuse d'images plein écran avec zoom et navigation */}
        {viewerState && (
          <ImageViewer
            images={viewerState.images}
            initialIndex={viewerState.index}
            caption={viewerState.caption}
            dict={chatDict.imageViewer}
            onClose={() => setViewerState(null)}
          />
        )}

        {/* 10. Écran d'appel vocal / vidéo simulé (CallService) */}
        <CallScreen
          session={activeCall}
          dict={chatDict.callScreen}
          onAccept={() => void acceptCall()}
          onEnd={() => void endCall()}
          onToggleMute={() => void toggleCallMute()}
          onToggleSpeaker={() => void toggleCallSpeaker()}
          onToggleCamera={() => void toggleCallCamera()}
        />

        {/* 11. Modale Apparence, Fond de chat, Taille du texte & Notifications */}
        {isSettingsOpen && (
          <ChatSettingsModal
            preferences={preferences}
            dict={chatDict.settings}
            onUpdatePreferences={(partial) => void updatePreferences(partial)}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
