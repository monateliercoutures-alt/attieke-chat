'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { Locale, Product } from '@attieke-chat/shared';
import type { ChatDictionary } from '@/lib/i18n';
import { formatPriceYuan } from '@/lib/i18n';

interface ChatProductCardProps {
  product: Product;
  locale: Locale;
  dict: ChatDictionary['productCard'];
  isBusy: boolean;
  onAddToOrder: (productId: string, quantity: number) => Promise<void>;
}

export function ChatProductCard({
  product,
  locale,
  dict,
  isBusy,
  onAddToOrder,
}: ChatProductCardProps): React.JSX.Element {
  const [quantity, setQuantity] = useState<number>(1);

  return (
    <div className="w-full max-w-xs overflow-hidden rounded-wa-bubble border border-wa-border bg-wa-bubble-in p-2.5 text-wa-text-primary shadow-wa-bubble">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-wa-bubble bg-wa-composer">
        <Image
          src={product.imageSrc}
          alt={product.name[locale]}
          fill
          sizes="300px"
          className="object-cover"
        />
        <span className="absolute bottom-2 left-2 rounded-full bg-wa-panel/90 px-2.5 py-0.5 text-wa-meta font-semibold text-wa-accent">
          ● {dict.inStock}
        </span>
      </div>

      <div className="mt-2.5">
        <h3 className="text-wa-contact font-medium text-wa-text-primary">
          {product.name[locale]}
        </h3>
        <p className="mt-0.5 text-wa-meta text-wa-text-secondary">
          {product.formatLabel[locale]}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-wa-contact font-semibold text-wa-dark-green dark:text-wa-accent">
            {formatPriceYuan(product.priceYuan * quantity, locale)}
          </span>

          {/* Sélecteur de quantité */}
          <div
            role="group"
            aria-label={dict.quantityLabel}
            className="inline-flex items-center gap-2 rounded-full border border-wa-border bg-wa-composer px-2 py-0.5"
          >
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full text-wa-preview font-semibold text-wa-text-primary hover:bg-wa-panel"
              aria-label="-"
            >
              −
            </button>
            <span className="min-w-[18px] text-center text-wa-preview font-semibold">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full text-wa-preview font-semibold text-wa-text-primary hover:bg-wa-panel"
              aria-label="+"
            >
              +
            </button>
          </div>
        </div>

        {/* Bouton de commerce : Jaune doré #F2B705 exclusivement */}
        <button
          type="button"
          disabled={isBusy}
          onClick={() => void onAddToOrder(product.id, quantity)}
          className="mt-2.5 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-wa-bubble bg-wa-commerce px-4 py-2 text-wa-preview font-semibold text-wa-commerce-text shadow-wa-bubble transition-colors duration-fast hover:bg-wa-commerce-hover disabled:opacity-60"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
            />
          </svg>
          <span>{isBusy ? dict.addingToOrder : dict.addToOrderButton}</span>
        </button>
      </div>
    </div>
  );
}
