'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { VoiceAttachment } from '@attieke-chat/shared';

export interface UseVoiceRecorderOptions {
  onSendVoice: (voice: VoiceAttachment) => Promise<void>;
}

export interface UseVoiceRecorderResult {
  isRecording: boolean;
  isLocked: boolean;
  usingFallbackMic: boolean;
  elapsedSeconds: number;
  liveWaveform: number[];
  startRecording: () => Promise<void>;
  lockRecording: () => void;
  cancelRecording: () => void;
  finishAndSendRecording: () => Promise<void>;
}

export function useVoiceRecorder({
  onSendVoice,
}: UseVoiceRecorderOptions): UseVoiceRecorderResult {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [usingFallbackMic, setUsingFallbackMic] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [liveWaveform, setLiveWaveform] = useState<number[]>([
    25, 48, 65, 42, 78, 55, 34, 62, 85, 50, 38, 70,
  ]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<number>(0);
  const waveformHistoryRef = useRef<number[]>([]);

  const cleanupStreams = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop();
        recorder.stream.getTracks().forEach((track) => track.stop());
      } catch {
        // Ignore stream cleanup errors
      }
    }
    mediaRecorderRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      cleanupStreams();
    };
  }, [cleanupStreams]);

  const startTimerAndWaveform = useCallback(() => {
    elapsedRef.current = 0;
    setElapsedSeconds(0);
    waveformHistoryRef.current = [30, 52, 68, 45, 76, 60, 40, 82];

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsedSeconds(elapsedRef.current);

      const nextBar = Math.floor(22 + Math.random() * 72);
      waveformHistoryRef.current = [
        ...waveformHistoryRef.current.slice(-23),
        nextBar,
      ];
      setLiveWaveform([...waveformHistoryRef.current]);
    }, 1000);
  }, []);

  const startRecording = useCallback(async () => {
    if (isRecording) {
      return;
    }
    setIsRecording(true);
    setIsLocked(false);
    chunksRef.current = [];
    startTimerAndWaveform();

    if (
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof window !== 'undefined' &&
      'MediaRecorder' in window
    ) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (evt) => {
          if (evt.data && evt.data.size > 0) {
            chunksRef.current.push(evt.data);
          }
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
        setUsingFallbackMic(false);
        return;
      } catch {
        // Repli propre si le micro est refusé ou bloqué par l'iframe
        setUsingFallbackMic(true);
      }
    } else {
      setUsingFallbackMic(true);
    }
  }, [isRecording, startTimerAndWaveform]);

  const lockRecording = useCallback(() => {
    if (isRecording) {
      setIsLocked(true);
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    cleanupStreams();
    chunksRef.current = [];
    setIsRecording(false);
    setIsLocked(false);
    setElapsedSeconds(0);
  }, [cleanupStreams]);

  const finishAndSendRecording = useCallback(async () => {
    if (!isRecording) {
      return;
    }
    const durationSec = Math.max(2, elapsedRef.current || 3);
    const recordedWave =
      waveformHistoryRef.current.length >= 8
        ? [...waveformHistoryRef.current]
        : [28, 52, 74, 60, 42, 80, 90, 56, 44, 68, 75, 48];

    cleanupStreams();
    setIsRecording(false);
    setIsLocked(false);
    setElapsedSeconds(0);

    let audioUrl = `mock-voice://recorded-${Date.now()}`;
    if (chunksRef.current.length > 0 && typeof URL !== 'undefined') {
      try {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        audioUrl = URL.createObjectURL(blob);
      } catch {
        // Keep mock-voice URL on fallback
      }
    }

    const attachment: VoiceAttachment = {
      id: `voice-${Date.now()}`,
      url: audioUrl,
      durationSec,
      waveform: recordedWave,
      mimeType: 'audio/webm',
    };

    await onSendVoice(attachment);
  }, [cleanupStreams, isRecording, onSendVoice]);

  return {
    isRecording,
    isLocked,
    usingFallbackMic,
    elapsedSeconds,
    liveWaveform,
    startRecording,
    lockRecording,
    cancelRecording,
    finishAndSendRecording,
  };
}
