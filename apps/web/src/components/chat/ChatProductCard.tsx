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
    <div className="w-full max-w-xs overflow-hidden rounded-2xl border border-brand-ink/10 bg-white p-3 text-brand-ink shadow-sm">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-brand-cream-subtle">
        <Image
          src={product.imageSrc}
          alt={product.name[locale]}
          fill
          sizes="300px"
          className="object-cover"
        />
        <span className="absolute bottom-2 left-2 rounded-full bg-brand-ink/80 px-2.5 py-0.5 text-[10px] font-bold text-[#25D366]">
          ● {dict.inStock}
        </span>
      </div>

      <div className="mt-3">
        <h3 className="text-sm font-extrabold text-brand-ink sm:text-base">
          {product.name[locale]}
        </h3>
        <p className="mt-0.5 text-xs text-brand-ink-muted">
          {product.formatLabel[locale]}
        </p>

        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-lg font-extrabold text-brand-green">
            {formatPriceYuan(product.priceYuan * quantity, locale)}
          </span>

          {/* Sélecteur de quantité */}
          <div
            role="group"
            aria-label={dict.quantityLabel}
            className="inline-flex items-center gap-2 rounded-full border border-brand-ink/15 bg-brand-cream px-2 py-0.5"
          >
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-extrabold text-brand-ink hover:bg-white"
              aria-label="-"
            >
              −
            </button>
            <span className="min-w-[18px] text-center text-xs font-extrabold">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-extrabold text-brand-ink hover:bg-white"
              aria-label="+"
            >
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          disabled={isBusy}
          onClick={() => void onAddToOrder(product.id, quantity)}
          className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-brand-ink bg-brand-gold px-4 py-2.5 text-xs font-extrabold text-brand-ink shadow-sm transition-colors hover:bg-brand-gold-hover disabled:opacity-60 sm:text-sm"
        >
          <span aria-hidden="true">🛒</span>
          <span>{isBusy ? dict.addingToOrder : dict.addToOrderButton}</span>
        </button>
      </div>
    </div>
  );
}
