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
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-brand-green-dark via-brand-green to-brand-ink px-6 py-10 text-white"
    >
      {/* En-tête de l'appel */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-bold text-brand-gold">
          🔒 {dict.simulatedBadge}
        </span>
        <p className="mt-2 text-xs font-semibold text-white/80">
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
              className="absolute -inset-4 animate-ping rounded-full bg-brand-gold/30"
            />
          )}
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-brand-gold shadow-2xl sm:h-40 sm:w-40">
            <Image
              src={session.vendorAvatarUrl}
              alt={session.vendorName}
              fill
              sizes="160px"
              className="object-cover"
            />
          </div>
          {session.type === 'video' && session.isCameraOn && (
            <div className="absolute -bottom-3 -right-6 h-20 w-16 overflow-hidden rounded-2xl border-2 border-white bg-brand-ink shadow-lg">
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

        <h2 className="mt-6 text-xl font-extrabold sm:text-2xl">
          {session.vendorName}
        </h2>

        <p className="mt-1.5 text-sm font-bold text-emerald-300">
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
          className={`flex h-14 w-14 flex-col items-center justify-center rounded-full border transition-colors ${
            session.isMuted
              ? 'border-brand-gold bg-brand-gold text-brand-ink'
              : 'border-white/25 bg-white/15 text-white hover:bg-white/25'
          }`}
        >
          <span className="text-lg" aria-hidden="true">
            {session.isMuted ? '🔇' : '🎤'}
          </span>
          <span className="text-[9px] font-bold">
            {session.isMuted ? dict.muteButton : dict.unmuteButton}
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleSpeaker}
          aria-pressed={session.isSpeakerOn}
          className={`flex h-14 w-14 flex-col items-center justify-center rounded-full border transition-colors ${
            session.isSpeakerOn
              ? 'border-brand-gold bg-brand-gold text-brand-ink'
              : 'border-white/25 bg-white/15 text-white hover:bg-white/25'
          }`}
        >
          <span className="text-lg" aria-hidden="true">
            🔊
          </span>
          <span className="text-[9px] font-bold">{dict.speakerButton}</span>
        </button>

        {session.type === 'video' && (
          <button
            type="button"
            onClick={onToggleCamera}
            aria-pressed={session.isCameraOn}
            className={`flex h-14 w-14 flex-col items-center justify-center rounded-full border transition-colors ${
              session.isCameraOn
                ? 'border-brand-gold bg-brand-gold text-brand-ink'
                : 'border-white/25 bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <span className="text-lg" aria-hidden="true">
              📹
            </span>
            <span className="text-[9px] font-bold">{dict.cameraButton}</span>
          </button>
        )}

        {session.status === 'ringing' && (
          <button
            type="button"
            onClick={onAccept}
            className="flex h-14 items-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-extrabold text-brand-ink shadow-lg hover:brightness-105"
          >
            <span aria-hidden="true">📞</span>
            <span>{dict.acceptCallButton}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onEnd}
          className="flex h-14 items-center gap-2 rounded-full bg-red-600 px-6 text-sm font-extrabold text-white shadow-lg hover:bg-red-700"
        >
          <span aria-hidden="true">☎️</span>
          <span>{dict.hangupButton}</span>
        </button>
      </div>
    </div>
  );
}
