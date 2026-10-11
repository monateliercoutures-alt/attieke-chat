'use client';

import React, { useState } from 'react';
import type {
  ContactAttachment,
  DocumentAttachment,
  ImageAttachmentItem,
  Locale,
  LocationAttachment,
  MessageReplyReference,
  VoiceAttachment,
} from '@attieke-chat/shared';
import type { ChatDictionary } from '@/lib/i18n';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { EmojiPicker } from './EmojiPicker';
import { AttachmentSheet } from './AttachmentSheet';
import { VoiceRecorder } from './VoiceRecorder';

export interface ComposerProps {
  locale: Locale;
  vendorName: string;
  draftText: string;
  replyingTo: MessageReplyReference | null;
  isBusy: boolean;
  dict: ChatDictionary;
  onDraftChange: (text: string) => void;
  onCancelReply: () => void;
  onSendText: (
    text: string,
    replyTo?: MessageReplyReference,
    simulateFailure?: boolean
  ) => Promise<void>;
  onSendImages: (
    images: ImageAttachmentItem[],
    caption: string
  ) => Promise<void>;
  onSendVoice: (voice: VoiceAttachment) => Promise<void>;
  onSendDocument: (doc: DocumentAttachment) => Promise<void>;
  onSendLocation: (loc: LocationAttachment) => Promise<void>;
  onSendContact: (contact: ContactAttachment) => Promise<void>;
  onOpenCatalogDrawer: () => void;
  onSendQuickOrderInquiry: () => void;
  onSendQuickDeliveryTracking: () => void;
}

