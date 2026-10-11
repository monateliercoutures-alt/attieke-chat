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
  onSendQuickOrderInquiry,
  onSendQuickDeliveryTracking,
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
    <div className="relative border-t border-brand-ink/10 bg-white">
      {/* 1. Sélecteur d'Emojis & Stickers en popover */}
      {showEmojiPicker && (
        <div className="absolute bottom-full left-3 z-30 mb-2">
          <EmojiPicker
            dict={dict.emojiPicker}
            onSelectEmoji={(emoji) => onDraftChange(`${draftText}${emoji}`)}
            onSendSticker={(stickerText) => {
              void onSendText(stickerText);
            }}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}

      {/* 2. Feuille de pièces jointes (Photo, Caméra, PDF, Position, Contact) */}
      {showAttachmentSheet && (
        <AttachmentSheet
          dict={dict.attachments}
          onPickImages={handlePickFiles}
          onSendDemoMultiGrid={handleSendDemoMultiGrid}
          onSendDocument={(doc) => void onSendDocument(doc)}
          onSendLocation={(loc) => void onSendLocation(loc)}
          onSendContact={(contact) => void onSendContact(contact)}
          onClose={() => setShowAttachmentSheet(false)}
        />
      )}

      {/* 3. Prévisualisation multi-images avec légende avant envoi */}
      {pendingImages.length > 0 && (
        <div className="border-b border-brand-ink/10 bg-brand-cream p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-extrabold text-brand-green">
              🖼️ {dict.composer.imagePreviewTitle} ({pendingImages.length})
            </span>
            <button
              type="button"
              onClick={() => {
                setPendingImages([]);
                setImageCaption('');
              }}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              {dict.composer.cancelImageButton}
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {pendingImages.map((img) => (
              <div
                key={img.id}
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-brand-ink/15 bg-white"
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
              className="min-h-[38px] flex-1 rounded-full border border-brand-ink/15 bg-white px-3.5 text-xs text-brand-ink focus:border-brand-green focus:outline-none"
            />
            <button
              type="button"
              onClick={() => void handleConfirmSendImages()}
              className="rounded-full bg-brand-green px-4 py-2 text-xs font-extrabold text-white hover:bg-brand-green-dark"
            >
              {dict.composer.confirmSendImageButton} ➤
            </button>
          </div>
        </div>
      )}

      {/* 4. Bandeau de citation en cours (ReplyTo) */}
      {replyingTo && (
        <div className="flex items-center justify-between gap-2 border-b border-brand-ink/10 bg-brand-green-soft/60 px-4 py-2">
          <div className="min-w-0 flex-1 border-l-4 border-brand-green pl-2.5 text-xs">
            <p className="font-extrabold text-brand-green">
              {dict.composer.replyingToLabel}{' '}
              {replyingTo.sender === 'customer'
                ? dict.conversationList.youPrefix
                : vendorName}
            </p>
            <p className="truncate text-brand-ink-muted">
              {replyingTo.previewText[locale]}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label={dict.composer.cancelReplyAria}
            className="rounded-full bg-white/80 p-1 text-xs font-bold text-brand-ink-muted hover:text-brand-ink"
          >
            ✕
          </button>
        </div>
      )}

      {/* 5. Raccourcis Commerce Rapides (Sous-phase E) */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-brand-ink/5 bg-brand-cream/55 px-3 py-1.5">
        <button
          type="button"
          onClick={onOpenCatalogDrawer}
          className="shrink-0 rounded-full border border-brand-green/25 bg-white px-3 py-1 text-[11px] font-extrabold text-brand-green shadow-2xs transition-colors hover:bg-brand-green hover:text-white"
        >
          {dict.quickShortcuts.viewProducts}
        </button>

        <button
          type="button"
          onClick={onSendQuickOrderInquiry}
          className="shrink-0 rounded-full border border-brand-green/25 bg-white px-3 py-1 text-[11px] font-extrabold text-brand-green shadow-2xs transition-colors hover:bg-brand-green hover:text-white"
        >
          {dict.quickShortcuts.myOrder}
        </button>

        <button
          type="button"
          onClick={onSendQuickDeliveryTracking}
          className="shrink-0 rounded-full border border-brand-green/25 bg-white px-3 py-1 text-[11px] font-extrabold text-brand-green shadow-2xs transition-colors hover:bg-brand-green hover:text-white"
        >
          {dict.quickShortcuts.trackDelivery}
        </button>

        <button
          type="button"
          onClick={() =>
            void onSendText(
              locale === 'zh'
                ? '测试网络波动发送失败 (点击右侧重试按钮)'
                : locale === 'en'
                ? 'Test failed delivery state (click Retry button)'
                : 'Test message en échec réseau (cliquez sur Renvoyer)',
              undefined,
              true
            )
          }
          className="shrink-0 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-900 transition-colors hover:bg-amber-100"
        >
          {dict.quickShortcuts.simulateFailedMsg}
        </button>
      </div>

      {/* 6. Barre de saisie principale : Emoji + Trombone + Textarea + Micro / Envoyer */}
      <form
        onSubmit={(e) => void handleFormSubmit(e)}
        className="flex items-end gap-2 px-3 py-2.5 sm:px-4"
      >
        <button
          type="button"
          onClick={() => {
            setShowEmojiPicker((v) => !v);
            setShowAttachmentSheet(false);
          }}
          aria-label={dict.composer.emojiButtonAria}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-ink/15 bg-brand-cream text-lg transition-colors hover:bg-brand-green-soft"
        >
          😊
        </button>

        <button
          type="button"
          onClick={() => {
            setShowAttachmentSheet((v) => !v);
            setShowEmojiPicker(false);
          }}
          aria-label={dict.composer.attachButtonAria}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-ink/15 bg-brand-cream text-base transition-colors hover:bg-brand-green-soft"
        >
          📎
        </button>

        <textarea
          rows={1}
          value={draftText}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={dict.composer.inputPlaceholder}
          aria-label={dict.composer.inputPlaceholder}
          className="max-h-28 min-h-[42px] flex-1 resize-none rounded-2xl border border-brand-ink/20 bg-brand-cream px-4 py-2.5 text-sm text-brand-ink placeholder:text-brand-ink-muted focus:border-brand-green focus:bg-white focus:outline-none"
        />

        {draftText.trim().length > 0 ? (
          <button
            type="submit"
            disabled={isBusy}
            aria-label={dict.composer.sendButtonAria}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-full bg-brand-green px-4 text-xs font-extrabold text-white shadow-xs transition-colors hover:bg-brand-green-dark disabled:opacity-40 sm:px-5 sm:text-sm"
          >
            <span>{dict.composer.confirmSendImageButton}</span>
            <span aria-hidden="true">➤</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void startRecording()}
            aria-label={dict.composer.voiceRecordAria}
            title={dict.composer.voiceRecordAria}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green text-base text-white shadow-xs transition-transform hover:scale-105 hover:bg-brand-green-dark"
          >
            🎤
          </button>
        )}
      </form>
    </div>
  );
}
