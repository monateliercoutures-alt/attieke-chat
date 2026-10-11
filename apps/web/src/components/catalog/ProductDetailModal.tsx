'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Locale, Product } from '@attieke-chat/shared';
import type { CatalogDictionary } from '@/lib/i18n';
import { formatPriceYuan } from '@/lib/i18n';

interface ProductDetailModalProps {
  product: Product | null;
  locale: Locale;
  dict: CatalogDictionary['detailModal'];
  cardDict: CatalogDictionary['card'];
  onClose: () => void;
}

export function ProductDetailModal({
  product,
  locale,
  dict,
  cardDict,
  onClose,
}: ProductDetailModalProps): React.JSX.Element | null {
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    setQuantity(1);
  }, [product?.id]);

  useEffect(() => {
    if (!product) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) {
    return null;
  }

  const name = product.name[locale];
  const fullDesc = product.fullDescription[locale];
  const formatLabel = product.formatLabel[locale];
  const prepTips = product.preparationTips[locale];
  const totalPrice = formatPriceYuan(product.priceYuan * quantity, locale);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-brand-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-[2rem] bg-brand-cream-card p-5 shadow-2xl sm:rounded-[2rem] sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton Fermer */}
        <button
          type="button"
          onClick={onClose}
          aria-label={dict.closeAria}
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-ink/15 bg-white text-sm font-extrabold text-brand-ink shadow-sm hover:bg-brand-cream"
        >
          ✕
        </button>

        {/* Image HD du produit */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-brand-cream-subtle">
          <Image
            src={product.imageSrc}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, 560px"
            className="object-cover"
          />
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-brand-ink/85 px-3 py-1 text-xs font-bold text-[#25D366]">
            ● {cardDict.inStock}
          </span>
        </div>

        {/* Titre & Prix */}
        <div className="mt-5">
          <div className="flex items-start justify-between gap-3">
            <h2
              id="product-modal-title"
              className="text-xl font-extrabold text-brand-ink sm:text-2xl"
            >
              {name}
            </h2>
            <span className="shrink-0 text-2xl font-extrabold text-brand-green">
              {totalPrice}
            </span>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-brand-ink-muted">
            {fullDesc}
          </p>

          {/* Caractéristiques : Format & Poids */}
          <dl className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-brand-ink/10 bg-brand-cream p-3.5 text-xs">
            <div>
              <dt className="font-semibold text-brand-ink-muted">
                {dict.formatLabel}
              </dt>
              <dd className="mt-0.5 font-extrabold text-brand-ink">
                {formatLabel}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-brand-ink-muted">
                {dict.weightLabel}
              </dt>
              <dd className="mt-0.5 font-extrabold text-brand-ink">
                {product.weightKg} {cardDict.weightUnit}
              </dd>
            </div>
          </dl>

          {/* Conseils de préparation */}
          <div className="mt-4 rounded-2xl bg-brand-green-soft/60 p-3.5 text-xs">
            <p className="font-extrabold text-brand-green">
              🍳 {dict.prepTipsTitle}
            </p>
            <p className="mt-1 leading-relaxed text-brand-ink">{prepTips}</p>
          </div>

          {/* Sélecteur de quantité */}
          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm font-bold text-brand-ink">
              {dict.quantityLabel}
            </span>
            <div className="inline-flex items-center gap-3 rounded-full border border-brand-ink/15 bg-brand-cream px-3 py-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-base font-extrabold text-brand-ink shadow-sm"
                aria-label="-"
              >
                −
              </button>
              <span className="min-w-[24px] text-center text-sm font-extrabold">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-base font-extrabold text-brand-ink shadow-sm"
                aria-label="+"
              >
                +
              </button>
            </div>
          </div>

          {/* Bouton principal : Commander par chat */}
          <div className="mt-6">
            <Link
              href={`/${locale}/chat?product=${encodeURIComponent(product.slug)}`}
              onClick={onClose}
              className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-full border border-brand-ink bg-brand-gold px-6 py-3.5 text-base font-extrabold text-brand-ink shadow-cta transition-transform hover:-translate-y-0.5 hover:bg-brand-gold-hover"
            >
              <span aria-hidden="true">💬</span>
              <span>{dict.orderByChatCta}</span>
              <span aria-hidden="true">→</span>
            </Link>
            <p className="mt-2 text-center text-[11px] text-brand-ink-muted">
              {dict.directChatNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