export function Composer({
  locale,
  vendorName,
  draftText,
  replyingTo,
  isBusy,
  dict,
  onDraftChange,
  onCancelReply,
  onSendText,
  onSendImages,
  onSendVoice,
  onSendDocument,
  onSendLocation,
  onSendContact,
  onOpenCatalogDrawer,
}: ComposerProps): React.JSX.Element {
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showAttachmentSheet, setShowAttachmentSheet] =
    useState<boolean>(false);
  const [pendingImages, setPendingImages] = useState<ImageAttachmentItem[]>([]);
  const [imageCaption, setImageCaption] = useState<string>('');

  const {
    isRecording,
    isLocked,
    usingFallbackMic,
    elapsedSeconds,
    liveWaveform,
    startRecording,
    lockRecording,
    cancelRecording,
    finishAndSendRecording,
  } = useVoiceRecorder({
    onSendVoice: async (voice) => {
      await onSendVoice(voice);
    },
  });

  const handleFormSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const trimmed = draftText.trim();
    if (!trimmed || isBusy) {
      return;
    }
    const currentReply = replyingTo ?? undefined;
    onDraftChange('');
    onCancelReply();
    setShowEmojiPicker(false);
    setShowAttachmentSheet(false);
    await onSendText(trimmed, currentReply, false);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleFormSubmit(e);
    }
  };

  const handleBackspace = (): void => {
    if (!draftText) {
      return;
    }
    const chars = Array.from(draftText);
    chars.pop();
    onDraftChange(chars.join(''));
  };

  const handlePickFiles = (files: FileList): void => {
    const readPromises: Promise<ImageAttachmentItem>[] = [];
    for (let i = 0; i < Math.min(files.length, 4); i += 1) {
      const file = files[i];
      readPromises.push(
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl =
              typeof reader.result === 'string'
                ? reader.result
                : '/images/products/attieke-pack-1.jpg';
            resolve({
              id: `img-upload-${Date.now()}-${i}`,
              url: dataUrl,
              thumbnailUrl: dataUrl,
              width: 800,
              height: 600,
            });
          };
          reader.readAsDataURL(file);
        })
      );
    }
    void Promise.all(readPromises).then((items) => {
      setPendingImages(items);
    });
  };

  const handleSendDemoMultiGrid = (): void => {
    setPendingImages([
      {
        id: `demo-grid-1-${Date.now()}`,
        url: '/images/products/attieke-pack-1.jpg',
        thumbnailUrl: '/images/products/attieke-pack-1.jpg',
      },
      {
        id: `demo-grid-2-${Date.now()}`,
        url: '/images/products/attieke-fish.jpg',
        thumbnailUrl: '/images/products/attieke-fish.jpg',
      },
      {
        id: `demo-grid-3-${Date.now()}`,
        url: '/images/products/attieke-piment.jpg',
        thumbnailUrl: '/images/products/attieke-piment.jpg',
      },
    ]);
  };

  const handleConfirmSendImages = async (): Promise<void> => {
    if (pendingImages.length === 0) {
      return;
    }
    const toSend = [...pendingImages];
    const cap = imageCaption.trim();
    setPendingImages([]);
    setImageCaption('');
    await onSendImages(toSend, cap);
  };

  if (isRecording) {
    return (
      <VoiceRecorder
        isLocked={isLocked}
        usingFallbackMic={usingFallbackMic}
        elapsedSeconds={elapsedSeconds}
        liveWaveform={liveWaveform}
        dict={dict.voiceRecorder}
        onLock={lockRecording}
        onCancel={cancelRecording}
        onSend={() => void finishAndSendRecording()}
      />
    );
  }

  return (
    <div className="relative bg-wa-chat-bg">
      {/* 1. Prévisualisation multi-images avec légende avant envoi */}
      {pendingImages.length > 0 && (
        <div className="border-t border-wa-border bg-wa-panel p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-wa-preview font-semibold text-wa-accent">
              🖼️ {dict.composer.imagePreviewTitle} ({pendingImages.length})
            </span>
            <button
              type="button"
              onClick={() => {
                setPendingImages([]);
                setImageCaption('');
              }}
              className="text-wa-meta font-semibold text-red-500 hover:underline"
            >
              {dict.composer.cancelImageButton}
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {pendingImages.map((img) => (
              <div
                key={img.id}
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-wa-bubble border border-wa-border bg-wa-composer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
              placeholder={dict.composer.imageCaptionPlaceholder}
              className="min-h-[40px] flex-1 rounded-full border border-wa-border bg-wa-composer px-4 text-wa-msg text-wa-text-primary focus:outline-none focus:ring-2 focus:ring-wa-accent"
            />
            <button
              type="button"
              onClick={() => void handleConfirmSendImages()}
              className="min-h-[40px] rounded-full bg-wa-accent px-4 py-1.5 text-wa-preview font-semibold text-wa-commerce-text hover:opacity-95"
            >
              {dict.composer.confirmSendImageButton}
            </button>
          </div>
        </div>
      )}

      {/* 2. Bandeau de citation en cours (ReplyTo) */}
      {replyingTo && (
        <div className="flex items-center justify-between gap-2 border-t border-wa-border bg-wa-panel px-4 py-2">
          <div className="min-w-0 flex-1 rounded-r-wa-bubble border-l-4 border-wa-accent bg-wa-composer px-3 py-1.5 text-wa-meta">
            <p className="font-semibold text-wa-accent">
              {dict.composer.replyingToLabel}{' '}
              {replyingTo.sender === 'customer'
                ? dict.conversationList.youPrefix
                : vendorName}
            </p>
            <p className="truncate text-wa-preview text-wa-text-secondary">
              {replyingTo.previewText[locale]}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label={dict.composer.cancelReplyAria}
            className="flex h-8 w-8 items-center justify-center rounded-full text-wa-text-secondary hover:text-wa-text-primary"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Barre de saisie :
          - Sur Mobile (< 768 px) : [Sticker/Clavier + "Message" + Trombone + Caméra] + Bouton rond vert 48 px Micro/Envoyer à droite
          - Sur Ordinateur (Desktop >= 768 px, comme sur image-1.png) : Pilule flottante blanche/panel [Trombone 📎 + Sticker 😊 + "Entrez un message" + Micro 🎤 / Envoyer ➤] */}
      <form
        onSubmit={(e) => void handleFormSubmit(e)}
        className="flex items-end gap-2 px-2.5 py-2 sm:px-3.5 md:px-4 md:pb-3 md:pt-1.5"
      >
        {/* Pilule principale */}
        <div className="flex min-h-[48px] flex-1 items-center gap-1 rounded-full bg-wa-composer px-2.5 py-1 shadow-wa-bubble md:border md:border-wa-border md:bg-wa-panel md:px-3.5">
          {/* Bouton Trombone 📎 à gauche sur Ordinateur (exactement comme sur image-1.png Desktop) */}
          <button
            type="button"
            onClick={() => {
              setShowAttachmentSheet((v) => !v);
              setShowEmojiPicker(false);
            }}
            aria-label={dict.composer.attachButtonAria}
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-wa-text-primary transition-colors duration-fast hover:bg-wa-composer focus:outline-none md:inline-flex"
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
                d="M16 6v10a4 4 0 0 1-8 0V5a2.5 2.5 0 0 1 5 0v9a1 1 0 0 1-2 0V6"
              />
            </svg>
          </button>

          {/* Bouton Sticker/Emoji 😊 (ou Clavier ⌨️ quand le tiroir est ouvert) */}
          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker((v) => !v);
              setShowAttachmentSheet(false);
            }}
            aria-label={dict.composer.emojiButtonAria}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-wa-text-secondary transition-colors duration-fast hover:text-wa-text-primary md:text-wa-text-primary md:hover:bg-wa-composer focus:outline-none"
          >
            {showEmojiPicker ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path
                  strokeLinecap="round"
                  d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 15h8"
                />
              </svg>
            ) : (
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
                  d="M12 21a9 9 0 1 1 9-9c0 1.5-.4 2.9-1.1 4.1L15 21h-3Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 21v-4a2 2 0 0 1 2-2h4"
                />
                <circle cx="9" cy="10" r="1" fill="currentColor" />
                <circle cx="15" cy="10" r="1" fill="currentColor" />
                <path
                  strokeLinecap="round"
                  d="M9 14c.8 1 2 1.5 3 1.5s2.2-.5 3-1.5"
                />
              </svg>
            )}
          </button>

          {/* Champ de saisie ("Entrez un message" sur ordinateur, "Message" sur mobile) */}
          <textarea
            rows={1}
            value={draftText}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              locale === 'fr' ? 'Entrez un message' : dict.composer.inputPlaceholder
            }
            aria-label={dict.composer.inputPlaceholder}
            className="max-h-28 min-h-[28px] flex-1 resize-none bg-transparent px-2 py-1 text-wa-contact font-normal text-wa-text-primary caret-wa-accent placeholder:text-wa-text-secondary focus:outline-none"
          />

          {/* Icône Trombone verticale (📎) à droite dans la pilule sur Mobile uniquement */}
          <button
            type="button"
            onClick={() => {
              setShowAttachmentSheet((v) => !v);
              setShowEmojiPicker(false);
            }}
            aria-label={dict.composer.attachButtonAria}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-wa-text-secondary transition-colors duration-fast hover:text-wa-text-primary focus:outline-none md:hidden"
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
                d="M16 6v10a4 4 0 0 1-8 0V5a2.5 2.5 0 0 1 5 0v9a1 1 0 0 1-2 0V6"
              />
            </svg>
          </button>

          {/* Icône Appareil photo (📷) à droite dans la pilule sur Mobile */}
          <button
            type="button"
            onClick={() => {
              handleSendDemoMultiGrid();
              setShowAttachmentSheet(false);
              setShowEmojiPicker(false);
            }}
            aria-label={dict.attachments.cameraPhoto}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-wa-text-secondary transition-colors duration-fast hover:text-wa-text-primary focus:outline-none md:hidden"
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
                d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
              />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>

          {/* Bouton Micro 🎤 / Envoyer ➤ intégré à droite de la pilule sur Ordinateur (comme sur image-1.png Desktop) */}
          {draftText.trim().length > 0 ? (
            <button
              type="submit"
              disabled={isBusy}
              aria-label={dict.composer.sendButtonAria}
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wa-accent text-white transition-transform duration-fast hover:opacity-95 active:scale-95 disabled:opacity-40 md:inline-flex"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 translate-x-0.5"
                aria-hidden="true"
              >
                <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void startRecording()}
              aria-label={dict.composer.voiceRecordAria}
              title={dict.composer.voiceRecordAria}
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-wa-text-primary transition-colors duration-fast hover:bg-wa-composer md:inline-flex"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <rect x="9" y="2" width="6" height="11" rx="3" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3m-4 0h8"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Bouton rond vert 48 px (#25D366) extérieur à droite sur Mobile (< 768 px) */}
        {draftText.trim().length > 0 ? (
          <button
            type="submit"
            disabled={isBusy}
            aria-label={dict.composer.sendButtonAria}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-wa-accent text-wa-commerce-text shadow-wa-bubble transition-transform duration-fast hover:opacity-95 active:scale-95 disabled:opacity-40 md:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 translate-x-0.5"
              aria-hidden="true"
            >
              <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void startRecording()}
            aria-label={dict.composer.voiceRecordAria}
            title={dict.composer.voiceRecordAria}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-wa-accent text-wa-commerce-text shadow-wa-bubble transition-transform duration-fast hover:opacity-95 active:scale-95 md:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z" />
            </svg>
          </button>
        )}
      </form>

      {/* 4. Tiroir de pièces jointes (Galerie, Caméra, Localisation, Contact, Document, Sondage, Événement, Images d'IA) SOUS la barre de saisie */}
      {showAttachmentSheet && (
        <AttachmentSheet
          locale={locale}
          dict={dict.attachments}
          onPickImages={handlePickFiles}
          onSendDemoMultiGrid={handleSendDemoMultiGrid}
          onSendDocument={(doc) => void onSendDocument(doc)}
          onSendLocation={(loc) => void onSendLocation(loc)}
          onSendContact={(contact) => void onSendContact(contact)}
          onSendQuickText={(txt) => void onSendText(txt)}
          onOpenCatalogDrawer={onOpenCatalogDrawer}
          onClose={() => setShowAttachmentSheet(false)}
        />
      )}

      {/* 5. Tiroir Clavier Emojis / GIF / Stickers SOUS la barre de saisie (comme sur image-2.png) */}
      {showEmojiPicker && (
        <EmojiPicker
          dict={dict.emojiPicker}
          onSelectEmoji={(emoji) => onDraftChange(`${draftText}${emoji}`)}
          onBackspace={handleBackspace}
          onSendSticker={(stickerText) => {
            void onSendText(stickerText);
          }}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
}
