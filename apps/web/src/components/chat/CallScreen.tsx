'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import type { CallSession } from '@/services';
import type { ChatDictionary } from '@/lib/i18n';

export interface CallScreenProps {
  session: CallSession | null;
  dict: ChatDictionary['callScreen'];
  onAccept: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onToggleCamera: () => void;
}

export function CallScreen({
  session,
  dict,
  onAccept,
  onEnd,
  onToggleMute,
  onToggleSpeaker,
  onToggleCamera,
}: CallScreenProps): React.JSX.Element | null {
  const [durationSec, setDurationSec] = useState<number>(0);

  useEffect(() => {
    if (!session || session.status !== 'connected') {
      setDurationSec(0);
      return;
    }
    const timer = setInterval(() => {
      setDurationSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [session]);

  if (!session) {
    return null;
  }

  const mins = String(Math.floor(durationSec / 60)).padStart(2, '0');
  const secs = String(durationSec % 60).padStart(2, '0');

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-wa-dark-green px-6 py-10 text-white"
    >
      {/* En-tête de l'appel */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-wa-meta font-medium text-white">
          🔒 {dict.simulatedBadge}
        </span>
        <p className="mt-2 text-wa-preview text-white/80">
          {session.type === 'video'
            ? dict.videoCallTitle
            : dict.audioCallTitle}
        </p>
      </div>

      {/* Avatar / Aperçu vidéo simulé + Statut + Chronomètre */}
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          {session.status === 'ringing' && (
            <span
              aria-hidden="true"
              className="absolute -inset-4 animate-ping rounded-full bg-wa-accent/30"
            />
          )}
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-wa-accent shadow-wa-panel sm:h-40 sm:w-40">
            <Image
              src={session.vendorAvatarUrl}
              alt={session.vendorName}
              fill
              sizes="160px"
              className="object-cover"
            />
          </div>
          {session.type === 'video' && session.isCameraOn && (
            <div className="absolute -bottom-3 -right-6 h-20 w-16 overflow-hidden rounded-xl border-2 border-white bg-wa-header shadow-wa-panel">
              <Image
                src="/images/hero/hero-bowl.jpg"
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          )}
        </div>

        <h2 className="mt-6 text-wa-title text-white">{session.vendorName}</h2>

        <p className="mt-1.5 text-wa-preview font-medium text-white/90">
          {session.status === 'ringing'
            ? dict.statusRinging
            : session.status === 'connected'
            ? `${dict.statusConnected} · ${mins}:${secs}`
            : dict.statusEnded}
        </p>
      </div>

      {/* Contrôles d'appel (Muet, Haut-parleur, Caméra, Décrocher / Raccrocher) */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={onToggleMute}
          aria-pressed={session.isMuted}
          className={`flex h-14 w-14 flex-col items-center justify-center rounded-full border transition-colors duration-fast ${
            session.isMuted
              ? 'border-white bg-white text-wa-dark-green'
              : 'border-white/25 bg-white/15 text-white hover:bg-white/25'
          }`}
        >
          <span className="text-wa-contact" aria-hidden="true">
            {session.isMuted ? '🔇' : '🎤'}
          </span>
          <span className="text-wa-meta">
            {session.isMuted ? dict.muteButton : dict.unmuteButton}
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleSpeaker}
          aria-pressed={session.isSpeakerOn}
          className={`flex h-14 w-14 flex-col items-center justify-center rounded-full border transition-colors duration-fast ${
            session.isSpeakerOn
              ? 'border-white bg-white text-wa-dark-green'
              : 'border-white/25 bg-white/15 text-white hover:bg-white/25'
          }`}
        >
          <span className="text-wa-contact" aria-hidden="true">
            🔊
          </span>
          <span className="text-wa-meta">{dict.speakerButton}</span>
        </button>

        {session.type === 'video' && (
          <button
            type="button"
            onClick={onToggleCamera}
            aria-pressed={session.isCameraOn}
            className={`flex h-14 w-14 flex-col items-center justify-center rounded-full border transition-colors duration-fast ${
              session.isCameraOn
                ? 'border-white bg-white text-wa-dark-green'
                : 'border-white/25 bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <span className="text-wa-contact" aria-hidden="true">
              📹
            </span>
            <span className="text-wa-meta">{dict.cameraButton}</span>
          </button>
        )}

        {session.status === 'ringing' && (
          <button
            type="button"
            onClick={onAccept}
            className="flex h-14 items-center gap-2 rounded-full bg-wa-accent px-6 text-wa-preview font-semibold text-white shadow-wa-panel hover:opacity-95"
          >
            <span aria-hidden="true">📞</span>
            <span>{dict.acceptCallButton}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onEnd}
          className="flex h-14 items-center gap-2 rounded-full bg-red-600 px-6 text-wa-preview font-semibold text-white shadow-wa-panel hover:bg-red-700"
        >
          <span aria-hidden="true">☎️</span>
          <span>{dict.hangupButton}</span>
        </button>
      </div>
    </div>
  );
}
