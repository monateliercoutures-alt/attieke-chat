'use client';

import { useCallback, useState } from 'react';
import type {
  Locale,
  LocalizedText,
  Message,
  MessageReplyReference,
} from '@attieke-chat/shared';
import { chatService } from '@/services';
import { useChatStore } from '@/store/useChatStore';

export interface UseMessageActionsOptions {
  locale: Locale;
  activeConversationId: string;
  onJumpToMessage?: (messageId: string) => void;
}

export interface UseMessageActionsResult {
  activeContextMenuMessage: Message | null;
  forwardingMessage: Message | null;
  infoModalMessage: Message | null;
  replyingTo: MessageReplyReference | null;
  highlightedMessageId: string | null;
  actionToast: string | null;
  openContextMenu: (message: Message) => void;
  closeContextMenu: () => void;
  startReplyTo: (message: Message) => void;
  cancelReplyTo: () => void;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
  toggleStar: (messageId: string) => Promise<void>;
  copyMessageText: (message: Message, toastLabel: string) => Promise<void>;
  openForwardModal: (message: Message) => void;
  closeForwardModal: () => void;
  confirmForward: (
    targetConversationId: string,
    toastLabel: string
  ) => Promise<void>;
  openInfoModal: (message: Message) => void;
  closeInfoModal: () => void;
  deleteForMe: (messageId: string) => Promise<void>;
  deleteForEveryone: (messageId: string) => Promise<void>;
  retryFailedMessage: (messageId: string) => Promise<void>;
  jumpToMessage: (messageId: string) => void;
}

function buildReplyPreviewText(message: Message): LocalizedText {
  if (message.text) {
    return message.text;
  }
  if (message.imageCaption) {
    return message.imageCaption;
  }
  if (message.type === 'image') {
    return {
      zh: '📷 图片',
      fr: '📷 Photo',
      en: '📷 Photo',
    };
  }
  if (message.type === 'voice') {
    const sec = message.voice?.durationSec ?? 12;
    return {
      zh: `🎤 语音消息 (0:${String(sec).padStart(2, '0')})`,
      fr: `🎤 Message vocal (0:${String(sec).padStart(2, '0')})`,
      en: `🎤 Voice message (0:${String(sec).padStart(2, '0')})`,
    };
  }
  if (message.type === 'document') {
    const name = message.document?.fileName ?? 'Document.pdf';
    return {
      zh: `📄 ${name}`,
      fr: `📄 ${name}`,
      en: `📄 ${name}`,
    };
  }
  if (message.type === 'location' && message.location) {
    return message.location.title;
  }
  if (message.type === 'contact' && message.contact) {
    return {
      zh: `👤 ${message.contact.name}`,
      fr: `👤 ${message.contact.name}`,
      en: `👤 ${message.contact.name}`,
    };
  }
  return {
    zh: '🛒 卡片消息',
    fr: '🛒 Carte interactive',
    en: '🛒 Interactive card',
  };
}

export function useMessageActions({
  locale,
  activeConversationId,
  onJumpToMessage,
}: UseMessageActionsOptions): UseMessageActionsResult {
  const replyingToMap = useChatStore((s) => s.replyingToByConversation);
  const setReplyingTo = useChatStore((s) => s.setReplyingTo);

  const [activeContextMenuMessage, setActiveContextMenuMessage] =
    useState<Message | null>(null);
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(
    null
  );
  const [infoModalMessage, setInfoModalMessage] = useState<Message | null>(
    null
  );
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const replyingTo = replyingToMap[activeConversationId] ?? null;

  const showToast = useCallback((label: string) => {
    setActionToast(label);
    setTimeout(() => {
      setActionToast((prev) => (prev === label ? null : prev));
    }, 2200);
  }, []);

  const openContextMenu = useCallback((message: Message) => {
    setActiveContextMenuMessage(message);
  }, []);

  const closeContextMenu = useCallback(() => {
    setActiveContextMenuMessage(null);
  }, []);

  const startReplyTo = useCallback(
    (message: Message) => {
      const ref: MessageReplyReference = {
        messageId: message.id,
        sender: message.sender,
        type: message.type,
        previewText: buildReplyPreviewText(message),
        thumbnailUrl:
          message.imageUrl ?? message.images?.[0]?.thumbnailUrl ?? undefined,
      };
      setReplyingTo(activeConversationId, ref);
      setActiveContextMenuMessage(null);
    },
    [activeConversationId, setReplyingTo]
  );

  const cancelReplyTo = useCallback(() => {
    setReplyingTo(activeConversationId, null);
  }, [activeConversationId, setReplyingTo]);

  const toggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      await chatService.toggleReaction(messageId, emoji, 'customer');
      setActiveContextMenuMessage(null);
    },
    []
  );

  const toggleStar = useCallback(async (messageId: string) => {
    await chatService.toggleStarMessage(messageId);
    setActiveContextMenuMessage(null);
  }, []);

  const copyMessageText = useCallback(
    async (message: Message, toastLabel: string) => {
      const textToCopy =
        message.text?.[locale] ??
        message.imageCaption?.[locale] ??
        message.document?.fileName ??
        message.location?.address[locale] ??
        message.contact?.phone ??
        '';

      if (typeof navigator !== 'undefined' && navigator.clipboard && textToCopy) {
        try {
          await navigator.clipboard.writeText(textToCopy);
        } catch {
          // Ignore clipboard write restrictions in sandboxed iframes
        }
      }
      setActiveContextMenuMessage(null);
      showToast(toastLabel);
    },
    [locale, showToast]
  );

  const openForwardModal = useCallback((message: Message) => {
    setForwardingMessage(message);
    setActiveContextMenuMessage(null);
  }, []);

  const closeForwardModal = useCallback(() => {
    setForwardingMessage(null);
  }, []);

  const confirmForward = useCallback(
    async (targetConversationId: string, toastLabel: string) => {
      if (!forwardingMessage) {
        return;
      }
      await chatService.forwardMessage(
        forwardingMessage.id,
        targetConversationId,
        locale
      );
      setForwardingMessage(null);
      showToast(toastLabel);
    },
    [forwardingMessage, locale, showToast]
  );

  const openInfoModal = useCallback((message: Message) => {
    setInfoModalMessage(message);
    setActiveContextMenuMessage(null);
  }, []);

  const closeInfoModal = useCallback(() => {
    setInfoModalMessage(null);
  }, []);

  const deleteForMe = useCallback(async (messageId: string) => {
    await chatService.deleteMessage(messageId, 'me');
    setActiveContextMenuMessage(null);
  }, []);

  const deleteForEveryone = useCallback(async (messageId: string) => {
    await chatService.deleteMessage(messageId, 'everyone');
    setActiveContextMenuMessage(null);
  }, []);

  const retryFailedMessage = useCallback(
    async (messageId: string) => {
      await chatService.retryMessage(messageId, locale);
    },
    [locale]
  );

  const jumpToMessage = useCallback(
    (messageId: string) => {
      setHighlightedMessageId(messageId);
      if (onJumpToMessage) {
        onJumpToMessage(messageId);
      }
      setTimeout(() => {
        setHighlightedMessageId((prev) => (prev === messageId ? null : prev));
      }, 2200);
    },
    [onJumpToMessage]
  );

  return {
    activeContextMenuMessage,
    forwardingMessage,
    infoModalMessage,
    replyingTo,
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
  };
}
