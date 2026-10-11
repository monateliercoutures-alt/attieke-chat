'use client';

import React, { useRef } from 'react';
import type { ChatDictionary } from '@/lib/i18n';

export interface VoiceRecorderProps {
  isLocked: boolean;
  usingFallbackMic: boolean;
  elapsedSeconds: number;
  liveWaveform: number[];
  dict: ChatDictionary['voiceRecorder'];
  onLock: () => void;
  onCancel: () => void;
  onSend: () => void;
}

export function VoiceRecorder({
  isLocked,
  usingFallbackMic,
  elapsedSeconds,
  liveWaveform,
  dict,
  onLock,
  onCancel,
  onSend,
}: VoiceRecorderProps): React.JSX.Element {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const mins = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const secs = String(elapsedSeconds % 60).padStart(2, '0');

  const handleTouchStart = (e: React.TouchEvent): void => {
    const t = e.touches[0];
    if (t) {
      touchStartRef.current = { x: t.clientX, y: t.clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent): void => {
    const start = touchStartRef.current;
    const t = e.touches[0];
    if (!start || !t) {
      return;
    }
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;

    // Glisser vers la gauche -> Annuler
    if (dx < -70) {
      touchStartRef.current = null;
      onCancel();
      return;
    }
    // Glisser vers le haut -> Verrouiller
    if (dy < -50 && !isLocked) {
      touchStartRef.current = null;
      onLock();
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className="flex flex-col gap-1.5 border-t border-brand-ink/10 bg-white px-3.5 py-2.5 shadow-sm"
    >
      {usingFallbackMic && (
        <p className="text-[10px] font-semibold text-brand-green">
          🎤 {dict.micFallbackNotice}
        </p>
      )}

      <div className="flex items-center justify-between gap-2.5">
        {/* Point rouge + Chronomètre */}
        <div className="flex shrink-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="h-3 w-3 animate-pulse rounded-full bg-red-600"
          />
          <span className="font-mono text-xs font-extrabold text-brand-ink">
            {mins}:{secs}
          </span>
        </div>

        {/* Forme d'onde animée en direct */}
        <div
          aria-hidden="true"
          className="flex h-7 flex-1 items-center justify-center gap-1 overflow-hidden px-2"
        >
          {liveWaveform.map((bar, idx) => (
            <span
              key={idx}
              style={{ height: `${Math.max(18, bar)}%` }}
              className="w-1 rounded-full bg-brand-green transition-all duration-150"
            />
          ))}
        </div>

        {/* Boutons Annuler / Verrouiller / Envoyer */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-extrabold text-red-700 hover:bg-red-100"
          >
            🗑️ {dict.cancelButton}
          </button>

          {!isLocked && (
            <button
              type="button"
              onClick={onLock}
              className="rounded-full border border-brand-ink/15 bg-brand-cream px-3 py-1.5 text-xs font-bold text-brand-ink hover:bg-brand-green-soft"
            >
              🔒 {dict.lockButton}
            </button>
          )}

          <button
            type="button"
            onClick={onSend}
            className="inline-flex items-center gap-1 rounded-full bg-brand-green px-4 py-1.5 text-xs font-extrabold text-white shadow-xs hover:bg-brand-green-dark"
          >
            <span>{dict.sendVoiceButton}</span>
            <span aria-hidden="true">➤</span>
          </button>
        </div>
      </div>

      {!isLocked && (
        <div className="flex items-center justify-between text-[10px] font-medium text-brand-ink-muted">
          <span>{dict.slideToCancelHint}</span>
          <span>{dict.lockHint}</span>
        </div>
      )}
    </div>
  );
}
