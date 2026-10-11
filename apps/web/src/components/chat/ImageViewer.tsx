'use client';

import React, { useEffect, useState } from 'react';
import type { ImageAttachmentItem } from '@attieke-chat/shared';
import type { ChatDictionary } from '@/lib/i18n';

export interface ImageViewerProps {
  images: ImageAttachmentItem[];
  initialIndex: number;
  caption?: string;
  dict: ChatDictionary['imageViewer'];
  onClose: () => void;
}

export function ImageViewer({
  images,
  initialIndex,
  caption,
  dict,
  onClose,
}: ImageViewerProps): React.JSX.Element | null {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [zoom, setZoom] = useState<number>(1);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
  }, [initialIndex, images]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
        setZoom(1);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
        setZoom(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  if (images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex] ?? images[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col bg-black/92 text-white backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Barre supérieure : Compteur + Zoom + Fermer */}
      <div
        className="flex items-center justify-between px-4 py-3 sm:px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-wa-preview font-semibold">
          {dict.imageCounter} {currentIndex + 1} / {images.length}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
            aria-label={dict.zoomOutAria}
            className="rounded-full bg-white/15 px-3 py-1 text-wa-preview font-semibold hover:bg-white/25"
          >
            −
          </button>
          <span className="min-w-[40px] text-center text-wa-meta font-semibold">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(3, z + 0.5))}
            aria-label={dict.zoomInAria}
            className="rounded-full bg-white/15 px-3 py-1 text-wa-preview font-semibold hover:bg-white/25"
          >
            +
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.closeAria}
            className="ml-2 rounded-full bg-white/20 px-3 py-1 text-wa-preview font-semibold hover:bg-white/30"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Image centrale avec zoom et boutons précédent / suivant */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 && (
          <button
            type="button"
            onClick={() => {
              setCurrentIndex((prev) =>
                prev > 0 ? prev - 1 : images.length - 1
              );
              setZoom(1);
            }}
            aria-label={dict.prevImageAria}
            className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-wa-title font-semibold text-white hover:bg-white/30"
          >
            ‹
          </button>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImage.url}
          alt={caption ?? dict.imageCounter}
          onDoubleClick={() => setZoom((z) => (z === 1 ? 2 : 1))}
          style={{ transform: `scale(${zoom})` }}
          className="max-h-[75vh] max-w-[88vw] rounded-xl object-contain transition-transform duration-normal cursor-zoom-in"
        />

        {images.length > 1 && (
          <button
            type="button"
            onClick={() => {
              setCurrentIndex((prev) =>
                prev < images.length - 1 ? prev + 1 : 0
              );
              setZoom(1);
            }}
            aria-label={dict.nextImageAria}
            className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-wa-title font-semibold text-white hover:bg-white/30"
          >
            ›
          </button>
        )}
      </div>

      {/* Légende + Miniatures */}
      <div
        className="flex flex-col items-center gap-2 px-4 pb-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {caption && (
          <p className="max-w-xl text-wa-msg text-white/90">{caption}</p>
        )}
        {images.length > 1 && (
          <div className="flex items-center gap-2 pt-1">
            {images.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  setZoom(1);
                }}
                className={`h-12 w-12 overflow-hidden rounded-wa-bubble border-2 transition-all duration-fast ${
                  idx === currentIndex
                    ? 'border-wa-accent scale-105'
                    : 'border-white/25 opacity-60 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.thumbnailUrl ?? img.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
