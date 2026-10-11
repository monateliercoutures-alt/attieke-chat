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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-wa-border bg-wa-panel p-5 text-wa-text-primary shadow-wa-panel sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton Fermer */}
        <button
          type="button"
          onClick={onClose}
          aria-label={dict.closeAria}
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-wa-border bg-wa-panel text-wa-preview font-semibold text-wa-text-primary shadow-wa-bubble hover:bg-wa-composer"
        >
          ✕
        </button>

        {/* Image HD du produit */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-wa-composer">
          <Image
            src={product.imageSrc}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, 560px"
            className="object-cover"
          />
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-wa-panel/90 px-3 py-1 text-wa-meta font-semibold text-wa-accent">
            ● {cardDict.inStock}
          </span>
        </div>

        {/* Titre & Prix */}
        <div className="mt-4">
          <div className="flex items-start justify-between gap-3">
            <h2
              id="product-modal-title"
              className="wa-text-title text-wa-text-primary"
            >
              {name}
            </h2>
            <span className="shrink-0 text-wa-title font-semibold text-wa-dark-green dark:text-wa-accent">
              {totalPrice}
            </span>
          </div>

          <p className="mt-2.5 text-wa-body text-wa-text-secondary">
            {fullDesc}
          </p>

          {/* Caractéristiques : Format & Poids */}
          <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-wa-border bg-wa-composer p-3 text-wa-preview">
            <div>
              <dt className="text-wa-meta text-wa-text-secondary">
                {dict.formatLabel}
              </dt>
              <dd className="mt-0.5 font-medium text-wa-text-primary">
                {formatLabel}
              </dd>
            </div>
            <div>
              <dt className="text-wa-meta text-wa-text-secondary">
                {dict.weightLabel}
              </dt>
              <dd className="mt-0.5 font-medium text-wa-text-primary">
                {product.weightKg} {cardDict.weightUnit}
              </dd>
            </div>
          </dl>

          {/* Conseils de préparation */}
          <div className="mt-3.5 rounded-xl bg-wa-bubble-out p-3.5 text-wa-preview">
            <p className="font-semibold text-wa-dark-green dark:text-wa-accent">
              🍳 {dict.prepTipsTitle}
            </p>
            <p className="mt-1 text-wa-text-primary">{prepTips}</p>
          </div>

          {/* Sélecteur de quantité */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-wa-preview font-medium text-wa-text-primary">
              {dict.quantityLabel}
            </span>
            <div className="inline-flex items-center gap-3 rounded-full border border-wa-border bg-wa-composer px-3 py-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-wa-panel text-wa-contact font-semibold text-wa-text-primary shadow-wa-bubble"
                aria-label="-"
              >
                −
              </button>
              <span className="min-w-[24px] text-center text-wa-preview font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-wa-panel text-wa-contact font-semibold text-wa-text-primary shadow-wa-bubble"
                aria-label="+"
              >
                +
              </button>
            </div>
          </div>

          {/* Bouton principal de commerce : Jaune doré #F2B705 ("Commander par chat") */}
          <div className="mt-5">
            <Link
              href={`/${locale}/chat?product=${encodeURIComponent(
                product.slug
              )}`}
              onClick={onClose}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-wa-bubble bg-wa-commerce px-6 py-3 text-wa-contact font-semibold text-wa-commerce-text shadow-wa-bubble transition-colors duration-fast hover:bg-wa-commerce-hover"
            >
              <span aria-hidden="true">💬</span>
              <span>{dict.orderByChatCta}</span>
              <span aria-hidden="true">→</span>
            </Link>
            <p className="mt-2 text-center text-wa-meta text-wa-text-secondary">
              {dict.directChatNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
