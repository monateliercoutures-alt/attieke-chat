'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import type { ImageAttachmentItem, Locale, Message } from '@attieke-chat/shared';
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

  // Sur mobile (Android / iOS), afficher par défaut la liste des discussions (comme sur la capture)
  // sauf si l'utilisateur vient de cliquer sur un produit du catalogue (?product=...)
  const [showMobileConversationList, setShowMobileConversationList] =
    useState<boolean>(!initialProductSlug);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [showCatalogDrawer, setShowCatalogDrawer] = useState<boolean>(false);
  const [deletingMessage, setDeletingMessage] = useState<Message | null>(null);
  const [securityCodeModalOpen, setSecurityCodeModalOpen] =
    useState<boolean>(false);
  const [pinnedMessage, setPinnedMessage] = useState<Message | null>(null);
  const [viewerState, setViewerState] = useState<{
    images: ImageAttachmentItem[];
    index: number;
    caption?: string;
  } | null>(null);

  // Synchroniser l'attribut data-mobile-thread-open pour masquer la barre du bas sur mobile quand un fil est ouvert
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const root = document.documentElement;
    if (!showMobileConversationList) {
      root.setAttribute('data-mobile-thread-open', 'true');
    } else {
      root.removeAttribute('data-mobile-thread-open');
    }
    return () => {
      root.removeAttribute('data-mobile-thread-open');
    };
  }, [showMobileConversationList]);

  // Écouter le clic sur l'onglet "Chat / Discussions" pour revenir à la liste des discussions sur mobile
  useEffect(() => {
    const handleShowList = (): void => {
      setShowMobileConversationList(true);
    };
    window.addEventListener('attieke:show-conversation-list', handleShowList);
    return () =>
      window.removeEventListener(
        'attieke:show-conversation-list',
        handleShowList
      );
  }, []);

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
    <div
      className={`flex w-full overflow-hidden bg-wa-panel md:h-screen ${
        showMobileConversationList
          ? 'h-[calc(100dvh-7.25rem)]'
          : 'h-[100dvh]'
      }`}
    >
      {/* PANNEAU GAUCHE : Liste des discussions (plein écran par défaut sur mobile Android/iOS, colonne 380px-420px sur ordinateur) */}
      <div
        className={`${
          showMobileConversationList ? 'flex w-full' : 'hidden'
        } md:flex md:w-[380px] lg:w-[420px] shrink-0 h-full`}
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
          onOpenCatalogDrawer={() => {
            setShowMobileConversationList(false);
            setShowCatalogDrawer(true);
          }}
        />
      </div>

      {/* PANNEAU DROIT : Fil de conversation actif */}
      <div
        className={`${
          showMobileConversationList ? 'hidden md:flex' : 'flex'
        } relative flex-1 flex-col h-full min-w-0 overflow-hidden`}
      >
        {/* 1. En-tête de la conversation active OU Barre d'actions de sélection (image-3.png) */}
        <ChatHeader
          locale={locale}
          conversation={activeConversation}
          selectedMessage={activeContextMenuMessage}
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
          onClearSelectedMessage={closeContextMenu}
          onReplySelectedMessage={(msg) => startReplyTo(msg)}
          onStarSelectedMessage={(msgId) => void toggleStar(msgId)}
          onDeleteSelectedMessage={(msg) => {
            closeContextMenu();
            setDeletingMessage(msg);
          }}
          onForwardSelectedMessage={(msg) => openForwardModal(msg)}
          onInfoSelectedMessage={(msg) => openInfoModal(msg)}
          onCopySelectedMessage={(msg) =>
            void copyMessageText(msg, chatDict.contextMenu.copiedToast)
          }
          onPinSelectedMessage={(msg) => {
            setPinnedMessage((prev) => (prev?.id === msg.id ? null : msg));
            closeContextMenu();
          }}
          onVerifySecurityCode={() => {
            closeContextMenu();
            setSecurityCodeModalOpen(true);
          }}
        />

        {/* 1b. Bandeau de message épinglé (lorsqu'un message est épinglé depuis le menu ⋮ "Épingler") */}
        {pinnedMessage && (
          <div className="flex items-center justify-between gap-2 border-b border-wa-border bg-wa-panel px-4 py-2 text-wa-preview">
            <button
              type="button"
              onClick={() => jumpToMessage(pinnedMessage.id)}
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
            >
              <span className="text-wa-accent" aria-hidden="true">
                📌
              </span>
              <span className="truncate font-medium text-wa-text-primary">
                {pinnedMessage.text?.[locale] ??
                  pinnedMessage.imageCaption?.[locale] ??
                  pinnedMessage.document?.fileName ??
                  'Message épinglé'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPinnedMessage(null)}
              aria-label="Désépingler"
              className="flex h-7 w-7 items-center justify-center rounded-full text-wa-text-secondary hover:text-wa-text-primary"
            >
              ✕
            </button>
          </div>
        )}

        {/* 2. Bandeau Mode Hors-Ligne ("connexion en cours…") avec file d'attente */}
        {!isOnlineNetwork && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-2 border-b border-wa-border bg-wa-system-bg px-4 py-2 text-wa-meta font-semibold text-wa-system-text"
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
              className="rounded-full bg-wa-accent px-3 py-1 text-wa-meta font-semibold text-wa-commerce-text"
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
          <div className="border-b border-wa-border bg-wa-composer p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-wa-preview font-semibold text-wa-dark-green dark:text-wa-accent">
                🍲 {chatDict.quickCatalog.title}
              </span>
              <button
                type="button"
                aria-label={chatDict.quickCatalog.closeAria}
                onClick={() => setShowCatalogDrawer(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-wa-text-secondary hover:text-wa-text-primary"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {allProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="flex w-56 shrink-0 items-center gap-2.5 rounded-wa-bubble border border-wa-border bg-wa-panel p-2 shadow-wa-bubble"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-wa-bubble bg-wa-composer">
                    <Image
                      src={prod.imageSrc}
                      alt={prod.name[locale]}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-wa-preview font-medium text-wa-text-primary">
                      {prod.name[locale]}
                    </p>
                    <p className="text-wa-preview font-semibold text-wa-dark-green dark:text-wa-accent">
                      {formatPriceYuan(prod.priceYuan, locale)}
                    </p>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => {
                        void sendProductInquiry(prod.id);
                        setShowCatalogDrawer(false);
                      }}
                      className="mt-1 rounded-full bg-wa-commerce px-2.5 py-0.5 text-wa-meta font-semibold text-wa-commerce-text hover:bg-wa-commerce-hover"
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
            className="pointer-events-none absolute left-1/2 top-16 z-30 -translate-x-1/2 rounded-full bg-wa-composer px-4 py-1.5 text-wa-meta font-semibold text-wa-text-primary shadow-wa-panel"
          >
            ✓ {actionToast}
          </div>
        )}

        {/* 6. Liste des messages */}
        <MessageList
          messages={messages}
          conversation={activeConversation}
          selectedMessage={activeContextMenuMessage}
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
          onOpenContextMenu={(msg) => {
            if (activeContextMenuMessage?.id === msg.id) {
              closeContextMenu();
            } else {
              openContextMenu(msg);
            }
          }}
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

        {/* 7. Barre de saisie (Composer) */}
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

        {/* 8. Modales Transférer, Infos, Supprimer & Vérifier le code de sécurité */}
        <ContextMenu
          message={activeContextMenuMessage}
          forwardingMessage={forwardingMessage}
          infoModalMessage={infoModalMessage}
          deletingMessage={deletingMessage}
          securityCodeModalOpen={securityCodeModalOpen}
          vendorName={
            activeConversation?.vendorName ?? chatDict.header.vendorName
          }
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
          onCloseDeleteModal={() => setDeletingMessage(null)}
          onCloseSecurityCodeModal={() => setSecurityCodeModalOpen(false)}
          onDeleteForMe={(messageId) => void deleteForMe(messageId)}
          onDeleteForEveryone={(messageId) => void deleteForEveryone(messageId)}
        />

        {/* 9. Visionneuse d'images plein écran */}
        {viewerState && (
          <ImageViewer
            images={viewerState.images}
            initialIndex={viewerState.index}
            caption={viewerState.caption}
            dict={chatDict.imageViewer}
            onClose={() => setViewerState(null)}
          />
        )}

        {/* 10. Écran d'appel vocal / vidéo simulé */}
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
