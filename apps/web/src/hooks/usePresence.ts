'use client';

import { useMemo } from 'react';
import type {
  Conversation,
  Locale,
  Presence,
  PresenceStatus,
} from '@attieke-chat/shared';
import { formatTimeShort, type ChatDictionary } from '@/lib/i18n';
import { useChatStore } from '@/store/useChatStore';

export interface UsePresenceResult {
  presence: Presence | null;
  status: PresenceStatus;
  isOnline: boolean;
  isTyping: boolean;
  isRecordingVoice: boolean;
  statusLabel: string;
}

export function usePresence(
  conversation: Conversation | null,
  locale: Locale,
  dict: ChatDictionary['presence']
): UsePresenceResult {
  const presenceMap = useChatStore((s) => s.presenceByConversation);
  const convId = conversation?.id ?? 'conv-main-01';
  const presence = presenceMap[convId] ?? null;

  const status: PresenceStatus =
    presence?.status ??
    conversation?.presenceStatus ??
    (conversation?.vendorOnline ? 'online' : 'offline');

  const isOnline = status !== 'offline';
  const isTyping = status === 'typing';
  const isRecordingVoice = status === 'recording_voice';

  const statusLabel = useMemo(() => {
    if (status === 'typing') {
      return dict.typing;
    }
    if (status === 'recording_voice') {
      return dict.recordingVoice;
    }
    if (status === 'online') {
      return dict.online;
    }
    const lastSeenIso =
      presence?.lastSeenAt ??
      conversation?.lastSeenAt ??
      conversation?.lastMessageAt ??
      '';
    const timeStr = lastSeenIso ? formatTimeShort(lastSeenIso, locale) : '07:45';
    return `${dict.offlineLastSeen} ${timeStr}`;
  }, [
    conversation?.lastMessageAt,
    conversation?.lastSeenAt,
    dict,
    locale,
    presence?.lastSeenAt,
    status,
  ]);

  return {
    presence,
    status,
    isOnline,
    isTyping,
    isRecordingVoice,
    statusLabel,
  };
}
