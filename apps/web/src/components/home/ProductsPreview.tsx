'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@attieke-chat/shared';
import type { HomeDictionary } from '@/data/mock/home';
import { useFeaturedProducts } from '@/hooks/useCatalog';
import { formatPriceYuan } from '@/lib/i18n';

interface ProductsPreviewProps {
  locale: Locale;
  dict: HomeDictionary['products'];
}

export function ProductsPreview({
  locale,
  dict,
}: ProductsPreviewProps): React.JSX.Element {
  const { products, isLoading, error, reload } = useFeaturedProducts(3);

  return (
    <section
      id="products"
      aria-labelledby="products-heading"
      className="scroll-mt-20 py-14 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-brand-ink/15 bg-white px-3.5 py-1 text-xs font-extrabold text-brand-green">
            {dict.sectionBadge}
          </span>
          <h2
            id="products-heading"
            className="mt-3 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl"
          >
            {dict.sectionTitle}
          </h2>
          <p className="mt-3 text-sm text-brand-ink-muted sm:text-base">
            {dict.sectionSubtitle}
          </p>
        </div>

        {/* État de chargement (Squelettes accessibles) */}
        {isLoading && (
          <div
            role="status"
            aria-label={dict.loadingLabel}
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
          >
            {[0, 1, 2].map((skeletonId) => (
              <div
                key={skeletonId}
                className="flex flex-col overflow-hidden rounded-[2rem] border border-brand-ink/10 bg-brand-cream-card p-5 shadow-card animate-pulse"
              >
                <div className="aspect-[16/10] w-full rounded-2xl bg-brand-cream-subtle" />
                <div className="mt-5 h-5 w-3/4 rounded-lg bg-brand-cream-subtle" />
                <div className="mt-3 h-4 w-full rounded-lg bg-brand-cream-subtle" />
                <div className="mt-2 h-4 w-2/3 rounded-lg bg-brand-cream-subtle" />
                <div className="mt-6 h-12 w-full rounded-full bg-brand-cream-subtle" />
              </div>
            ))}
          </div>
        )}

        {/* État d'erreur */}
        {!isLoading && error && (
          <div
            role="alert"
            className="mx-auto mt-10 max-w-md rounded-3xl border border-red-200 bg-white p-6 text-center shadow-sm"
          >
            <p className="text-sm font-bold text-red-700">{dict.errorMessage}</p>
            <button
              type="button"
              onClick={() => void reload()}
              className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full border border-brand-ink bg-brand-gold px-6 py-2 text-xs font-extrabold text-brand-ink hover:bg-brand-gold-hover"
            >
              {dict.retryButton}
            </button>
          </div>
        )}

        {/* État vide */}
        {!isLoading && !error && products.length === 0 && (
          <div className="mx-auto mt-10 max-w-md rounded-3xl border border-brand-ink/10 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-semibold text-brand-ink-muted">
              {dict.emptyMessage}
            </p>
          </div>
        )}

        {/* 3 Cartes Produits issues de CatalogService */}
        {!isLoading && !error && products.length > 0 && (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {products.map((product) => {
              const name = product.name[locale];
              const shortDesc = product.shortDescription[locale];
              const formatLabel = product.formatLabel[locale];
              const formattedPrice = formatPriceYuan(product.priceYuan, locale);
              const formattedWeight = `${product.weightKg} ${dict.weightUnit}`;

              return (
                <article
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-[2rem] border border-brand-ink/10 bg-brand-cream-card shadow-card transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-cream-subtle">
                    <Image
                      src={product.imageSrc}
                      alt={name}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {product.featured && (
                      <span className="absolute top-3.5 left-3.5 rounded-full border border-brand-ink bg-brand-gold px-3 py-1 text-xs font-extrabold text-brand-ink shadow-sm">
                        ★ {dict.popularBadge}
                      </span>
                    )}
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-brand-ink/85 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                      <span
                        className="h-2 w-2 rounded-full bg-[#25D366]"
                        aria-hidden="true"
                      />
                      <span>{dict.inStockBadge}</span>
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-extrabold text-brand-ink sm:text-xl">
                          {name}
                        </h3>
                        <span className="shrink-0 rounded-full border border-brand-ink/10 bg-brand-cream px-3 py-1 text-xs font-extrabold text-brand-ink">
                          {formattedWeight}
                        </span>
                      </div>

                      <p className="mt-1 text-xs font-semibold text-brand-green">
                        {formatLabel}
                      </p>

                      <p className="mt-2.5 text-sm leading-relaxed text-brand-ink-muted">
                        {shortDesc}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-brand-ink/10">
                      <div className="flex items-baseline justify-between mb-4">
                        <span className="text-xs font-bold text-brand-ink-muted">
                          {formattedWeight}
                        </span>
                        <span className="text-2xl font-extrabold text-brand-green">
                          {formattedPrice}
                        </span>
                      </div>

                      <Link
                        href={`/${locale}/chat?product=${encodeURIComponent(product.slug)}`}
                        className="flex min-h-[50px] w-full items-center justify-center gap-2.5 rounded-full border border-brand-ink bg-brand-gold px-5 py-3 text-sm font-extrabold text-brand-ink shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green sm:text-base"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-4 w-4 shrink-0 text-brand-ink"
                          aria-hidden="true"
                        >
                          <path d="M12 2C6.48 2 2 6.04 2 11.02c0 2.38 1.03 4.55 2.72 6.17L3.5 22l5.02-1.32c1.1.34 2.27.52 3.48.52 5.52 0 10-4.04 10-9.02S17.52 2 12 2z" />
                        </svg>
                        <span>{dict.orderByChatCta}</span>
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Lien vers le Catalogue complet (8 produits) */}
        <div className="mt-10 text-center">
          <Link
            href={`/${locale}/catalog`}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-full border-2 border-brand-ink bg-white px-7 py-3 text-sm font-extrabold text-brand-ink shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-green hover:text-white sm:text-base"
          >
            <span>{dict.viewAllCatalogCta}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
